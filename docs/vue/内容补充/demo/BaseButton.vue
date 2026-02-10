<script setup lang="ts">
import { useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const emit = defineEmits<{
  (event: 'press', payload: MouseEvent): void
}>()

const attrs = useAttrs()

function handleClick(event: MouseEvent) {
  // 组件自定义事件
  emit('press', event)

  // 透传父组件的原生点击监听
  const onClick = attrs.onClick as ((e: MouseEvent) => void) | undefined
  if (onClick) onClick(event)
}
</script>

<template>
  <button class="btn" v-bind="attrs" type="button" @click="handleClick">
    <slot />
  </button>
</template>
