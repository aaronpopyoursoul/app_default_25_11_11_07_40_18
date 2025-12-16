<template>
  <el-aside :width="menuOpened ? '280px' : '72px'" class="app-menu">
    <!-- 收合按鈕 -->
    <div :class="['menu-toggle', { 'menu-collapsed': !menuOpened }]">
      <el-button 
        :icon="menuOpened ? ArrowLeftBold : ArrowRightBold"
        circle
        size="small"
        class="toggle-btn"
        @click="$emit('toggle-menu')"
      />
    </div>

    <!-- 導航選單 -->
    <nav class="menu-nav">
      <router-link 
        v-for="item in menuItems" 
        :key="item.path"
        :to="item.path"
        :class="['menu-item', { 'is-active': $route.path === item.path, 'is-collapsed': !menuOpened }]"
      >
        <div class="menu-item-icon">
          <component :is="item.icon" />
        </div>
        <transition name="fade-slide">
          <div v-show="menuOpened" class="menu-item-content">
            <div class="menu-item-title">{{ item.title }}</div>
            <div class="menu-item-desc">{{ item.description }}</div>
          </div>
        </transition>
      </router-link>
    </nav>

    <!-- 用戶資訊 -->
    <div :class="['user-info', { 'user-info-collapsed': !menuOpened }]">
      <img :src="userAvatarSrc" alt="Chloe" class="user-avatar" />
      <transition name="fade-slide">
        <div v-show="menuOpened" class="user-details">
          <div class="user-name">Chloe</div>
          <div class="user-role">CSR Manager</div>
        </div>
      </transition>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { ArrowLeftBold, ArrowRightBold, ChatDotRound, User } from '@element-plus/icons-vue'
import userAvatarSrc from '@/assets/avatar-chloe.jpg'

const props = defineProps<{ menuOpened: boolean }>()

const menuItems = [
  {
    path: '/chat',
    title: '智能貸款還款能力分析',
    description: 'AI 預測客戶是否有還款能力',
    icon: ChatDotRound
  },
  {
    path: '/csr',
    title: 'CSR 智能履歷分析',
    description: 'AI 精準配對職缺與人才',
    icon: User
  }
]
</script>

<style scoped>
.app-menu {
  background: var(--menu-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  border-right: 0.5px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 90;
  box-shadow: 1px 0 0 0 rgba(0, 0, 0, 0.02);
}

/* 收合按鈕 */
.menu-toggle {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  transition: all 0.3s ease;
}

.menu-toggle.menu-collapsed {
  justify-content: center;
  padding: 12px 8px;
}

.toggle-btn {
  background: rgba(0, 122, 255, 0.08);
  border: none;
  color: var(--macos-blue);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50% !important;
}

.toggle-btn:hover {
  background: rgba(0, 122, 255, 0.15);
  transform: scale(1.05);
}

/* 導航選單 */
.menu-nav {
  flex: 1;
  padding: 8px 12px;
  overflow-y: auto;
  overflow-x: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  margin-bottom: 6px;
  border-radius: 10px;
  text-decoration: none;
  color: var(--text-color);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.menu-item.is-collapsed {
  justify-content: center;
  padding: 14px 12px;
}

.menu-item:hover {
  background: rgba(0, 122, 255, 0.06);
  transform: translateX(2px);
}

.menu-item.is-active {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.12) 0%, rgba(90, 200, 250, 0.08) 100%);
  color: var(--macos-blue);
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.15);
}

.menu-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: var(--macos-blue);
}

.menu-item-icon {
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  transition: transform 0.25s ease;
}

.menu-item:hover .menu-item-icon {
  transform: scale(1.1);
}

.menu-item.is-active .menu-item-icon {
  color: var(--macos-blue);
}

.menu-item-content {
  flex: 1;
  min-width: 0;
}

.menu-item-title {
  font-size: 14px;
  font-weight: 500;
  color: inherit;
  line-height: 1.3;
  margin-bottom: 3px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang TC", "Microsoft JhengHei", sans-serif;
  letter-spacing: -0.2px;
}

.menu-item-desc {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang TC", "Microsoft JhengHei", sans-serif;
}

.menu-item.is-active .menu-item-desc {
  color: rgba(0, 122, 255, 0.7);
}

/* 用戶資訊 */
.user-info {
  margin-top: auto;
  padding: 16px;
  border-top: 0.5px solid var(--glass-border);
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.02));
  transition: all 0.3s ease;
}

.user-info-collapsed {
  justify-content: center;
  padding: 16px 8px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid var(--glass-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-avatar:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang TC", sans-serif;
  letter-spacing: -0.3px;
}

.user-role {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

/* 動畫效果 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* 滾動條樣式 */
.menu-nav::-webkit-scrollbar {
  width: 6px;
}

.menu-nav::-webkit-scrollbar-track {
  background: transparent;
}

.menu-nav::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.menu-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* RWD 響應式 */
@media (max-width: 1024px) and (min-width: 769px) {
  /* 中等螢幕：展開時保持 280px，收合時縮小至 64px */
  .app-menu[style*="width: 72px"] {
    width: 64px !important;
  }
  
  .app-menu[style*="width: 280px"] {
    width: 260px !important;
  }
  
  /* 收合狀態優化 */
  .menu-toggle.menu-collapsed {
    padding: 12px 4px;
  }
  
  /* 選單項目收合時優化 */
  .menu-item.is-collapsed {
    padding: 12px 8px;
  }
}

@media (max-width: 768px) {
  .app-menu {
    position: fixed;
    left: 0;
    top: 48px;
    bottom: 0;
    width: 280px !important;
    transform: translateX(-100%);
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 999;
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
  }
  
  .app-menu[style*="width: 280px"] {
    transform: translateX(0);
  }
  
  .menu-toggle {
    display: none;
  }
}
</style>
