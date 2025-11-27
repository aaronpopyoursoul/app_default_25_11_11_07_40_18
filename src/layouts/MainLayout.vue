<template>
  <div :class="['app-container', theme]">
    <HeaderBar :is-dark="isDark" :is-animating-theme="isAnimatingTheme" @toggle-theme="toggleTheme" />
    <div class="main-wrapper">
      <SideMenu :menu-opened="menuOpened" @toggle-menu="toggleMenu" />
      <div class="app-main">
        <div class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
        </div>
        <AppFooter />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import { useTheme } from '@/hooks/useTheme'
import HeaderBar from '@/layouts/HeaderBar.vue'
import SideMenu from '@/layouts/SideMenu.vue'
import AppFooter from '@/layouts/AppFooter.vue'

const { isDark, isAnimatingTheme, theme, toggleTheme, initTheme } = useTheme()
const menuOpened = ref(true)

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
