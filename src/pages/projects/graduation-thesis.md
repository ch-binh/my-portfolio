---
title: "Design & Implementation of a High-Precision IoT Edge Gateway"
layout: ../../layouts/Layout.astro
---

# 🎓 Graduation Thesis: Design & Implementation of a High-Precision IoT Edge Gateway

## Executive Summary
This thesis presents the design, system architecture, and hardware-software co-design of a **High-Precision IoT Edge Gateway** running Embedded Linux. The gateway acts as a robust local data aggregator and secure edge processing hub, interfacing with low-power wireless sensor nodes (BLE Mesh) and streaming parsed media/sensor packages to a centralized cloud platform.

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
        Sec --> AWS[Axon Cloud Gateway]
    end
```

The gateway consists of three distinct software layers running on an ARM Cortex-A processor:
1. **Wireless Aggregator Layer (C/C++)**: A low-level service managing the Bluetooth Low Energy (BLE) transceiver and handling raw packet parsing.
2. **Local Edge Service (Go)**: A high-stability concurrent service managing thread pools, local SQLite caching databases, and data serialization.
3. **Cloud Streamer Layer (Go / gRPC)**: An encrypted socket-based client that streams data packets to the cloud backend with auto-reconnection and buffering mechanisms.

---

## ⚙️ Key Technical Implementations

### Custom Yocto-based Linux OS
To guarantee high stability, minimal security exposure, and fast boot times, a customized Embedded Linux image was generated using the **Yocto Project (Scarthgap release)**:
- Stripped unnecessary system packages, achieving a root filesystem size of under **80MB**.
- Configured custom device trees (DTS) to define serial communication ports and custom GPIO controls.
- Hardened kernel security options and disabled root login.

### High-Concurrency Go Service
Implemented the edge daemon using **Golang** to exploit its lightweight concurrency Model:
- **Goroutines**: Utilized to manage separate tasks: BLE data listening, SQLite local database caching, and network socket monitoring.
- **Channels**: Designed a data pipeline to push parsed sensor data packets through channels into a buffered database worker queue, avoiding write contention.

---

## 🔍 Results & Achievements
- Achieved continuous, stable data logging over **100+ hours** of tests with **0% packet loss** under simulated network disruptions (thanks to the local SQLite buffer).
- Reduced peak system power consumption by **35%** by implementing dynamic CPU frequency scaling and peripheral state power management.
