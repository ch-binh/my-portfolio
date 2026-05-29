---
title: "Calibrating Loadcells: Digital Noise Filtering in Embedded C"
date: "2026-05-25"
layout: ../../layouts/Layout.astro
---

# Calibrating Loadcells: Digital Noise Filtering in Embedded C

When building mass measurement systems using loadcells and analog-to-digital converters (like the 24-bit HX711), the raw sensor data is rarely stable enough to be used directly. Physical vibrations, temperature drifts, and electromagnetic interference create raw noise that must be filtered in software.

In this log, I'll walk through how I designed a calibration process and implemented digital filters in C to achieve stable weight readings.

---

## The Raw Hardware Stack

- **Sensor**: 4-wire strain gauge loadcell.
- **ADC**: HX711 24-bit high-precision converter.
- **Controller**: STM32 Cortex-M microcontroller.

The HX711 communicates via a simple 2-wire serial interface (PD_SCK and DOUT). After pulling the raw 24-bit two's complement integer, we convert it to physical mass using calibration formulas.

---

## 1. The Calibration Formula

To translate the raw ADC value to weight (grams), we use the linear calibration formula:

$$\text{Weight} = \frac{\text{Raw Reading} - \text{Offset}}{\text{Scale Factor}}$$

Where:
* **Offset (Tare)**: The raw reading when no weight is on the loadcell.
* **Scale Factor**: A constant determined by placing a known reference weight on the sensor during calibration.

### Calibration Procedure in C:

```c
float calibrate_sensor(int32_t raw_reference_reading, float known_weight, int32_t tare_offset) {
    // Determine the scale factor
    float scale_factor = (float)(raw_reference_reading - tare_offset) / known_weight;
    return scale_factor;
}
```

---

## 2. Digital Filtering Algorithms

Raw weight values fluctuate due to ambient vibrations. To solve this, we implement two digital filters in the microcontroller firmware.

### A. Simple Moving Average (SMA) Filter

A Moving Average filter smooths out high-frequency noise by maintaining a circular buffer of the last $N$ samples and calculating their arithmetic mean.

```c
#define FILTER_DEPTH 10
int32_t sample_buffer[FILTER_DEPTH] = {0};
uint8_t buffer_index = 0;

int32_t apply_moving_average(int32_t new_sample) {
    // Add new sample to circular buffer
    sample_buffer[buffer_index] = new_sample;
    buffer_index = (buffer_index + 1) % FILTER_DEPTH;
    
    // Calculate mean
    int64_t sum = 0;
    for (uint8_t i = 0; i < FILTER_DEPTH; i++) {
        sum += sample_buffer[i];
    }
    return (int32_t)(sum / FILTER_DEPTH);
}
```

### B. One-Dimensional Kalman Filter

For scales that need to stay stable under vibration, a 1D Kalman filter gives a reasonable estimate by balancing process noise against measurement noise.

```c
typedef struct {
    float q; // Process noise covariance
    float r; // Measurement noise covariance
    float x; // Estimated value (state)
    float p; // Estimation error covariance
    float k; // Kalman gain
} kalman_state_t;

void kalman_init(kalman_state_t* state, float process_noise, float sensor_noise, float initial_value) {
    state->q = process_noise;
    state->r = sensor_noise;
    state->x = initial_value;
    state->p = 1.0f; // Initial error covariance estimate
}

float kalman_update(kalman_state_t* state, float measurement) {
    // Prediction Update (Time Update)
    // state->p = state->p + state->q;

    // Measurement Update (Correction)
    state->k = state->p / (state->p + state->r);
    state->x = state->x + state->k * (measurement - state->x);
    state->p = (1.0f - state->k) * state->p + state->q;
    
    return state->x;
}
```

---

## Summary

Integrating zero-point tare calibration with a real-time 1D Kalman filter on a Cortex-M MCU helps reduce mechanical vibration noise. This double-stage filtering approach (SMA for base smoothing, Kalman for transient response) provides a stable weight display under ambient disturbances while maintaining low computational overhead.
