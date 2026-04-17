import { useEffect, useState } from 'react';
import mqtt from 'mqtt';

interface Sensores {
  oxigeno_mg_L: number;
  temperatura_C: number;
  ppm: number;
}

function App() {
  const [telemetria, setTelemetria] = useState<Sensores | null>(null);
  const [estadoConexion, setEstadoConexion] = useState<string>('Desconectado 🔴');
  // NUEVO: Guardamos el cliente MQTT para poder enviar mensajes después
  const [clienteMqtt, setClienteMqtt] = useState<mqtt.MqttClient | null>(null);

  // Definimos nuestros dos canales (Topics)
  const TOPIC_TELEMETRIA = 'acuaODS/simulacion/telemetria/equipo_carlos_alex';
  const TOPIC_CONTROL = 'acuaODS/simulacion/control/equipo_carlos_alex';

  useEffect(() => {
    const client = mqtt.connect('ws://broker.emqx.io:8083/mqtt');
    setClienteMqtt(client); // Lo guardamos en el estado
    
    client.on('connect', () => {
      setEstadoConexion('Conectado ✅');
      client.subscribe(TOPIC_TELEMETRIA);
    });

    client.on('message', (topic, message) => {
      // Solo leemos si el mensaje viene del topic de telemetría
      if (topic === TOPIC_TELEMETRIA) {
        try {
          const datos = JSON.parse(message.toString());
          setTelemetria(datos.sensores);
        } catch (error) {
          console.error("Error al procesar el mensaje:", error);
        }
      }
    });

    return () => { client.end() };
  }, []);

  // --- NUEVO: FUNCIÓN PARA ENVIAR ÓRDENES ---
  const enviarComando = (equipo: string, accion: string) => {
    if (clienteMqtt) {
      const comandoJSON = JSON.stringify({ equipo, accion });
      clienteMqtt.publish(TOPIC_CONTROL, comandoJSON);
      alert(`Orden enviada: ${accion} el ${equipo}`); // Pequeño aviso visual
    } else {
      alert("Error: No hay conexión con el servidor.");
    }
  };

  // --- LÓGICA DE REGLAS DE OPERACIÓN ---
  const getEstadoO2 = (o2: number) => {
    if (o2 >= 5.0) return { texto: 'ÓPTIMO', color: '#4caf50' };
    if (o2 >= 3.0) return { texto: 'ESTRÉS', color: '#ff9800' };
    return { texto: 'CRÍTICO', color: '#f44336' };
  };

  const getEstadoTemp = (temp: number) => {
    if (temp >= 26.0 && temp <= 30.0) return { texto: 'ÓPTIMO', color: '#4caf50' };
    if (temp >= 22.0 && temp < 26.0) return { texto: 'ESTRÉS FRÍO', color: '#ff9800' };
    return { texto: 'CRÍTICO', color: '#f44336' };
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>Dashboard AcuaMonitoreoODS</h1>
      <p>Estado del Servidor: <strong>{estadoConexion}</strong></p>
      
      {telemetria ? (
        <>
          <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
            <div style={{ padding: '20px', borderRadius: '10px', backgroundColor: getEstadoO2(telemetria.oxigeno_mg_L).color, flex: 1, textAlign: 'center' }}>
              <h2>Oxígeno Disuelto</h2>
              <p style={{ fontSize: '3em', margin: '10px 0', fontWeight: 'bold' }}>{telemetria.oxigeno_mg_L} mg/L</p>
              <h3>{getEstadoO2(telemetria.oxigeno_mg_L).texto}</h3>
            </div>
            <div style={{ padding: '20px', borderRadius: '10px', backgroundColor: getEstadoTemp(telemetria.temperatura_C).color, flex: 1, textAlign: 'center' }}>
              <h2>Temperatura</h2>
              <p style={{ fontSize: '3em', margin: '10px 0', fontWeight: 'bold' }}>{telemetria.temperatura_C} °C</p>
              <h3>{getEstadoTemp(telemetria.temperatura_C).texto}</h3>
            </div>
          </div>

          {/* NUEVO: PANEL DE CONTROL */}
          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#1e1e1e', borderRadius: '10px', textAlign: 'center' }}>
            <h2>Panel de Acciones de Emergencia</h2>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '15px' }}>
              <button 
                onClick={() => enviarComando('Aireador', 'Encender')}
                style={{ padding: '15px 30px', fontSize: '1.1em', cursor: 'pointer', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px' }}>
                💨 Activar Aireador
              </button>
              <button 
                onClick={() => enviarComando('Calentador', 'Encender')}
                style={{ padding: '15px 30px', fontSize: '1.1em', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px' }}>
                🔥 Activar Calentador
              </button>
            </div>
          </div>
        </>
      ) : (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#1e1e1e', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ fontSize: '1.2em', color: '#888' }}>⏳ Esperando datos del simulador en Python...</p>
        </div>
      )}
    </div>
  );
}

export default App;