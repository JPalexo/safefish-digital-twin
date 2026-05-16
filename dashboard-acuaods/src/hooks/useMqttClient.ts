// src/hooks/useMqttClient.ts
import { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import type { Sensores } from '../types';

// Aquí podemos definir constantes que antes ensuciaban el App.tsx
const BROKER_URL = 'ws://broker.hivemq.com:8000/mqtt';
const TOPIC_TELEMETRIA = 'acuaODS/simulacion/telemetria/equipo_carlos_alex';
const TOPIC_CONTROL = 'acuaODS/simulacion/control/equipo_carlos_alex';

export const useMqttClient = () => {
  const [telemetria, setTelemetria] = useState<Sensores | null>(null);
  const [conectado, setConectado] = useState<boolean>(false);
  const [clienteMqtt, setClienteMqtt] = useState<mqtt.MqttClient | null>(null);

  useEffect(() => {
    const client = mqtt.connect(BROKER_URL);
    setClienteMqtt(client);

    client.on('connect', () => {
      setConectado(true);
      client.subscribe(TOPIC_TELEMETRIA);
    });

    client.on('disconnect', () => setConectado(false));
    client.on('offline', () => setConectado(false));

    client.on('message', (topic, message) => {
      if (topic === TOPIC_TELEMETRIA) {
        try {
          const datos = JSON.parse(message.toString());
          setTelemetria(datos.sensores);
        } catch (error) {
          console.error("Error al procesar el mensaje MQTT:", error);
        }
      }
    });

    // Cleanup: Desconectar cuando se cierre la app
    return () => {
      client.end();
    };
  }, []);

  // Función para que los botones envíen órdenes sin saber cómo funciona MQTT
  const enviarComando = (equipo: string, accion: string) => {
    if (clienteMqtt) {
      const comandoJSON = JSON.stringify({ equipo, accion });
      clienteMqtt.publish(TOPIC_CONTROL, comandoJSON);
    }
  };

  // Exponemos solo lo que la interfaz necesita
  return {
    telemetria,
    conectado,
    enviarComando
  };
};