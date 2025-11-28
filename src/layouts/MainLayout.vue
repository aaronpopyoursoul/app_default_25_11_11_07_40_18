<template>
  <div class="app-container">
    <HeaderBar />
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
import { ref } from 'vue'
import HeaderBar from '@/layouts/HeaderBar.vue'
import SideMenu from '@/layouts/SideMenu.vue'
import AppFooter from '@/layouts/AppFooter.vue'

const menuOpened = ref(true)

const toggleMenu = () => { menuOpened.value = !menuOpened.value }
</script>

<style scoped>
.app-container { font-family: "Noto Sans TC", sans-serif; display: flex; flex-direction: column; height: 100vh; width: 100vw; }
.main-wrapper { display: flex; flex-grow: 1; overflow: hidden; min-height: 0; }
.app-main { background-color: var(--main-bg); flex-grow: 1; display: flex; flex-direction: column; overflow: hidden; }
.main-content { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
