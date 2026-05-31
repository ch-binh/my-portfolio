---
title: "Study and Implementation of Self-Balancing Electric Motorcycle"
date: "2026-05-31"
layout: ../../layouts/Layout.astro
---

# Study and Implementation of Self-Balancing Electric Motorcycle

This note summarizes the research paper connected to my graduation thesis. The paper is a compact version of the project: it focuses on the reaction-wheel model, IMU angle estimation, PID/LQR controller comparison, and validation on a physical self-balancing motorcycle prototype.

Source paper: **"Study and Implementation of Self-Balancing Electric Motorcycle"** by The Dang Phan, Chau Binh Pham, and Cong Bang Pham, Ho Chi Minh City University of Technology.

[Download the paper PDF](/my-portfolio/papers/self-balancing-electric-motorcycle-icresm-2024.pdf)

<figure>
  <img src="/my-portfolio/project-assets/graduation-thesis/physical-prototype.png" alt="Physical self-balancing motorcycle prototype used in the research paper" style="max-width: 100%; height: auto; border: 1px solid var(--border-color); border-radius: 8px;" />
  <figcaption style="color: var(--text-muted); font-size: 0.88rem; margin-top: 0.55rem;">The physical prototype used for controller validation.</figcaption>
</figure>

## Paper Focus

The paper does not try to describe every part of the graduation thesis. It narrows the scope to the balancing system:

- Modeling the DC motor and inertia wheel pendulum.
- Studying mechanical parameters for reaction wheel design.
- Estimating tilt angle from an MPU6050 IMU.
- Filtering the angle estimate with a Kalman filter.
- Comparing PID and LQR controllers in simulation.
- Validating the LQR controller on the physical prototype.

That narrowed scope makes the paper useful as a technical reference for the control portion of the project.

## Control Problem

The prototype behaves like an inertia wheel pendulum. When the frame tilts, the reaction wheel changes speed to produce torque against the falling direction. The controller therefore depends on three things working together: a usable mechanical model, a usable tilt estimate, and a controller that can react without driving the motor into a bad operating point.

The paper first models the motor and vehicle frame, then uses those equations to compare controller behavior. The most important comparison is not that LQR is more advanced than PID; it is that LQR performed better in the disturbance cases that looked closer to real prototype behavior.

## Sensor Filtering

The MPU6050 angle estimate was affected by noise. The paper uses a Kalman filter to produce a smoother tilt signal before control. For a balancing vehicle, this matters because the controller reacts directly to the measured angle. If the angle signal jumps, the controller may command the motor for the wrong reason.

In short:

> Sensor filtering was part of the control system, not a separate cleanup step.

## PID vs LQR

PID was useful as a baseline. It could bring the system back in simpler disturbance cases, but it struggled with asymmetric continuous load.

LQR gave the better result in the paper's comparison. Under asymmetric continuous load, it was able to bring the model back toward the balancing position while keeping the reaction wheel response more controlled.

The final LQR gain still needed physical tuning after simulation. That part is important: the paper shows model-based design, but the working prototype still had noise, friction, and assembly effects that required adjustment.

## Prototype Validation

The LQR controller was validated on the physical prototype under several scenarios:

- Balancing without external force.
- Recovering after an instantaneous sideways force.
- Handling asymmetric continuous load.
- Moving forward.
- Moving in circular motion.

The paper reports that the tilt angle was often within about `+/-3 deg` during validation scenarios. It also notes that the wheel velocity was sampled at `100 Hz`, then averaged every 20 samples for interpretation.

## Why This Paper Is Worth Including

This paper gives the portfolio project a stronger foundation because it proves the thesis was not only a build log. It documents a publishable slice of the work:

- A specific unstable system.
- A clear actuator mechanism.
- Sensor filtering.
- Controller comparison.
- Hardware validation.

The project page can talk about the complete thesis, while this note keeps the paper's narrower technical argument visible.

## Link Back

Project page: [Graduation Thesis: Self-Balancing Electric Motorcycle](../../projects/graduation-thesis/).
