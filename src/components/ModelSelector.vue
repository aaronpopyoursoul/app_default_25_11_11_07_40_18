<template>
  <el-dropdown @command="onCommand" trigger="click" class="model-selector">
    <span class="model-dropdown-trigger">
      <component :is="current.icon || ChatDotRound" class="model-icon" />
      <span class="model-label">{{ modelValue }}</span>
      <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu class="model-dropdown-menu">
        <el-dropdown-item
          v-for="option in normalizedOptions"
          :key="option.value"
          :command="option.value"
          :class="{ 'is-selected': modelValue === option.value }"
          class="model-dropdown-item"
        >
          <component :is="option.icon" class="item-icon" />
          <div class="item-content">
            <div class="item-label">{{ option.label }}</div>
            <div class="item-description">{{ option.description }}</div>
          </div>
          <el-icon v-if="modelValue === option.value" class="check-icon"><Check /></el-icon>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChatDotRound, ArrowDown, Check } from '@element-plus/icons-vue'
import type { ModelOption } from '@/constants/models'
import { MODEL_OPTIONS } from '@/constants/models'

const props = withDefaults(defineProps<{ modelValue: string; options: ModelOption[] }>(), {
  modelValue: 'GPT-5 mini',
  options: () => [] as ModelOption[]
})
const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'change', val: string): void
}>()

const normalizedOptions = computed<ModelOption[]>(() => props.options?.length ? props.options : MODEL_OPTIONS)
const current = computed<ModelOption>(() => normalizedOptions.value.find(m => m.value === props.modelValue) || normalizedOptions.value[0])

function onCommand(val: string) {
  emit('update:modelValue', val)
  emit('change', val)
}
</script>

<style scoped>
.model-selector {
  display: inline-flex;
}

.model-dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-color);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  user-select: none;
}
.model-dropdown-trigger:hover {
  background-color: rgba(124, 58, 237, 0.08);
  border-color: var(--el-color-primary);
}
.dark .model-dropdown-trigger { background-color: rgba(255, 255, 255, 0.05); }
.dark .model-dropdown-trigger:hover { background-color: rgba(124, 58, 237, 0.15); }

.model-icon { font-size: 16px; color: var(--el-color-primary); }
.model-label { white-space: nowrap; color: var(--text-color); }
.dropdown-arrow { font-size: 14px; color: var(--text-color); opacity: 0.6; transition: transform 0.2s ease; }

.model-dropdown-menu {
  background-color: var(--card-bg) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 12px !important;
  padding: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  min-width: 240px !important;
}
.dark .model-dropdown-menu { background-color: #1a1f2e !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important; }

.model-dropdown-item {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  padding: 10px 12px !important;
  border-radius: 8px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  color: var(--text-color) !important;
  border: 1px solid transparent !important;
}
.model-dropdown-item:hover { background-color: rgba(124, 58, 237, 0.03) !important; border: 1px solid rgba(124, 58, 237, 0.2) !important; }
.dark .model-dropdown-item:hover { background-color: rgba(255, 255, 255, 0.08) !important; border: 1px solid rgba(124, 58, 237, 0.4) !important; }
.model-dropdown-item.is-selected { background-color: rgba(124, 58, 237, 0.12) !important; }
.dark .model-dropdown-item.is-selected { background-color: rgba(124, 58, 237, 0.2) !important; }

.item-icon { font-size: 20px; color: var(--el-color-primary); flex-shrink: 0; width: 20px; height: 20px; margin-right: 6px; }
.item-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.item-label { font-size: 14px; font-weight: 600; color: var(--text-color); }
.item-description { font-size: 12px; color: var(--text-color); opacity: 0.6; }
.check-icon { font-size: 16px; color: var(--el-color-primary); flex-shrink: 0; }
</style>
