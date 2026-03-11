<script setup lang="ts">
import { computed, onMounted, provide, ref, useTemplateRef, watch } from 'vue'

const { title, height = '320px', entryFile } = defineProps<{
  title?: string
  height?: string
  entryFile?: string
}>()

const activeNode = ref(entryFile || '')
const isEmpty = ref(true)
const collapsed = ref(false)
const codePanel = useTemplateRef<HTMLDivElement>('codePanel')

provide('active-file-tree-node', activeNode)
provide('on-file-tree-node-click', (filepath: string, type: 'file' | 'folder') => {
  if (type === 'file') {
    activeNode.value = filepath
  }
})

const rootStyle = computed(() => ({
  '--code-tree-columns': collapsed.value
    ? '56px minmax(0, 1fr)'
    : 'minmax(220px, 1fr) minmax(0, 2fr)',
}))

function togglePanel() {
  collapsed.value = !collapsed.value
}

onMounted(() => {
  watch(
    () => activeNode.value,
    () => {
      if (codePanel.value) {
        const items = Array.from(codePanel.value.querySelectorAll('.code-block-title'))
        let hasActive = false

        items.forEach((item) => {
          if (item.getAttribute('data-title') === activeNode.value) {
            item.classList.add('active')
            hasActive = true
          }
          else {
            item.classList.remove('active')
          }
        })

        isEmpty.value = !hasActive
      }
    },
    { immediate: true },
  )
})
</script>

<template>
  <div class="vp-code-tree is-collapsible" :style="rootStyle">
    <div class="code-tree-panel" :style="{ 'max-height': height }">
      <div v-if="title" class="code-tree-title" :title="title">
        <span v-show="!collapsed" class="code-tree-title-text">{{ title }}</span>
        <button
          class="code-tree-toggle"
          type="button"
          :aria-expanded="String(!collapsed)"
          :aria-label="collapsed ? '展开文件树' : '折叠文件树'"
          @click="togglePanel"
        >
          <span class="code-tree-toggle-icon">{{ collapsed ? '>' : '<' }}</span>
        </button>
      </div>
      <div v-show="!collapsed" class="vp-file-tree">
        <slot name="file-tree" />
      </div>
    </div>

    <div ref="codePanel" class="code-panel" :style="{ height }">
      <slot />
      <div v-if="isEmpty" class="code-tree-empty">
        <span class="vpi-code-tree-empty" />
      </div>
    </div>
  </div>
</template>

<style>
.vp-code-tree.is-collapsible {
  width: 100%;
  margin: 16px 0;
  display: grid;
  grid-template-columns: var(--code-tree-columns);
  overflow: hidden;
  border: solid 1px var(--vp-c-divider);
  border-radius: 6px;
}

.vp-code-tree.is-collapsible .code-tree-panel {
  display: flex;
  flex-direction: column;
  border-bottom: solid 1px var(--vp-c-divider);
  border-right: solid 1px var(--vp-c-divider);
  border-bottom: none;
}

.vp-code-tree.is-collapsible .code-tree-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 40px;
  padding: 0 10px 0 16px;
  overflow: hidden;
  border-bottom: solid 1px var(--vp-c-divider);
}

.vp-code-tree.is-collapsible .code-tree-title-text {
  overflow: hidden;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vp-code-tree.is-collapsible .code-tree-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  padding: 0;
  color: var(--vp-c-text-2);
  cursor: pointer;
  background: transparent;
  border: solid 1px var(--vp-c-divider);
  border-radius: 6px;
}

.vp-code-tree.is-collapsible .code-tree-toggle:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}

.vp-code-tree.is-collapsible .code-tree-toggle-icon {
  font-size: 12px;
  line-height: 1;
}

.vp-code-tree.is-collapsible .code-tree-panel .vp-file-tree {
  flex: 1 2;
  margin: 0;
  overflow: auto;
  background-color: transparent;
  border: none;
  border-radius: 0;
}

.vp-code-tree.is-collapsible .code-tree-panel .vp-file-tree .vp-file-tree-info.file {
  cursor: pointer;
}

.vp-code-tree.is-collapsible .code-panel {
  min-width: 0;
  grid-column: auto !important;
  grid-row: auto !important;
}

.vp-code-tree.is-collapsible .code-panel div[class*='language-'] {
  flex: 1 2;
  margin: 16px 0 0;
  overflow: auto;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.vp-code-tree.is-collapsible .code-tree-panel .vp-file-tree,
.vp-code-tree.is-collapsible .code-panel div[class*='language-'] {
  overscroll-behavior: contain;
}

.vp-code-tree.is-collapsible .code-panel .code-block-title {
  display: none;
  height: 100%;
}

.vp-code-tree.is-collapsible .code-panel .code-block-title.active {
  display: flex;
  flex-direction: column;
}

.vp-code-tree.is-collapsible .code-panel .code-block-title .code-block-title-bar {
  margin-top: 0;
  border-radius: 0;
}

.vp-code-tree.is-collapsible .code-panel div[class*='language-'].has-collapsed-lines.collapsed {
  height: auto;
  overflow: auto;
}

.vp-code-tree.is-collapsible .code-panel div[class*='language-'].has-collapsed-lines .collapsed-lines {
  display: none;
}

.vp-code-tree.is-collapsible .code-panel .code-tree-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.vp-code-tree.is-collapsible .code-panel .code-tree-empty .vpi-code-tree-empty {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'%3E%3Cpath fill='%23000' d='m198.24 62.63l15.68-17.25a8 8 0 0 0-11.84-10.76L186.4 51.86A95.95 95.95 0 0 0 57.76 193.37l-15.68 17.25a8 8 0 1 0 11.84 10.76l15.68-17.24A95.95 95.95 0 0 0 198.24 62.63M48 128a80 80 0 0 1 127.6-64.25l-107 117.73A79.63 79.63 0 0 1 48 128m80 80a79.55 79.55 0 0 1-47.6-15.75l107-117.73A79.95 79.95 0 0 1 128 208'/%3E%3C/svg%3E");

  width: 128px;
  height: 128px;
  color: var(--vp-c-default-soft);
}
</style>
