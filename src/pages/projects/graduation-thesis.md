---
title: "Graduation Thesis: BLE Sensor Gateway on Embedded Linux"
layout: ../../layouts/Layout.astro
---

# 🎓 Graduation Thesis: BLE Sensor Gateway on Embedded Linux

## Overview
This thesis covers the design of a BLE sensor gateway running Embedded Linux. The gateway collects data from BLE sensor nodes, caches it in a local SQLite database, and forwards it to a cloud backend over TLS.

---

## 🛠️ System Architecture

```mermaid
graph LR
    subgraph Low Power Nodes
        NodeA[BLE Sensor Node]
        NodeB[BLE Sensor Node]
    end
    subgraph Edge Gateway (Linux)
        BLE[BLE Interface] --> System[System Service - Go]
        System --> DB[(SQLite Local DB)]
        System --> Sec[TLS Encryption]
    end
    subgraph Cloud Backend
        Sec --> AWS[Cloud Gateway]
    end
```

The gateway consists of three distinct software layers running on an ARM Cortex-A processor:
1. **Wireless Aggregator Layer (C/C++)**: A low-level service managing the Bluetooth Low Energy (BLE) transceiver and handling raw packet parsing.
2. **Local Edge Service (Go)**: A concurrent service managing thread pools, local SQLite caching databases, and data serialization.
3. **Cloud Streamer Layer (Go / gRPC)**: An encrypted socket-based client that streams data packets to the cloud backend with auto-reconnection and buffering mechanisms.

---

## ⚙️ Key Technical Implementations

### Custom Yocto-based Linux OS
To keep the image small and reduce attack surface, a customized Embedded Linux image was generated using the **Yocto Project (Scarthgap release)**:
- Stripped unnecessary system packages, achieving a root filesystem size of under **80MB**.
- Configured custom device trees (DTS) to define serial communication ports and custom GPIO controls.
- Hardened kernel security options and disabled root login.

### High-Concurrency Go Service
Implemented the edge daemon using **Golang** to exploit its lightweight concurrency Model:
- **Goroutines**: Utilized to manage separate tasks: BLE data listening, SQLite local database caching, and network socket monitoring.
- **Channels**: Designed a data pipeline to push parsed sensor data packets through channels into a buffered database worker queue, avoiding write contention.

---

## 🔍 Results
- Achieved continuous, stable data logging over **100+ hours** of tests with **0% packet loss** under simulated network disruptions (thanks to the local SQLite buffer).
- Optimized power consumption on the gateway by implementing dynamic CPU frequency scaling (via scaling governors in Linux) and configuring automatic power suspend for unused peripheral interfaces.
