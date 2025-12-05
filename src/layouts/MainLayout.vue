<template>
  <div class="app-container">
    <WelcomeGuide ref="welcomeGuideRef" @close="onGuideClose" @open="isWelcomeGuideVisible = true" />
    <HeaderBar @open-guide="openGuide" />
    <div class="main-wrapper">
      <!-- 手機版遮罩 -->
      <transition name="fade">
        <div 
          v-if="isMobile && menuOpened" 
          class="mobile-overlay"
          @click="closeMenu"
        ></div>
      </transition>
      
      <SideMenu 
        :menu-opened="menuOpened" 
        @toggle-menu="toggleMenu" 
        class="side-menu"
      />
      
      <div class="app-main">
        <div class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade-scale" mode="out-in">
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
        </div>
        <AppFooter />
      </div>
    </div>
    
    <!-- 手機版底部導航按鈕 (當 Menu 收合時顯示) -->
    <div class="mobile-fab" v-if="isMobile && !menuOpened" @click="toggleMenu">
      <div class="fab-icon">
        <span class="fab-line"></span>
        <span class="fab-line"></span>
        <span class="fab-line"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import HeaderBar from '@/layouts/HeaderBar.vue'
import SideMenu from '@/layouts/SideMenu.vue'
import AppFooter from '@/layouts/AppFooter.vue'
import WelcomeGuide from '@/components/WelcomeGuide.vue'

const router = useRouter()
const route = useRoute()
const menuOpened = ref(true)
const windowWidth = ref(window.innerWidth)
const welcomeGuideRef = ref()
const isWelcomeGuideVisible = ref(false)

// 提供給子組件使用，判斷是否需要等待 WelcomeGuide 關閉
provide('isWelcomeGuideVisible', isWelcomeGuideVisible)

const isMobile = computed(() => windowWidth.value < 768)

const toggleMenu = () => { menuOpened.value = !menuOpened.value }
const closeMenu = () => { menuOpened.value = false }
const openGuide = () => { 
  welcomeGuideRef.value?.open()
  isWelcomeGuideVisible.value = true
}
const onGuideClose = () => {
  isWelcomeGuideVisible.value = false
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
  if (windowWidth.value < 1024 && windowWidth.value >= 768) {
    // 平板模式預設收合
    // menuOpened.value = false
  } else if (windowWidth.value < 768) {
    // 手機模式預設收合
    menuOpened.value = false
  } else {
    // 桌面模式預設展開
    menuOpened.value = true
  }
}

// 防止上一頁與重新整理，強制回到首頁
const preventNavigationAndRefresh = () => {
  // 處理瀏覽器上一頁按鈕
  const handlePopState = (event: PopStateEvent) => {
    event.preventDefault()
    router.replace('/chat')
  }
  
  // 處理重新整理
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    // 儲存當前路徑，重新整理後跳轉到首頁
    sessionStorage.setItem('shouldRedirectToHome', 'true')
  }
  
  window.addEventListener('popstate', handlePopState)
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  // 檢查是否是重新整理後進入
  if (sessionStorage.getItem('shouldRedirectToHome') === 'true') {
    sessionStorage.removeItem('shouldRedirectToHome')
    if (route.path !== '/chat') {
      router.replace('/chat')
    }
  }
  
  // 添加歷史記錄狀態，防止回到上一頁
  if (window.history.state === null || !window.history.state.key) {
    window.history.pushState({ page: 'home' }, '', window.location.href)
  }
  
  return () => {
    window.removeEventListener('popstate', handlePopState)
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize() // 初始化狀態
  
  // 啟動防止上一頁與重新整理功能
  const cleanup = preventNavigationAndRefresh()
  
  // 確保清理函數在卸載時執行
  onUnmounted(() => {
    cleanup()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.app-container { 
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang TC", "Noto Sans TC", sans-serif; 
  display: flex; 
  flex-direction: column; 
  height: 100vh; 
  width: 100vw; 
  background-color: var(--main-bg);
}

.main-wrapper { 
  display: flex; 
  flex-grow: 1; 
  overflow: hidden; 
  min-height: 0; 
  position: relative;
}

.app-main { 
  background-color: var(--main-bg); 
  flex-grow: 1; 
  display: flex; 
  flex-direction: column; 
  overflow: hidden; 
  position: relative;
  z-index: 1;
}

.main-content { 
  flex: 1; 
  overflow: hidden; 
  display: flex; 
  flex-direction: column; 
}

/* 手機版遮罩 */
.mobile-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
  z-index: 80;
}

/* 手機版懸浮按鈕 */
.mobile-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: var(--macos-blue);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-fab:active {
  transform: scale(0.95);
}

.fab-icon {
  width: 24px;
  height: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
}

.fab-line {
  width: 100%;
  height: 2px;
  background: white;
  border-radius: 1px;
}

/* 頁面切換動畫 */
.fade-scale-enter-active, 
.fade-scale-leave-active { 
  transition: opacity 0.3s ease, transform 0.3s ease; 
}

.fade-scale-enter-from { 
  opacity: 0; 
  transform: scale(0.98);
}

.fade-scale-leave-to { 
  opacity: 0; 
  transform: scale(1.02);
}

.fade-enter-active, 
.fade-leave-active { 
  transition: opacity 0.3s ease; 
}

.fade-enter-from, 
.fade-leave-to { 
  opacity: 0; 
}
</style>
