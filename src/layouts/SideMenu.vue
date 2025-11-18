<template>
  <el-aside :width="menuOpened ? '200px' : '64px'" class="app-menu">
    <div :class="['menu-top', { 'menu-collapsed': !menuOpened }]">
      <el-icon class="menu-icon" @click="$emit('toggle-menu')">
        <ArrowLeftBold v-if="menuOpened" />
        <ArrowRightBold v-else />
      </el-icon>
    </div>

    <el-menu :default-active="$route.path" router class="el-menu-vertical-demo">
      <el-menu-item index="/chat">
        <el-icon class="menu-icon"><ChatDotRound /></el-icon>
        <span v-show="menuOpened" class="menu-label">智能貸款還款能力評估</span>
      </el-menu-item>
      <el-menu-item index="/csr">
        <el-icon class="menu-icon"><User /></el-icon>
        <span v-show="menuOpened" class="menu-label">CSR 智能履歷評估</span>
      </el-menu-item>
      <el-menu-item index="/blank">
        <el-icon class="menu-icon"><More /></el-icon>
        <span v-show="menuOpened" class="menu-label">blank page</span>
      </el-menu-item>
    </el-menu>

    <div :class="['user-info', { 'user-info-collapsed': !menuOpened }]">
      <img :src="userAvatarSrc" alt="Chloe" class="user-avatar" />
      <div v-show="menuOpened" class="user-details">
        <div class="user-name">Chloe</div>
        <div class="user-role">CSR Manager</div>
      </div>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { ArrowLeftBold, ArrowRightBold, ChatDotRound, More, User } from '@element-plus/icons-vue'
import userAvatarSrc from '@/assets/avatar-chloe.jpg'
const props = defineProps<{ menuOpened: boolean }>()
</script>

<style scoped>
.app-menu { background-color: var(--menu-bg); transition: width 0.3s ease; flex-shrink: 0; border-right: 1px solid var(--border-color); display: flex; flex-direction: column; }
.menu-icon { display: inline-flex; align-items: center; justify-content: center; font-size: 16px; width: 1em; height: 1em; margin-right: 8px; color: var(--text-secondary); }
.app-menu .el-menu--collapse .menu-label { display: none !important; }
.app-menu .el-menu--collapse .menu-icon { margin-right: 0 !important; }
.menu-top { display: flex; justify-content: flex-end; padding: 8px 8px 4px 8px; transition: justify-content 0.3s ease; }
.menu-top.menu-collapsed { justify-content: center; }

/* Menu 外觀（深色模式微調） */
.app-menu :deep(.el-menu) { background-color: var(--menu-bg); border-right: none; padding: 6px; }
.app-menu :deep(.el-menu-item) {
  height: 40px;
  line-height: 40px;
  margin: 4px 4px;
  border-radius: 8px;
  color: var(--el-menu-text-color, var(--text-color));
  transition: background-color .2s ease, color .2s ease;
}
.app-menu :deep(.el-menu-item:hover) {
  background-color: var(--el-menu-hover-bg-color, rgba(124, 58, 237, 0.08));
}
.app-menu :deep(.el-menu-item.is-active) {
  position: relative;
  background-color: var(--menu-active-bg, rgba(124, 58, 237, 0.14));
  color: var(--el-menu-active-color, #fff);
}
.app-menu :deep(.el-menu-item.is-active) .menu-icon { color: var(--el-color-primary); }
.app-menu :deep(.el-menu-item.is-active)::after {
  content: '';
  position: absolute;
  left: 8px;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 2px;
  background-color: var(--el-color-primary);
}

.user-info { margin-top: auto; padding: 16px; border-top: 1px solid var(--border-color); display: flex; align-items: center; gap: 12px; background-color: var(--menu-bg); transition: all 0.3s ease; }
.user-info-collapsed { justify-content: center; padding: 16px 0; }
.user-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid var(--border-color); transition: transform 0.2s ease; }
.user-avatar:hover { transform: scale(1.05); }
.user-name { font-size: 14px; font-weight: 600; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
