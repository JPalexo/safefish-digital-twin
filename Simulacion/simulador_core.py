import paho.mqtt.client as mqtt
import json
import time
import random
import os
import math
import threading
from dotenv import load_dotenv

load_dotenv()

BROKER           = os.getenv("MQTT_BROKER",    "broker.hivemq.com")
PORT             = int(os.getenv("MQTT_PORT",  1883))
TOPIC_TELEMETRIA = os.getenv("TOPIC_TELEMETRIA", "acuaODS/simulacion/telemetria/equipo_carlos_alex")
TOPIC_CONTROL    = os.getenv("TOPIC_CONTROL",    "acuaODS/simulacion/control/equipo_carlos_alex")
TOPIC_ACK        = os.getenv("TOPIC_ACK",        "acuaODS/simulacion/ack/equipo_carlos_alex")

print("\n" + "="*50)
print("🔧 INICIANDO GEMELO DIGITAL SAFEFISH v2")
print(f"📡 Broker: {BROKER} | Puerto: {PORT}")
print("="*50 + "\n")

# ---------------------------------------------------------------------------
# CONSTANTES BIOLÓGICAS — Oreochromis niloticus
# ---------------------------------------------------------------------------
MULTIPLICADOR_TIEMPO = 50.0          # Acelerador de tiempo para demos
INTERVALO_CICLO      = 3.0           # Segundos reales por ciclo
DELTA_T_DIAS         = (INTERVALO_CICLO * MULTIPLICADOR_TIEMPO) / 86400.0

FACTOR_CONSUMO_O2    = 150.0         # mg O2 · kg⁻¹ · ciclo⁻¹ base
COEF_Q10             = 0.05          # Coeficiente exponencial metabólico
TASA_CRECIMIENTO     = 0.003         # kg · kg⁻¹ · día⁻¹ (FCR conservador)
EXCRECION_NH3        = 0.03          # mg NH3 · kg⁻¹ · ciclo⁻¹
BIOFILTRO_NH3        = 0.08          # Fracción NH3 removida con filtro activo
GENERACION_SOLIDOS   = 50.0          # mg sólidos · kg⁻¹ · ciclo⁻¹

# ---------------------------------------------------------------------------
# ESTADO CENTRAL — protegido con Lock (on_message corre en hilo de red)
# ---------------------------------------------------------------------------
_lock = threading.Lock()

estado_agua = {
    "oxigeno"          : 6.5,
    "temperatura"      : 24.0,
    "ppm"              : 2.0,
    "nh3"              : 0.02,   # mg/L NH3 libre — nuevo parámetro
    "biomasa_kg"       : 0.0,
    "edad_dias"        : 0.0,
    "simulacion_activa": False
}

VOLUMEN_LITROS = 10000.0

actuadores = {
    "Aireador"  : False,
    "Calentador": False,
    "Filtro"    : False
}

# ---------------------------------------------------------------------------
# CALLBACKS
# ---------------------------------------------------------------------------
def on_connect(client, userdata, flags, reason_code, properties=None):
    print("✅ Conectado al broker MQTT exitosamente.")
    client.subscribe(TOPIC_CONTROL)

def on_message(client, userdata, msg):
    global VOLUMEN_LITROS
    try:
        payload_str = msg.payload.decode()
        if "{" not in payload_str:
            return

        orden  = json.loads(payload_str)
        equipo = orden.get("equipo", "")
        accion = str(orden.get("accion", ""))

        # HANDSHAKE
        if equipo == "Sistema" and accion.startswith("iniciar:"):
            partes = accion.split(":")
            if len(partes) < 3:
                print("⚠️ Handshake malformado.")
                return

            kilos      = float(partes[1])
            volumen_m3 = float(partes[2])
            edad_ini   = float(partes[3]) if len(partes) > 3 else 0.0

            with _lock:
                VOLUMEN_LITROS                   = volumen_m3 * 1000.0
                estado_agua["biomasa_kg"]        = kilos
                estado_agua["edad_dias"]         = edad_ini
                estado_agua["simulacion_activa"] = True

            print(f"\n🚀 SIMULACIÓN INICIADA: {VOLUMEN_LITROS:.0f} L | {kilos} kg | edad: {edad_ini:.0f} días\n")

            # ACK al frontend
            ack = json.dumps({
                "tipo"   : "handshake_ok",
                "biomasa": kilos,
                "volumen": VOLUMEN_LITROS,
                "mensaje": "Motor físico iniciado correctamente."
            })
            client.publish(TOPIC_ACK, ack)
            return

        # ACTUADORES
        with _lock:
            if equipo in actuadores:
                actuadores[equipo] = (accion == "Encender")
                print(f"⚙️ ACTUADOR: {equipo} -> {'ON' if actuadores[equipo] else 'OFF'}")

    except Exception as e:
        print(f"⚠️ Error procesando orden: {e}")

# ---------------------------------------------------------------------------
# CLIENTE MQTT
# ---------------------------------------------------------------------------
cliente = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
cliente.on_connect = on_connect
cliente.on_message = on_message
cliente.connect(BROKER, PORT, 60)
cliente.loop_start()

print("⏳ Esperando parámetros desde el Dashboard (React)...")

# ---------------------------------------------------------------------------
# BUCLE FÍSICO
# ---------------------------------------------------------------------------
try:
    while True:

        with _lock:
            sim_activa = estado_agua["simulacion_activa"]
            vol        = VOLUMEN_LITROS
            act        = dict(actuadores)
            temp       = estado_agua["temperatura"]
            o2         = estado_agua["oxigeno"]
            ppm        = estado_agua["ppm"]
            nh3        = estado_agua["nh3"]
            biomasa    = estado_agua["biomasa_kg"]
            edad       = estado_agua["edad_dias"]

        if sim_activa:

            # 1. LEY DE HENRY — OD de saturación (Benson-Krause)
            od_saturacion = 14.65 - (0.41 * temp) + (0.0079 * (temp ** 2))

            # 2. TEMPERATURA
            if act["Calentador"]:
                nueva_temp = temp + 0.2
            else:
                nueva_temp = temp - (temp - 24.0) * 0.05
            nueva_temp += random.uniform(-0.02, 0.02)
            nueva_temp  = max(15.0, min(38.0, nueva_temp))

            # 3. CONSUMO METABÓLICO DE O2 (Q10 implícito)
            consumo_mg = FACTOR_CONSUMO_O2 * biomasa * math.exp(COEF_Q10 * temp)
            caida_o2   = (consumo_mg / vol) * MULTIPLICADOR_TIEMPO * 0.001

            # 4. REAIREACIÓN Y AIREACIÓN ARTIFICIAL
            recuperacion_natural = 0.03 * (od_saturacion - o2)
            aporte_aireador      = 0.5 if act["Aireador"] else 0.0

            nuevo_o2 = o2 + recuperacion_natural - caida_o2 + aporte_aireador
            nuevo_o2 += random.uniform(-0.01, 0.01)
            # CORRECCIÓN: techo siempre es od_saturacion — el aireador acelera
            # la recuperación pero no puede superar el límite físico de Henry
            nuevo_o2  = max(0.0, min(od_saturacion, nuevo_o2))

            # 5. SÓLIDOS SUSPENDIDOS (PPM / Turbidez)
            gen_solidos = (biomasa * GENERACION_SOLIDOS / vol) * MULTIPLICADOR_TIEMPO * 0.01
            if act["Filtro"]:
                nueva_ppm = ppm - ppm * 0.1
            else:
                nueva_ppm = ppm + gen_solidos
            nueva_ppm += random.uniform(-0.05, 0.05)
            nueva_ppm  = max(0.0, min(100.0, nueva_ppm))

            # 6. AMONIACO LIBRE — NH3 (parámetro crítico acuicultura)
            # Generado por catabolismo proteico, removido por biofiltro
            # Umbral tóxico tilapia: > 0.5 mg/L NH3 libre
            gen_nh3  = (biomasa * EXCRECION_NH3 / vol) * MULTIPLICADOR_TIEMPO * 0.01
            if act["Filtro"]:
                nueva_nh3 = nh3 - nh3 * BIOFILTRO_NH3
            else:
                nueva_nh3 = nh3 + gen_nh3
            nueva_nh3 += random.uniform(-0.001, 0.001)
            nueva_nh3  = max(0.0, min(10.0, nueva_nh3))

            # 7. CRECIMIENTO DE BIOMASA — Von Bertalanffy simplificado
            # Loop de retroalimentación: más biomasa → más consumo O2 y NH3
            nueva_biomasa = biomasa + biomasa * TASA_CRECIMIENTO * DELTA_T_DIAS
            nueva_edad    = edad + DELTA_T_DIAS

            # 8. ESCRITURA DE ESTADO bajo lock
            with _lock:
                estado_agua["temperatura"] = nueva_temp
                estado_agua["oxigeno"]     = nuevo_o2
                estado_agua["ppm"]         = nueva_ppm
                estado_agua["nh3"]         = nueva_nh3
                estado_agua["biomasa_kg"]  = nueva_biomasa
                estado_agua["edad_dias"]   = nueva_edad

            # 9. PAYLOAD
            # Campos originales preservados + campos nuevos agregados
            # El frontend original los ignora; el frontend nuevo los consume
            tiempo_simulado_min = round(nueva_edad * 1440, 1)

            payload = {
                "sensores": {
                    "oxigeno_mg_L" : round(nuevo_o2, 2),
                    "temperatura_C": round(nueva_temp, 1),
                    "ppm"          : round(nueva_ppm, 1),
                    "nh3_mg_L"     : round(nueva_nh3, 3),    # nuevo
                    "biomasa_kg"   : round(nueva_biomasa, 3) # nuevo
                },
                "actuadores": {                              # nuevo — sincronización frontend
                    "aireador"  : act["Aireador"],
                    "calentador": act["Calentador"],
                    "filtro"    : act["Filtro"]
                },
                "meta": {                                    # nuevo — contexto educativo
                    "multiplicador_tiempo": MULTIPLICADOR_TIEMPO,
                    "tiempo_simulado_min" : tiempo_simulado_min,
                    "od_saturacion"       : round(od_saturacion, 2)
                }
            }

            cliente.publish(TOPIC_TELEMETRIA, json.dumps(payload))

            print(
                f"O2: {nuevo_o2:.2f}/{od_saturacion:.2f} | "
                f"T: {nueva_temp:.1f}°C | "
                f"PPM: {nueva_ppm:.1f} | "
                f"NH3: {nueva_nh3:.3f} | "
                f"Bio: {nueva_biomasa:.3f} kg"
            )

        else:
            # Estado de reposo — misma estructura que el payload activo
            # para que el frontend no rompa al parsear
            payload_reposo = {
                "sensores": {
                    "oxigeno_mg_L" : 6.5,
                    "temperatura_C": 24.0,
                    "ppm"          : 0.0,
                    "nh3_mg_L"     : 0.0,
                    "biomasa_kg"   : 0.0
                },
                "actuadores": {"aireador": False, "calentador": False, "filtro": False},
                "meta"      : {"multiplicador_tiempo": MULTIPLICADOR_TIEMPO, "tiempo_simulado_min": 0}
            }
            cliente.publish(TOPIC_TELEMETRIA, json.dumps(payload_reposo))

        time.sleep(INTERVALO_CICLO)

except KeyboardInterrupt:
    print("\n🛑 Simulador detenido.")
    cliente.loop_stop()
    cliente.disconnect()