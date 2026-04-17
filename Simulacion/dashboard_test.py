import paho.mqtt.client as mqtt
import json

BROKER = "broker.hivemq.com"
PORT = 1883
TOPIC = "acuaODS/simulacion/telemetria"

# 1. Función actualizada para Paho MQTT v2.0+ (Nuevos parámetros)
def on_connect(client, userdata, flags, reason_code, properties):
    print(f"Conectado al Broker con código de resultado: {reason_code}")
    client.subscribe(TOPIC)
    print(f"Suscrito y escuchando en el topic: {TOPIC}...\n")

def on_message(client, userdata, msg):
    try:
        datos = json.loads(msg.payload.decode())
        oxigeno = datos["sensores"]["oxigeno_mg_L"]
        temperatura = datos["sensores"]["temperatura_C"]
        
        alerta_o2 = "⚠️ CRÍTICO" if oxigeno < 3.0 else "✅ OK"
        
        print("-" * 30)
        print(f"NUEVO DATO RECIBIDO:")
        print(f"🌡️ Temp: {temperatura}°C | 🫧 O2: {oxigeno} mg/L [{alerta_o2}]")
    except Exception as e:
        print(f"Error procesando mensaje: {e}")

# 2. Actualización de cliente a v2.0+
cliente = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
cliente.on_connect = on_connect
cliente.on_message = on_message

print("Conectando al broker...")
cliente.connect(BROKER, PORT, 60)
cliente.loop_forever()