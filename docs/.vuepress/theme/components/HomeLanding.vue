<script setup lang="ts">
import VPIcon from '@theme/VPIcon.vue';
import { withBase } from 'vuepress/client';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const topics = [
  {
    index: '01',
    icon: 'material-icon-theme:javascript',
    title: 'JavaScript',
    desc: '语言基础、对象模型、数组方法、ES6 语法',
    link: '/javascript/',
  },
  {
    index: '02',
    icon: 'material-icon-theme:http',
    title: '浏览器与 Web API',
    desc: '渲染、事件循环、网络、安全与进程模型',
    link: '/浏览器/0pkbd4hl/',
  },
  {
    index: '03',
    icon: 'material-icon-theme:vue',
    title: 'Vue / Nuxt',
    desc: '响应式、组件、生命周期、Nuxt 原理',
    link: '/vue/',
  },
  {
    index: '04',
    icon: 'material-icon-theme:react',
    title: 'React / Hooks',
    desc: 'Hooks、Fiber、状态与性能优化',
    link: '/react/xp46o97u/',
  },
  {
    index: '05',
    icon: 'material-icon-theme:typescript',
    title: 'TypeScript',
    desc: '类型系统、泛型、类型编程和工程配置',
    link: '/typescript/iB2WgoFC/',
  },
  {
    index: '06',
    icon: 'material-icon-theme:rust',
    title: 'Go / Rust',
    desc: '并发、所有权、错误处理与服务端基础',
    link: '/go/',
  },
];

const heroCard = ref<HTMLElement | null>(null);
const topicsSection = ref<HTMLElement | null>(null);
const topicsVisible = ref(false);

let reduceMotion = false;
let magnetFrame = 0;
let topicObserver: IntersectionObserver | undefined;

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

  if (reduceMotion) {
    topicsVisible.value = true;
    return;
  }

  if (topicsSection.value) {
    topicObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting)
          return;

        topicsVisible.value = true;
        topicObserver?.disconnect();
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    topicObserver.observe(topicsSection.value);
  }
});

onBeforeUnmount(() => {
  resetMagnet();
  topicObserver?.disconnect();
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
            <div class="hero-badge">Open Source Contributor · Frontend Engineer</div>

            <h1 class="hero-title">Hi, I’m Aaron</h1>

            <p class="hero-subtitle">
              I build polished, practical, and developer-focused products with
              Vue, TypeScript, JavaScript, Python, and Tauri.
            </p>

            <p class="hero-description">
              I'm an open-source contributor focused on modern frontend engineering,
              desktop application experience, and developer tooling.
              I actively contribute to the JumpServer ecosystem, including projects such as
              Lina, Luna, VideoPlayer, and Client, and I care deeply about clean design,
              maintainable architecture, and refined user experience.
            </p>

            <div class="hero-tags">
              <span>Vue</span>
              <span>TypeScript</span>
              <span>JavaScript</span>
              <span>Node</span>
              <span>Rust</span>
              <span>Python</span>
              <span>Tailwind CSS</span>
              <span>Vue</span>
              <span>Nuxt</span>
              <span>React</span>
              <span>Next</span>
              <span>Electron</span>
              <span>Tauri</span>
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
              <span>17 Repositories</span>
              <span>147 Stars</span>
              <span>22 Followers</span>
            </div>
          </section>
        </div>
      </div>
    </section>

    <!-- <section
      ref="topicsSection"
      class="linear-home-section animated-topics"
      :class="{ 'is-visible': topicsVisible }"
      aria-labelledby="topics-title"
    >
      <div class="section-heading">
        <p class="linear-kicker">Topics</p>
      </div>
      <div class="linear-topic-grid">
        <a v-for="topic in topics" :key="topic.title" class="linear-topic-card" :href="withBase(topic.link)">
          <span class="topic-card-top">
            <span class="topic-index">{{ topic.index }}</span>
            <span class="topic-icon" aria-hidden="true">
              <VPIcon :name="topic.icon" />
            </span>
          </span>
          <strong>{{ topic.title }}</strong>
          <em>{{ topic.desc }}</em>
        </a>
      </div>
    </section> -->
  </div>
</template>
