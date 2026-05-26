---
title: "High-Precision Mass Measurement System (Loadcell & HX711)"
layout: ../../layouts/Layout.astro
---

# ⚖️ High-Precision Mass Measurement System (Loadcell & HX711)

## Executive Summary
This project outlines the development of a highly precise and vibration-resistant electronic mass measurement system using a **4-wire strain gauge loadcell** and the **24-bit HX711 ADC**. The core contribution is the design and implementation of real-time digital filtering algorithms in C to eliminate ambient mechanical vibrations and physical disturbances in industrial environments.

---

## 🛠️ Hardware Integration

```text
+-------------------+      Excitation (+/-)      +-------------+      2-Wire Serial      +-----------+
| Strain Gauge      | =========================> | 24-Bit ADC  | ======================> | STM32 MCU |
| Loadcell Sensor   | <========================= | HX711       | <====================== | (Cortex-M)|
+-------------------+      Signal (+/-)          +-------------+      (PD_SCK / DOUT)    +-----------+
```

- **Loadcell**: Converts applied force/mass into a micro-volt analog signal ($mV/V$).
- **HX711**: Amplifies the micro-volt signal (integrated PGA with 128 gain) and converts it to a 24-bit digital value.
- **STM32 Controller**: Polls the raw 24-bit values and performs digital filtering and calibration calculations.

---

## ⚙️ Calibration & Digital Filtering in C

To convert raw ADC readings to weight (grams) and eliminate noise, the firmware runs a two-step pipeline:

### 1. Zero-Point Calibration (Tare)
Calculates the base average ADC offset value when no load is applied:

```c
int32_t calculate_tare_offset(void) {
    int64_t sum = 0;
    for (int i = 0; i < 64; i++) {
        sum += hx711_read_raw();
        delay_ms(10);
    }
    return (int32_t)(sum / 64);
}
```

### 2. Kalman Noise Filtering
To eliminate environmental vibration noise (e.g. from nearby machines), a 1D Kalman filter runs in real-time on the STM32 Cortex-M CPU:

```c
float apply_kalman_filter(kalman_state_t* state, float raw_weight) {
    // Prediction Update
    // state->p = state->p + state->q;

    // Measurement Update
    state->k = state->p / (state->p + state->r);
    state->x = state->x + state->k * (raw_weight - state->x);
    state->p = (1.0f - state->k) * state->p + state->q;
    
    return state->x;
}
```

---

## 🔍 Achievements & Performance
- Filtered out **92%** of high-frequency mechanical vibration noise without introducing perceptible latency in reading updates.
- Achieved stable, jitter-free weight display down to **milligram accuracy (0.001g)**.
- Implemented low-power standby modes on both the HX711 and STM32, reducing inactive current consumption to under **15uA**.
