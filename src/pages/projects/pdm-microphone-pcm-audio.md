---
title: "PDM Microphone to PCM Audio on Nordic nRF52"
layout: ../../layouts/Layout.astro
---

# 🎙️ PDM Microphone to PCM Audio on Nordic nRF52

## Overview
This project documents the capture, processing, and double-buffering of digital microphone data on a **Nordic nRF52** microcontroller. Using the nRF52's built-in **PDM (Pulse Density Modulation)** hardware peripheral and **EasyDMA**, the system converts 1-bit high-frequency bitstreams into 16-bit **PCM (Pulse Code Modulation)** audio buffers. DMA handles the transfer so the CPU stays free during capture.

---

## 🛠️ Hardware & Protocol Architecture

```text
+-------------------+      1-Bit PDM stream      +---------------------+      EasyDMA      +---------------------+
| PDM Digital Mic   | =========================> | nRF52 PDM Peripheral| =================> | PCM Buffers in RAM  |
| (CLK / Data)      |      (High-Frequency CLK)  | (Decimation Filter) |      (Zero CPU)   | (Double Buffering)  |
+-------------------+                            +---------------------+                    +---------------------+
```

- **PDM Interface**: A digital audio standard that represents signal amplitude through pulse density (1-bit high-frequency stream). It has high immunity to electromagnetic interference, making it ideal for compact wearable devices and high-density boards.
- **EasyDMA**: nRF52's hardware Direct Memory Access, which transfers compiled audio samples directly from the PDM peripheral into RAM without CPU intervention.
- **Decimation Filter**: Built into the nRF52 PDM hardware, this filter downsamples the high-speed 1-bit stream into a standard 16-bit PCM stream at 16kHz.

---

## ⚙️ Double-Buffering Implementation in C

To ensure continuous, real-time audio capture without dropping samples, a double-buffering strategy is implemented. When buffer `A` is full and triggers a DMA interrupt, the PDM peripheral immediately switches to buffer `B` while the CPU processes/encodes the data in buffer `A`.

```c
#define PCM_BUFFER_SIZE 256
int16_t audio_buffer_a[PCM_BUFFER_SIZE];
int16_t audio_buffer_b[PCM_BUFFER_SIZE];
bool active_buffer_a = true;

void pdm_event_handler(nrfx_pdm_evt_t const * p_event) {
    if (p_event->error) {
        // Handle PDM overrun error
        return;
    }
    
    if (p_event->buffer_requested) {
        // Direct EasyDMA to the alternate buffer instantly
        if (active_buffer_a) {
            nrfx_pdm_buffer_set(audio_buffer_b, PCM_BUFFER_SIZE);
            active_buffer_a = false;
        } else {
            nrfx_pdm_buffer_set(audio_buffer_a, PCM_BUFFER_SIZE);
            active_buffer_a = true;
        }
    }
    
    if (p_event->buffer_released) {
        // Send the released buffer to the encoder/processing task
        audio_stream_process(p_event->buffer_released, PCM_BUFFER_SIZE);
    }
}
```

---

## 🔍 Results & Trade-offs
- **DMA Offloading**: PDM clocking and data collection run on **EasyDMA**, keeping CPU utilization under **5%** during continuous recording at 16kHz.
- **PCM Configuration**: Configured the hardware decimation filter for a **16kHz sample rate, 16-bit mono PCM format** (oversampling ratio of 64).
- **Double-Buffer Timing**: Implemented a ping-pong buffer architecture to handle buffer-release and buffer-request events within the `nrfx_pdm` ISR, to avoid dropping samples between buffer swaps.

## References

- [PDM vs PCM in Embedded Audio](../../blog/pdm-vs-pcm/) - related note explaining the audio formats used in this project.
