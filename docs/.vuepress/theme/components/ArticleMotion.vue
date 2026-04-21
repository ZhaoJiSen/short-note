<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue';
import { useRoute } from 'vuepress/client';

const route = useRoute();

let observer: IntersectionObserver | undefined;
let calloutToneObserver: MutationObserver | undefined;
let reduceMotion = false;

const revealSelector = [
  'h2',
  'h3',
  'h4',
  'p',
  'ul',
  'ol',
  'blockquote',
  'table',
  'figure',
  '.custom-block',
  '.hint-container',
  '.vp-collapse',
  '.vp-steps',
  'div[class*="language-"]',
].join(',');

function cleanupReveal() {
  observer?.disconnect();
  observer = undefined;
  document.querySelectorAll('.motion-reveal').forEach((element) => {
    element.classList.remove('motion-reveal', 'is-visible');
  });
}

function setupCalloutTone() {
  const doc = document.querySelector('.vp-doc');

  if (!doc)
    return;

  doc.querySelectorAll<HTMLElement>('.hint-container').forEach((container) => {
    const title = container.querySelector<HTMLElement>('.hint-container-title')?.textContent?.trim();
    const isGithubAlert = container.classList.contains('github-alert-source');

    container.classList.toggle('github-alert', isGithubAlert);
    container.classList.toggle('plume-callout', Boolean(title && !isGithubAlert));
  });
}

function watchCalloutTone() {
  setupCalloutTone();

  calloutToneObserver?.disconnect();

  const doc = document.querySelector('.vp-doc');

  if (!doc)
    return;

  calloutToneObserver = new MutationObserver(() => setupCalloutTone());
  calloutToneObserver.observe(doc, {
    childList: true,
    subtree: true,
  });
}

async function setupReveal() {
  await nextTick();
  watchCalloutTone();
  await new Promise(resolve => window.setTimeout(resolve, 40));

  cleanupReveal();
  setupCalloutTone();

  if (reduceMotion)
    return;

  const doc = document.querySelector('.vp-doc');

  if (!doc || doc.querySelector('.linear-home-shell'))
    return;

  const elements = Array.from(doc.querySelectorAll<HTMLElement>(revealSelector))
    .filter((element) => {
      if (element.closest('.linear-home-shell, .vp-code-tree, .vp-demo-wrapper, .vp-code-tabs-nav, .vp-doc-aside-outline'))
        return false;

      if (
        element.parentElement?.closest(
          '.custom-block, .hint-container, .vp-collapse, blockquote, table, li, div[class*="language-"]',
        )
      ) {
        return element.matches('.custom-block, .hint-container, .vp-collapse, blockquote, table, div[class*="language-"]');
      }

      return true;
    });

  if (!elements.length)
    return;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          continue;
        }

        entry.target.classList.remove('is-visible');
      }
    },
    {
      threshold: 0.04,
      rootMargin: '0px 0px -6% 0px',
    },
  );

  elements.forEach((element, index) => {
    element.classList.add('motion-reveal');
    element.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 28}ms`);
    observer?.observe(element);
  });
}

onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  watchCalloutTone();
  setupReveal();
});

watch(() => route.path, () => {
  setupReveal();
});

onBeforeUnmount(() => {
  cleanupReveal();
  calloutToneObserver?.disconnect();
  calloutToneObserver = undefined;
});
</script>

<template>
  <span class="article-motion-sentinel" aria-hidden="true" />
</template>
