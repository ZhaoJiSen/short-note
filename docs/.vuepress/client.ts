import { defineClientConfig } from 'vuepress/client';
import { onBeforeUnmount, onMounted } from 'vue';
// import RepoCard from 'vuepress-theme-plume/features/RepoCard.vue'
// import NpmBadge from 'vuepress-theme-plume/features/NpmBadge.vue'
// import NpmBadgeGroup from 'vuepress-theme-plume/features/NpmBadgeGroup.vue'
// import Swiper from 'vuepress-theme-plume/features/Swiper.vue'

// import CustomComponent from './theme/components/Custom.vue'
import VPCodeTree from './theme/components/VPCodeTree.vue';
import HomeLanding from './theme/components/HomeLanding.vue';
import ArticleMotion from './theme/components/ArticleMotion.vue';

import './theme/styles/custom.css';

function createClickSpark(event: PointerEvent) {
  const sparkCount = 8;

  if (event.button !== 0 || event.pointerType === 'touch')
    return;

  const target = event.target;

  if (
    target instanceof Element
    && target.closest('input, textarea, select, [contenteditable="true"]')
  ) {
    return;
  }

  const spark = document.createElement('span');
  spark.className = 'click-spark';
  spark.style.left = `${event.clientX}px`;
  spark.style.top = `${event.clientY}px`;

  for (let index = 0; index < sparkCount; index += 1) {
    const ray = document.createElement('i');
    ray.style.setProperty('--spark-angle', `${index * (360 / sparkCount)}deg`);
    spark.append(ray);
  }

  document.body.append(spark);
  window.setTimeout(() => spark.remove(), 760);
}

export default defineClientConfig({
  enhance({ app }) {
    // built-in components
    // app.component('RepoCard', RepoCard)
    // app.component('NpmBadge', NpmBadge)
    // app.component('NpmBadgeGroup', NpmBadgeGroup)
    // app.component('Swiper', Swiper) // you should install `swiper`
    // your custom components
    // app.component('CustomComponent', CustomComponent)
    app.component('HomeLanding', HomeLanding);
    app.component('VPCodeTree', VPCodeTree);
  },
  setup() {
    onMounted(() => {
      document.addEventListener('pointerdown', createClickSpark, { passive: true, capture: true });
    });

    onBeforeUnmount(() => {
      document.removeEventListener('pointerdown', createClickSpark, { capture: true });
    });
  },
  rootComponents: [
    ArticleMotion,
  ],
});
