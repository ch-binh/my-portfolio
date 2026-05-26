# Binh Pham | Embedded Systems & Firmware Engineer

<p align="left">
  <a href="https://ch-binh.github.io/my-portfolio/"><img src="https://img.shields.io/badge/Live%20Demo-Active-brightgreen?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Live Demo"></a>
  <a href="https://astro.build"><img src="https://img.shields.io/badge/Built%20With-Astro%20v6-ff5e00?style=for-the-badge&logo=astro&logoColor=white" alt="Built with Astro"></a>
  <a href="https://github.com/ch-binh/my-portfolio/actions"><img src="https://img.shields.io/badge/CI%2FCD-GitHub%20Pages-blue?style=for-the-badge&logo=github-actions&logoColor=white" alt="GitHub Pages CI/CD"></a>
</p>

Welcome to the official repository of my personal portfolio and technical blog. This project is a minimalist, high-performance, and responsive showcase of my engineering expertise, low-level firmware projects, and structured technical logs.

🔗 **Live Portfolio:** **[ch-binh.github.io/my-portfolio/](https://ch-binh.github.io/my-portfolio/)**

---

## 🧑‍💻 About Me

I am a passionate **Embedded Systems & Firmware Engineer** specializing in low-level driver development, RTOS integration, hardware-software co-design, and real-time digital audio processing. I enjoy solving complex race conditions, optimizing hardware DMA transfers, and writing high-efficiency, register-level microcontroller code.

---

## 🛠️ Technical Competencies

| Category | Technologies & Tools |
| :--- | :--- |
| **Languages** | C, C++, Assembly (ARM Cortex-M), Python, Bash |
| **RTOS / Kernel** | FreeRTOS, Zephyr RTOS, Bare-Metal programming |
| **MCUs & SoCs** | STM32 (Cortex-M4/M7), Nordic Semi (nRF52 - BLE), ESP32 |
| **Hardware Peripherals** | DMA, I2S, PDM, SPI, I2C, UART, SDMMC, ADC/DAC, Timers |
| **Embedded Workflows** | J-Link, GDB Debugging, Saleae Logic Analyzers, Osciloscopes |
| **Protocols & Wireless** | BLE (Bluetooth Low Energy), Wi-Fi (ESP-IDF), UART/SPI/I2C |

---

## 🚀 Featured Engineering Projects

Inside the portfolio, you'll find detailed logs of several deep-tech engineering projects:

### 🎙️ PDM Microphone to PCM Audio on Nordic nRF52
*Captured high-fidelity digital microphone data using the Nordic nRF52 PDM peripheral and converted/filtered it into PCM audio buffers using low-latency DMA double-buffering.*
* **Keywords**: `PDM`, `PCM`, `DMA`, `Double Buffering`, `Audio Decimation`, `nRF52`

### 💾 STM32 SDMMC + DMA Coherence & Preemption Debugging
*Diagnosed and resolved critical race conditions, interrupt preemption priorities, and cache/memory coherence issues during high-speed DMA transfers to SD cards via SDMMC protocol.*
* **Keywords**: `STM32L4`, `SDMMC`, `DMA`, `NVIC Priority`, `RTOS Preemption`

---

## 💻 Tech Stack & Architecture

This website is designed for maximum speed, readability, and modern aesthetics:

* **Framework**: [Astro v6](https://astro.build/) — enabling ultra-fast page load times through static-site generation (SSG) with zero hydration overhead by default.
* **Design System**: A custom **Premium Markdown-inspired Dark Theme** styled using pure, performant vanilla CSS.
  * **Typography**: *Inter* (sans-serif) for high-contrast readability and *JetBrains Mono* (monospace) for professional code snippets.
* **Responsive Layout**: Capped at `720px` max-width, perfectly optimized for reading code on mobile, tablet, and desktop screens.
* **CI/CD**: Fully automated deployment to **GitHub Pages** via GitHub Actions workflow upon pushing to `main`.

---

## ⚙️ Running Locally

If you want to clone this repository and run the website locally:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (>= 22.12.0) installed.

### 2. Installation
Navigate into the repository directory and install dependencies:
```bash
npm install
```

### 3. Start Development Server
Run the local dev server at `http://localhost:4321/`:
```bash
npm run dev
```

### 4. Build Production Bundle
To build the optimized static site into the `dist/` directory:
```bash
npm run build
```

---

<p align="center">
  Developed with 💻 and ☕ by <b>Binh Pham</b>.
</p>
