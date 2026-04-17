import tkinter as tk
from tkinter import scrolledtext
import paho.mqtt.client as mqtt
import json
import queue

# --- CONFIGURACIÓN MQTT ---
BROKER = "broker.emqx.io"
PORT = 8083
TOPIC = "acuaODS/simulacion/telemetria/equipo_carlos_alex"

cola_mensajes = queue.Queue()

def on_connect(client, userdata, flags, reason_code, properties):
    cola_mensajes.put(f"✅ Conectado al entorno didáctico (Broker: {BROKER})")
    client.subscribe(TOPIC)
    cola_mensajes.put(f"📡 Monitoreando estanque en: {TOPIC}...\n" + "="*55)

def on_message(client, userdata, msg):
    try:
        datos = json.loads(msg.payload.decode())
        oxigeno = datos["sensores"]["oxigeno_mg_L"]
        temperatura = datos["sensores"]["temperatura_C"]
        ppm = datos["sensores"]["ppm"]
        
        # --- LÓGICA DE REGLAS DE OPERACIÓN ---
        
        # 1. Oxígeno Disuelto
        if 5.0 <= oxigeno <= 7.0:
            alerta_o2 = "🟢 ÓPTIMO" # [cite: 836]
        elif 3.0 <= oxigeno < 5.0:
            alerta_o2 = "🟡 ESTRÉS (Alerta preventiva)" # [cite: 837]
        else:
            alerta_o2 = "🔴 CRÍTICO (Requiere aireador)" # [cite: 838]
            
        # 2. Temperatura
        if 26.0 <= temperatura <= 30.0:
            alerta_temp = "🟢 ÓPTIMO" # [cite: 840]
        elif 22.0 <= temperatura < 26.0:
            alerta_temp = "🟡 ESTRÉS FRÍO (Requiere calentador)" # [cite: 840, 841]
        elif temperatura < 20.0:
            alerta_temp = "🔴 CRÍTICO FRÍO (Letargo/Peligro)" # [cite: 841]
        elif 31.0 <= temperatura <= 33.0:
            alerta_temp = "🟠 ESTRÉS CALOR (Baja retención de O2)" # [cite: 842]
        else:
            alerta_temp = "⚪ FUERA DE RANGO"

        # 3. PPM
        if 0.0 <= ppm <= 0.5:
            alerta_ppm = "🟢 ÓPTIMO" # [cite: 844]
        elif ppm > 1.0:
            alerta_ppm = "🔴 CRÍTICO (Cambio de agua/Filtración)" # [cite: 844, 845]
        else:
            alerta_ppm = "🟡 PRECAUCIÓN" 

        # Formateamos el mensaje para el Log Didáctico
        log_msg = (f"🐟 ESTADO DEL ESTANQUE:\n"
                   f"   🫧 O2: {oxigeno} mg/L -> {alerta_o2}\n"
                   f"   🌡️ Temp: {temperatura}°C -> {alerta_temp}\n"
                   f"   💩 PPM: {ppm} -> {alerta_ppm}\n"
                   f"{"-"*55}")
        cola_mensajes.put(log_msg)
    except Exception as e:
        cola_mensajes.put(f"❌ Error leyendo dato: {e}")

# --- INTERFAZ GRÁFICA (Estilo Educativo/Acuícola) ---
def actualizar_pantalla():
    while not cola_mensajes.empty():
        mensaje = cola_mensajes.get()
        caja_log.insert(tk.END, mensaje + "\n")
        caja_log.see(tk.END)
    ventana.after(100, actualizar_pantalla)

ventana = tk.Tk()
ventana.title("AcuaMonitoreoODS - Entorno Didáctico")
ventana.geometry("650x500")

# Colores educativos (Azul claro de fondo)
ventana.configure(bg="#E1F5FE") 

# Título principal
etiqueta_titulo = tk.Label(ventana, text="Simulador Didáctico de Calidad del Agua", fg="#01579B", bg="#E1F5FE", font=("Helvetica", 16, "bold"))
etiqueta_titulo.pack(pady=10)

# Subtítulo
etiqueta_sub = tk.Label(ventana, text="Especie: Tilapia / Mojarra", fg="#0277BD", bg="#E1F5FE", font=("Helvetica", 12, "italic"))
etiqueta_sub.pack(pady=0)

# Caja de texto (Fondo blanco, texto oscuro para fácil lectura)
caja_log = scrolledtext.ScrolledText(ventana, width=75, height=20, bg="#FFFFFF", fg="#263238", font=("Consolas", 11), relief=tk.FLAT)
caja_log.pack(padx=20, pady=15)

# --- INICIO MQTT ---
cliente = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, transport="websockets")
cliente.on_connect = on_connect
cliente.on_message = on_message

cliente.connect(BROKER, PORT, 60)
cliente.loop_start() 

ventana.after(100, actualizar_pantalla)
ventana.mainloop()

cliente.loop_stop()
cliente.disconnect()