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
              <a
                class="hero-action-link"
                href="https://github.com/ZhaoJiSen"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span class="hero-action-main">
                  <span class="hero-action-prefix" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.42-4.04-1.42a3.18 3.18 0 0 0-1.34-1.76c-1.09-.75.08-.73.08-.73a2.52 2.52 0 0 1 1.84 1.24a2.56 2.56 0 0 0 3.5 1a2.57 2.57 0 0 1 .76-1.61c-2.67-.31-5.47-1.34-5.47-5.97a4.68 4.68 0 0 1 1.24-3.24a4.34 4.34 0 0 1 .12-3.19s1.01-.32 3.3 1.24a11.4 11.4 0 0 1 6 0c2.28-1.56 3.29-1.24 3.29-1.24a4.34 4.34 0 0 1 .12 3.19a4.67 4.67 0 0 1 1.24 3.24c0 4.64-2.81 5.66-5.49 5.96a2.88 2.88 0 0 1 .82 2.23v3.3c0 .32.22.7.83.58A12 12 0 0 0 12 .5" />
                    </svg>
                  </span>
                  <span class="hero-action-label">GitHub</span>
                </span>
                <span class="hero-action-suffix" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 14L14 6" />
                    <path d="M7 6h7v7" />
                  </svg>
                </span>
              </a>
              <a
                class="hero-action-link"
                href="https://github.com/jumpserver"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span class="hero-action-main">
                  <span class="hero-action-prefix" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3.5" y="4.5" width="17" height="6" rx="1.8" />
                      <rect x="3.5" y="13.5" width="17" height="6" rx="1.8" />
                      <path d="M7.5 7.5h.01" />
                      <path d="M7.5 16.5h.01" />
                    </svg>
                  </span>
                  <span class="hero-action-label">JumpServer</span>
                </span>
                <span class="hero-action-suffix" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 14L14 6" />
                    <path d="M7 6h7v7" />
                  </svg>
                </span>
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
