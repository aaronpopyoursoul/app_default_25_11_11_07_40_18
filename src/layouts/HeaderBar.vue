<template>
  <el-header class="app-header">
    <div class="header-content">
      <img :src="logoMarkSrc" alt="WitSeeU" class="header-mark" />
      <img :src="logoSrc" alt="WitSeeU Logo" class="header-logo" />

      <el-breadcrumb separator="/" class="header-breadcrumb">
        <el-breadcrumb-item>WitSeeU</el-breadcrumb-item>
        <el-breadcrumb-item>{{ currentMenuLabel }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div :class="['theme-toggle', { spinning: isAnimatingTheme }]" @click="$emit('toggle-theme')" :title="isDark ? '切換為淺色模式' : '切換為深色模式'">
        <el-icon class="theme-icon">
          <Sunny v-if="!isDark" />
          <Sunny v-else class="sun-in-dark" />
        </el-icon>
      </div>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Sunny } from '@element-plus/icons-vue'
import logoHeader from '@/assets/logo-header.svg'
import logoHeaderDark from '@/assets/logo-header-dark.svg'
import logoMark from '@/assets/avatar-ai.svg'

const props = defineProps<{ isDark: boolean; isAnimatingTheme: boolean; currentMenuLabel: string }>()

const logoSrc = computed(() => (props.isDark ? logoHeader : logoHeaderDark))
const logoMarkSrc = logoMark
</script>

<style scoped>
.app-header {
  background-color: var(--header-bg);
  color: var(--header-color);
  display: flex;
  align-items: center;
  padding: 0 20px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-color);
}
.header-content { display: flex; align-items: center; width: 100%; justify-content: space-between; }
.header-mark { height: 40px; width: 40px; object-fit: contain; transition: transform .3s ease, filter .3s ease; }
.header-mark:hover { transform: scale(1.05); }
.header-logo { height: 45px; width: auto; object-fit: contain; margin-right: 24px; margin-left: 0; margin-top: 5px; }
.header-breadcrumb { flex: 1; font-size: 14px; }
.header-breadcrumb :deep(.el-breadcrumb__item),
.header-breadcrumb :deep(.el-breadcrumb__inner),
.header-breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner),
.header-breadcrumb :deep(.el-breadcrumb__separator) { color: var(--text-color); }
.header-breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) { font-weight: 500; }
.header-breadcrumb :deep(.el-breadcrumb__separator) { opacity: 0.5; margin: 0 8px; }

.theme-toggle { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; background: var(--menu-bg); box-shadow: 0 1px 3px rgba(0,0,0,0.15); transition: background .25s, transform .2s; }
.theme-toggle:hover { background: rgba(0,0,0,0.06); transform: scale(1.08); }
.dark .theme-toggle:hover { background: rgba(255,255,255,0.12); }
.theme-icon { font-size: 22px; color: #222; }
.dark .theme-icon { color: #fff; }
.sun-in-dark { filter: drop-shadow(0 0 2px rgba(255,255,255,0.6)); }
</style>
