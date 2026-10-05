import { readBlogMetadata } from '../lib/blog-metadata.mjs';

// Dates come from article frontmatter, never file modification times or today's date.
const catalog = [
  {
    title: 'Aliasing Phenomenon in Audio Downsampling',
    path: 'blog/dropping-audio-samples-aliasing/',
    createdAt: '2026-10-05', // Confirmed creation date of this article, not of the DSP topic.
    description: 'Hear how skipping PCM samples can create a false tone, and compare it with filtering before downsampling.',
    tags: ['Audio', 'DSP', 'Firmware'],
  },
  {
    title: 'Graduation Thesis: Self-Balancing Electric Motorcycle',
    path: 'projects/graduation-thesis/',
    description: 'Small-scale reaction-wheel motorcycle prototype: PID and LQR balancing, filtered MPU6050 angle sensing, disturbance tests, and camera-based line tracking.',
    tags: ['LQR', 'PID', 'MPU6050', 'Kalman', 'Computer Vision'],
  },
  {
    title: 'Study and Implementation of Self-Balancing Electric Motorcycle',
    path: 'blog/self-balancing-electric-motorcycle-paper/',
    description: 'A compact research note on the reaction-wheel model, Kalman-filtered MPU6050 angle estimate, PID/LQR comparison, and physical prototype validation.',
    tags: ['Control', 'LQR', 'IMU'],
  },
  {
    title: 'Loadcell Weight Measurement (HX711 + STM32)',
    path: 'projects/loadcell-weight-system/',
    description: 'Weight measurement using an HX711 ADC and strain-gauge loadcell, with Kalman filtering and a moving average to reduce vibration noise.',
    tags: ['STM32', 'HX711', 'ADC', 'Kalman Filter', 'Calibration'],
  },
  {
    title: 'Calibrating Loadcells: Digital Noise Filtering in Embedded C',
    path: 'blog/calibrating-loadcells/',
    description: 'Tare calibration, moving average, and 1D Kalman filter implementation on Cortex-M for stable weight readings.',
    tags: ['Sensors', 'ADC', 'Filtering'],
  },
  {
    title: 'PDM Microphone to PCM Audio on Nordic nRF52',
    path: 'projects/pdm-microphone-pcm-audio/',
    description: 'Capture audio from a PDM microphone on nRF52 and convert it to 16-bit PCM using hardware decimation and EasyDMA double-buffering.',
    tags: ['nRF52', 'PDM', 'PCM', 'EasyDMA', 'Double Buffering'],
  },
  {
    title: 'PDM vs PCM in Embedded Audio',
    path: 'blog/pdm-vs-pcm/',
    description: 'Quick reference on what PDM and PCM are, and how they relate in embedded audio capture.',
    tags: ['Audio', 'PDM', 'PCM'],
  },
  {
    title: 'STM32 SDMMC + DMA Debugging',
    path: 'projects/stm32-sdmmc-dma-debugging/',
    description: 'Debugging notes on SD card write failures, interrupt priorities, cache coherence, and DMA transfers.',
    tags: ['SDMMC', 'DMA', 'NVIC', 'FreeRTOS'],
  },
];

export const blogs = catalog.map(blog => ({ ...blog, ...readBlogMetadata(blog) }));
