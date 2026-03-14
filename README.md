# 🏥 Addis Medical AI - Real-time Amharic Health Assistant

Addis Medical AI is a premium, low-latency voice assistant designed for the Ethiopian healthcare context. It provides real-time, bidirectional voice conversations in Amharic, supporting multiple medical specialist personas.

![Addis Medical AI](/public/next.svg)

## ✨ Features

- **🗣️ Real-time Voice Interaction**: Bidirectional audio streaming using WebSockets (PCM16 16kHz input / 24kHz output) for near-zero latency conversations.
- **🇪🇹 Amharic Native**: Built-in support for Amharic Speech-to-Text (STT), Text-to-Speech (TTS), and LLM reasoning.
- **👨‍⚕️ Multi-Agent Personas**: Choose from 10+ specialists including:
  - General Physician / አጠቃላይ ሀኪም
  - Cardiologist / የልብ ሀኪም
  - Pediatrician / የህፃናት ሀኪም
  - And more (Dentist, Nutritionist, Psychologist, etc.)
- **🧠 Knowledge Bridge**: Real-time symptom detection that "arms" the AI with expert medical facts to prevent generic/hallucinated responses.
- **🎙️ Audible Greeting**: Instant Amharic vocal greeting upon session start.
- **🎨 Premium UI**: Modern glassmorphic interface with fluid animations and real-time status indicators.

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Shadcn/UI
- **Audio**: Web Audio API (ScriptProcessorNode, AudioContext)
- **API**: [Addis Assistant API](https://addisassistant.com) (WebSocket & REST)

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- An API Key from Addis Assistant.

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```env
ADDIS_API_KEY=your_key_here
NEXT_PUBLIC_ADDIS_API_KEY=your_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Installation
```bash
npm install
```

### 4. Run Development
```bash
npm run dev
```

## 🏗️ Architecture

- **`hooks/useAddisRealtime.ts`**: The main coordination hook for audio streaming and WebSocket state.
- **`lib/medical/library.ts`**: The grounding database for medical expertise.
- **`constants/agents.ts`**: Persona definitions and instructions.
- **`lib/addis.ts`**: Wrapper for Addis Assistant REST services.

---

> [!WARNING]
> **Medical Disclaimer**: This assistant provides health information for guidance only. Always consult a qualified medical professional for diagnosis or treatment.
