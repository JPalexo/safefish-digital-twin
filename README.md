# SafeFish 🐟 | Gemelo Digital e Interfaz HMI para Acuicultura Inteligente

SafeFish es un Gemelo Digital didáctico diseñado para modelar y monitorear el comportamiento termodinámico y biológico de un estanque acuícola de tilapias en tiempo real. Este sistema permite capacitar a productores y estudiantes en la gestión de variables críticas sin arriesgar infraestructura física ni vidas animales, alineándose directamente con el **ODS 2 (Hambre Cero)** y el **ODS 14 (Vida Submarina)**.

---

## 🚀 Características Clave

* **Arquitectura de Navegación Basada en Roles (SPA):** Flujo de trabajo profesional que incluye un Menú Principal (*Lobby*), un asistente de configuración paramétrica (*Wizard*) y el panel de control central (*Dashboard*).
* **Gestión de Biomasa por Cohortes (Lotes):** Permite registrar dinámicamente múltiples lotes de peces especificando etapa biológica, cantidad, peso promedio y edad.
* **Modelo Biomatemático Termodinámico acoplado:** El backend calcula el decaimiento de oxígeno disuelto empleando la **Ley de Henry para la Solubilidad de Gases**, acoplando la temperatura y la tasa metabólica exponencial de las especies.
* **Interfaz HMI/SCADA de Grado Industrial:** Panel de telemetría de alto contraste con alarmas síncronas (Web Audio API) ante umbrales críticos y control bidireccional de actuadores virtuales.

---

## 🛠️ Arquitectura y Tecnologías

El ecosistema utiliza un modelo de microservicios e IoT simulado con comunicación bidireccional por eventos:

* **Frontend:** React, TypeScript, Vite, React Router DOM. (Comunicación vía WebSockets mediante protocolo MQTT, Puerto 8000).
* **Backend:** Python 3.10+, Paho-MQTT, Python-Dotenv. (Comunicación nativa TCP mediante protocolo MQTT, Puerto 1883).
* **Broker de Red:** HiveMQ Corporativo Público (`broker.hivemq.com`).

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
* [Node.js](https://nodejs.org/) (Versión 18 o superior)
* [Python](https://www.python.org/) (Versión 3.10 o superior)

---

## 🔧 Instrucciones de Instalación y Despliegue

Sigue estos pasos para poner en marcha todo el ecosistema localmente:

### 1. Clonar el Repositorio
```bash
git clone [https://github.com/TU_USUARIO/TU_REPOSITORIO.git](https://github.com/TU_USUARIO/TU_REPOSITORIO.git)
cd TU_REPOSITORIO
2. Configurar y Arrancar el Backend (Motor Físico)Navega a la carpeta de simulación e instala las dependencias de Python:Bashcd Simulacion
pip install -r requirements.txt
Crea un archivo .env en la raíz de la carpeta Simulacion/ con las siguientes variables de entorno:Fragmento de códigoMQTT_BROKER=broker.hivemq.com
MQTT_PORT=1883
TOPIC_TELEMETRIA=acuaODS/simulacion/telemetria/equipo_carlos_alex
TOPIC_CONTROL=acuaODS/simulacion/control/equipo_carlos_alex
Ejecuta el script del servidor:Bashpython simulador_core.py
El backend se iniciará en estado IDLE (reposo), esperando el handshake de configuración desde React.3. Configurar y Arrancar el Frontend (HMI Dashboard)Abre una nueva terminal, navega a la carpeta del dashboard e instala los paquetes de Node:Bashcd dashboard-acuaods
npm install
Inicia el servidor de desarrollo local:Bashnpm run dev
Abre en tu navegador la dirección provista por Vite (usualmente http://localhost:5173/).
📋 Estructura de Módulos (Frontend)src/App.tsx: Enrutador lógico central de la aplicación.src/pages/Lobby.tsx: Interfaz de bienvenida e identidad de marca.src/pages/Wizard.tsx: Captura paramétrica de biomasa y volumen de agua en $m^3$.src/pages/Dashboard.tsx: Tablero SCADA industrial, renderizado de telemetría y disparo de actuadores.src/hooks/useMqttClient.ts: Custom hook encargado del ciclo de vida de la conexión por WebSockets.src/utils/umbrales.ts: Aislamiento de las reglas de negocio biológicas y asignación de alertas visuales.