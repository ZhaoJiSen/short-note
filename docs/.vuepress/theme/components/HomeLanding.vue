<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const heroCard = ref<HTMLElement | null>(null);

let reduceMotion = false;
let magnetFrame = 0;

function resetMagnet() {
  if (magnetFrame) {
    cancelAnimationFrame(magnetFrame);
    magnetFrame = 0;
  }

  heroCard.value?.style.setProperty('--magnet-x', '0px');
  heroCard.value?.style.setProperty('--magnet-y', '0px');
  heroCard.value?.style.setProperty('--magnet-rotate', '0deg');
}

function handleMagnetMove(event: MouseEvent) {
  if (reduceMotion || !heroCard.value)
    return;

  const card = heroCard.value;
  const rect = card.getBoundingClientRect();
  const offsetX = event.clientX - rect.left - rect.width / 2;
  const offsetY = event.clientY - rect.top - rect.height / 2;

  if (magnetFrame)
    cancelAnimationFrame(magnetFrame);

  magnetFrame = requestAnimationFrame(() => {
    card.style.setProperty('--magnet-x', `${offsetX * 0.035}px`);
    card.style.setProperty('--magnet-y', `${offsetY * 0.045}px`);
    card.style.setProperty('--magnet-rotate', `${offsetX * 0.002}deg`);
  });
}

onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
});

onBeforeUnmount(() => {
  resetMagnet();
});
</script>

<template>
  <div class="linear-home-shell">
    <section class="linear-home-hero" aria-label="个人简介展示">
      <div
        ref="heroCard"
        class="vp-demo-wrapper normal linear-profile-demo"
        @mouseleave="resetMagnet"
        @mousemove="handleMagnetMove"
      >
        <div class="demo-draw">
          <section class="about-aaron">
            <div class="hero-badge">Frontend Engineer · Open Source Contributor</div>

            <h1 class="hero-title">Hi, I’m Aaron</h1>

            <p class="hero-subtitle">
              I build developer-first interfaces, cross-platform products, and
              practical tools across web, desktop, and agent workflows.
            </p>

            <p class="hero-description">
              My work sits at the intersection of frontend engineering, open source,
              and product craft. I care about clean system design, readable code,
              strong typography, and calm interfaces that still feel precise.
            </p>

            <div class="hero-tags">
              <span>Vue</span>
              <span>TypeScript</span>
              <span>Nuxt</span>
              <span>React</span>
              <span>Node</span>
              <span>Rust</span>
              <span>Tauri</span>
              <span>Agent</span>
              <span>Open Source</span>
            </div>

            <div class="hero-actions">
              <a href="https://github.com/ZhaoJiSen" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href="https://github.com/jumpserver" target="_blank" rel="noopener noreferrer">
                JumpServer
              </a>
            </div>

            <div class="hero-meta">
              <span>Frontend Engineer</span>
              <span>Cross-platform Products</span>
              <span>Rust / Tauri / Agent</span>
            </div>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>
