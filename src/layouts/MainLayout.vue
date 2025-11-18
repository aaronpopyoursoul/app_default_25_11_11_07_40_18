<template>
  <div :class="['app-container', theme]">
    <HeaderBar :is-dark="isDark" :is-animating-theme="isAnimatingTheme" :current-menu-label="currentMenuLabel" @toggle-theme="toggleTheme" />
    <div class="main-wrapper">
      <SideMenu :menu-opened="menuOpened" @toggle-menu="toggleMenu" />
      <div class="app-main">
        <div class="main-content">
          <transition name="fade" mode="out-in">
            <router-view />
          </transition>
        </div>
        <AppFooter />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '@/hooks/useTheme'
import HeaderBar from '@/layouts/HeaderBar.vue'
import SideMenu from '@/layouts/SideMenu.vue'
import AppFooter from '@/layouts/AppFooter.vue'

const { isDark, isAnimatingTheme, theme, toggleTheme, initTheme } = useTheme()
const menuOpened = ref(true)

const menuLabels: Record<string, string> = {
  '/chat': '智能貸款還款能力評估',
  '/csr': 'CSR 智能履歷評估',
  '/blank': 'blank page'
}

const route = useRoute()
const currentMenuLabel = computed(() => menuLabels[route.path] || '客戶財力智能分析')

const toggleMenu = () => { menuOpened.value = !menuOpened.value }
initTheme()

provide('theme', theme)
</script>

<style scoped>
.app-container { font-family: "Noto Sans TC", sans-serif; display: flex; flex-direction: column; height: 100vh; width: 100vw; }
.main-wrapper { display: flex; flex-grow: 1; overflow: hidden; min-height: 0; }
.app-main { background-color: var(--main-bg); flex-grow: 1; display: flex; flex-direction: column; overflow: hidden; }
.main-content { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
:global(.theme-transition *) { transition: background-color .35s ease, color .35s ease, border-color .35s ease, box-shadow .35s ease, fill .35s ease, stroke .35s ease; }
</style>
