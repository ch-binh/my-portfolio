---
title: "STM32 SDMMC + DMA Debugging"
layout: ../../layouts/Layout.astro
---

# 💾 STM32 SDMMC + DMA Debugging

## Executive Summary
This engineering journal logs the debugging process of resolving critical write failures, interrupt preemption priorities, and memory coherence issues on an **STM32L4** microcontroller. The system was designed to write sensor data streams to an SD card via the **SDMMC** hardware peripheral using **Direct Memory Access (DMA)** in a multi-threaded FreeRTOS environment.

---

## 🛠️ The Bug & Symptoms
During high-throughput media streaming tests, the system intermittently suffered from:
1. **HardFaults** inside the FreeRTOS context switcher.
2. **SD Card Write Timeout Errors** (`SDMMC_ERROR_TX_UNDERRUN` / `SDMMC_ERROR_DATA_TIMEOUT`).
3. **Data Corruption**: Occasional garbage bytes in written `.csv` / binary files.

---

## 🔍 Root Cause Analysis & Debugging Steps

Using a **Saleae Logic Analyzer** and J-Link debug logs, I traced the issue to three overlapping bugs:

### 1. NVIC Interrupt Priority Inversion
- **Issue**: The SDMMC interrupt priority was set higher (lower numerical value) than `configLIBRARY_MAX_SYSCALL_INTERRUPT_PRIORITY`.
- **Consequence**: Calling FreeRTOS API functions (like releasing a semaphore from the ISR) corrupted the kernel stack, leading to random HardFaults.
- **Fix**: Re-allocated interrupt priorities in the STM32 NVIC configuration.

```c
// Correct Priority Allocation in STM32 Hal init
HAL_NVIC_SetPriority(SDMMC1_IRQn, 6, 0); // 6 is lower priority than Max Syscall (which is 5)
HAL_NVIC_EnableIRQ(SDMMC1_IRQn);
```

### 2. DMA Buffer Cache Coherence (D-Cache)
- **Issue**: STM32 Cortex-M7 core caches data. When DMA transfers data from RAM to SDMMC, the DMA hardware reads directly from physical RAM, but the CPU might not have flushed the modified data from its data cache (D-Cache) to physical RAM yet.
- **Consequence**: DMA transfered old, stale memory data, causing data corruption in the files.
- **Fix**: Flushed D-Cache before triggering the DMA write:

```c
void write_buffer_to_sd(uint32_t* buffer, uint32_t block_address, uint32_t number_of_blocks) {
    // Flush D-Cache before DMA read/write to ensure RAM matches Cache
    SCB_CleanDCache_by_Addr((uint32_t*)buffer, number_of_blocks * 512);
    
    // Trigger DMA SDMMC write
    HAL_SD_WriteBlocks_DMA(&hsd1, (uint8_t*)buffer, block_address, number_of_blocks);
}
```

### 3. DMA Transfer Preemption
- **Issue**: The DMA controller was preempted by other high-priority CPU requests, causing a FIFO underrun.
- **Fix**: Increased DMA channel arbitration priority in CubeMX to "Very High".

---

## 🔍 Debugging Outcomes & Technical Gains
- **Root Cause Resolution**: Eliminated kernel stack corruption and random context-switch HardFaults by aligning NVIC preemption priorities relative to the FreeRTOS syscall threshold.
- **Data Coherence**: Resolved buffer corruption by inserting cache-flushing APIs (`SCB_CleanDCache_by_Addr`) to synchronize physical SRAM with the Cortex-M7 D-Cache before DMA start.
- **Bus Optimization**: Leveraged a 4-bit wide SDMMC hardware bus configuration and DMA multi-block modes to maintain reliable sensor data logging.
- **Power Failsafe**: Implemented a software state machine to monitor power rails and flush/close FATFS file descriptors immediately upon detecting low-voltage interrupts (VDD droop).
