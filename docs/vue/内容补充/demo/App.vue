<script setup lang="ts">
import BaseButton from './BaseButton.vue';
import { ref } from 'vue'

const press = ref('--')
const native = ref('--')

function handlePress() {
  press.value = 'press: 子组件自定义事件'
}

function handleNativeClick() {
  native.value = 'click: 原生事件透传'
}
</script>

<template>
  <BaseButton
    id="save-btn"
    class="primary"
    data-testid="save"
    @press="handlePress"
    @click="handleNativeClick"
  >
    保存
  </BaseButton>

  <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
    <span>{{ press }}</span>
    <span>{{ native }}</span>
  </div>
</template>
