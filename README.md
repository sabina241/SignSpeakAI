

# 🤟 SignSpeak AI

> **Breaking Barriers: Real-Time Sign Language Translation via Multimodal LLM Intelligence.**

[](https://react.dev/)
[](https://www.typescriptlang.org/)
[](https://vitejs.dev/)
[](https://aistudio.google.com/)
[](https://tailwindcss.com/)


## 🌟 Project Vision

**SignSpeak AI** is a real-time accessibility platform designed for the Deaf and Hard-of-Hearing (DHH) community. By leveraging the **Gemini 1.5 Flash** multimodal vision model, the application interprets complex gestural language and translates it into natural, contextually accurate text.

Unlike traditional computer-vision projects that rely on heavy local Python environments, SignSpeak AI is built for the **Modern Web**—ensuring high performance, responsive interaction, and global accessibility on any device with a browser.


## 🚀 Technical Innovation

### ⚡ Why React + TSX + Vite?

  * **Zero-Latency UI:** Utilizing React’s Virtual DOM to handle high-frequency UI updates and video overlays without interface freezing.
  * **Static Type Safety:** Leveraging TypeScript to ensure strict data-flow and robust error handling between the camera stream and the AI gateway.
  * **Instant HMR:** Developed with Vite to provide a lightning-fast development cycle and optimized production bundles.

### 🧠 Multimodal Intelligence

We employ a **Context-Aware** approach to translation. Rather than simple "hand-shape" recognition, our system analyzes:

1.  **Temporal Dynamics:** The fluid movement and speed of signs.
2.  **Spatial Relations:** Hand positioning relative to facial features and the torso.
3.  **Semantic Synthesis:** Using Large Language Model (LLM) reasoning to convert gestures into grammatically fluid sentences.

## 🛠️ System Architecture

The application operates on a **Decoupled Intelligence Model**, separating the "Interaction Layer" from the "Brain":

1.  **Capture:** The WebRTC `getUserMedia` API hooks into hardware to facilitate a high-frame-rate video stream.
2.  **Process:** Frames are compressed via the Canvas API and converted to optimized data tokens.
3.  **Translate:** Google Gemini 1.5 Flash processes visual inputs via an encrypted API tunnel.
4.  **Render:** State-driven components instantly update the `DecisionLog` and `TranslationFeed` for the user.

<img width="914" height="198" alt="Screenshot 2026-04-14 190022" src="https://github.com/user-attachments/assets/376798e7-9579-4b43-a9b5-c9ea8e9f78aa" />


## 📊 SWOC Analysis

| **Strengths** | **Weaknesses** |
| :--- | :--- |
| • Type-safe architecture using TSX.<br>• Cloud-based (Universal hardware support). | • Dependency on active network connectivity.<br>• Sensitivity to variable background lighting. |
| **Opportunities** | **Challenges** |
| • Expansion into AR (Augmented Reality).<br>• Bi-directional (Voice-to-Sign) avatars. | • Managing API latency during peak usage.<br>• Support for complex regional dialects. |


## 📂 Project Structure

```text
src/
├── components/          # Modular UI components (DecisionLog, NodeInspector, etc.)
├── hooks/               # Custom hooks for Camera and Gemini API orchestration
├── types/               # Strict TypeScript interfaces and type definitions
├── App.tsx              # Main layout and global state orchestration
└── main.tsx             # Entry point and initialization
```


## 🌍 Sustainable Development Goals (SDG)

This project is deeply committed to **SDG 10: Reduced Inequalities**. By providing a digital, real-time interpreter, we aim to provide equal access to education, healthcare, and professional employment for the 70 million sign language users worldwide.

