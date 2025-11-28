<template>
  <el-header class="app-header">
    <div class="header-content">
      <img :src="logoMarkSrc" alt="WitSeeU" class="header-mark" />
      <img :src="logoSrc" alt="WitSeeU Logo" class="header-logo" />
      <div class="spacer"></div>
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
.spacer { flex: 1; }
</style>
