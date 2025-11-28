<template>
  <el-header class="app-header">
    <div class="header-content">
      <div class="header-left">
        <img :src="logoMarkSrc" alt="WitSeeU" class="header-mark" @click="$emit('open-guide')" />
        <img :src="logoSrc" alt="WitSeeU Logo" class="header-logo" />
      </div>
      <div class="header-center">
        <h1 class="header-title">WitSeeU AI Platform</h1>
      </div>
      <div class="header-right">
        <!-- 可以在這裡添加用戶圖標、通知等 -->
      </div>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import logoHeaderDark from '@/assets/logo-header-dark.svg'
import logoMark from '@/assets/avatar-ai.svg'

const logoSrc = logoHeaderDark
const logoMarkSrc = logoMark
</script>

<style scoped>
.app-header {
  background: var(--header-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  color: var(--header-color);
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 52px !important;
  flex-shrink: 0;
  border-bottom: 0.5px solid var(--glass-border);
  box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.03);
  position: relative;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-mark {
  height: 42px;
  width: 42px;
  object-fit: contain;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  cursor: pointer;
}

.header-mark:hover {
  transform: scale(1.08) rotate(5deg);
}

.header-logo {
  height: 34px;
  width: auto;
  object-fit: contain;
  transition: opacity 0.25s ease;
}

.header-logo:hover {
  opacity: 0.8;
}

.header-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
  letter-spacing: -0.4px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang TC", "Microsoft JhengHei", sans-serif;
}

.header-right {
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

/* RWD 響應式 */
@media (max-width: 768px) {
  .app-header {
    padding: 0 16px;
    height: 48px !important;
  }
  
  .header-title {
    font-size: 15px;
  }
  
  .header-mark {
    height: 36px;
    width: 36px;
  }
  
  .header-logo {
    height: 28px;
  }
}

@media (max-width: 480px) {
  .header-center {
    display: none;
  }
  
  .header-right {
    min-width: auto;
  }
}
</style>
