<script setup lang="ts">
import VPIcon from '@theme/VPIcon.vue';
import { withBase } from 'vuepress/client';

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

const routes = [
  { title: '基础知识', desc: '语言、类型、浏览器基础', link: '/javascript/' },
  { title: '框架相关', desc: 'Vue、React、Electron', link: '/vue/' },
  { title: '工程实践', desc: '构建、依赖、发布、规范', link: '/package-manager/ghjscjaz/' },
  { title: '博客文章', desc: '阶段性记录和专题文章', link: '/blog/' },
];
</script>

<template>
  <div class="linear-home-shell">
    <section class="linear-home-hero" aria-label="个人简介展示">
      <div class="vp-demo-wrapper normal linear-profile-demo">
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
              <a href="https://github.com/jumpserver">
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

    <section class="linear-home-section" aria-labelledby="topics-title">
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
    </section>
  </div>
</template>
