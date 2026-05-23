---
title: "PDM vs PCM in Embedded Audio"
date: "2026-05-23"
layout: ../../layouts/Layout.astro
---

# PDM vs PCM in Embedded Audio

When working with digital microphones, we often see two terms: PDM and PCM.

## PDM

PDM stands for Pulse Density Modulation. It is a high-frequency 1-bit data stream from a digital microphone.

## PCM

PCM stands for Pulse Code Modulation. It is a multi-bit representation of sampled audio amplitude.

## In embedded systems

A PDM peripheral can capture the microphone bitstream and convert/filter it into PCM samples that firmware can store, process, or transmit.