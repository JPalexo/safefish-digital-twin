import paho.mqtt.client as mqtt
import json
import time
import random

BROKER = "broker.emqx.io"
PORT = 8083
TOPIC_TELEMETRIA = "acuaODS/simulacion/telemetria/equipo_carlos_alex"
TOPIC_CONTROL = "acuaODS/simulacion/control/equipo_carlos_alex"

# 1. VARIABLES DE ESTADO (La "Memoria" física de tu estanque)
# Iniciamos con valores bajos para obligar al usuario a tomar acción
estado_agua = {
    "oxigeno": 2.5,      # Nivel CRÍTICO
    "temperatura": 20.0, # Nivel CRÍTICO FRÍO
    "ppm": 0.5           # Agua limpia
}

# 2. ESTADO DE LOS ACTUADORES (Bandera para saber si están prendidos o apagados)
actuadores = {
    "Aireador": False,
    "Calentador": False
}

def on_connect(client, userdata, flags, reason_code, properties):
    print("Conectado al broker...")
    client.subscribe(TOPIC_CONTROL)
    print(f"Escuchando órdenes del dashboard en: {TOPIC_CONTROL}\n")

def on_message(client, userdata, msg):
    global actuadores
    try:
        orden = json.loads(msg.payload.decode())
        equipo = orden.get("equipo")
        accion = orden.get("accion")

        print("\n" + "="*50)
        print(f"🚨 ORDEN RECIBIDA DEL DASHBOARD: {accion} {equipo} 🚨")
        print("="*50 + "\n")

        # Modificamos la memoria de los actuadores según el botón que se presionó
        if equipo in actuadores:
            if accion == "Encender":
                actuadores[equipo] = True
            elif accion == "Apagar":
                actuadores[equipo] = False

    except Exception as e:
        print(f"Error procesando orden: {e}")

# Configuración MQTT
cliente = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, transport="websockets")
cliente.on_connect = on_connect
cliente.on_message = on_message
cliente.connect(BROKER, PORT, 60)
cliente.loop_start() 

print("Iniciando Gemelo Digital AcuaMonitoreoODS...")

try:
    while True:
        # 3. LÓGICA DEL ENTORNO BIOLÓGICO (La física del agua)
        
        # --- Dinámica del Oxígeno ---
        if actuadores["Aireador"]:
            estado_agua["oxigeno"] += 0.5  # Si está prendido, el oxígeno sube rápido
        else:
            estado_agua["oxigeno"] -= 0.1  # Si está apagado, baja lentamente (consumo de los peces)
            
        # --- Dinámica de la Temperatura ---
        if actuadores["Calentador"]:
            estado_agua["temperatura"] += 0.5  # El calentador calienta el agua
        else:
            estado_agua["temperatura"] -= 0.1  # Pérdida natural de calor hacia el ambiente
            
        # --- Dinámica de Desechos (PPM) ---
        estado_agua["ppm"] += random.uniform(0.01, 0.03) # La suciedad siempre aumenta poco a poco
        
        # Añadimos un micro-ruido aleatorio para que los números en pantalla se vean orgánicos
        estado_agua["oxigeno"] += random.uniform(-0.05, 0.05)
        estado_agua["temperatura"] += random.uniform(-0.05, 0.05)

        # 4. LIMITADORES FÍSICOS (Evitamos que el agua llegue a 1000 grados o -50 de oxígeno)
        estado_agua["oxigeno"] = max(1.0, min(8.0, round(estado_agua["oxigeno"], 1)))
        estado_agua["temperatura"] = max(18.0, min(34.0, round(estado_agua["temperatura"], 1)))
        estado_agua["ppm"] = max(0.0, min(2.0, round(estado_agua["ppm"], 2)))

        # 5. EMPAQUETAR Y ENVIAR
        payload = {
            "estanque_id": "sim_basico_01",
            "sensores": {
                "oxigeno_mg_L": estado_agua["oxigeno"],
                "temperatura_C": estado_agua["temperatura"],
                "ppm": estado_agua["ppm"]
            }
        }
        
        mensaje_json = json.dumps(payload)
        cliente.publish(TOPIC_TELEMETRIA, mensaje_json)
        
        # Monitor en consola
        st_air = "ON" if actuadores["Aireador"] else "OFF"
        st_cal = "ON" if actuadores["Calentador"] else "OFF"
        print(f"Temp: {estado_agua['temperatura']}°C [Calentador:{st_cal}] | O2: {estado_agua['oxigeno']}mg/L [Aireador:{st_air}]")
        
        time.sleep(3)
        
except KeyboardInterrupt:
    print("\nSimulador detenido por el usuario.")
    cliente.loop_stop()
    cliente.disconnect()