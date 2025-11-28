<template>
  <el-footer class="app-footer">
    <div class="footer-content">
      <span>© 2025 WitsSeeU. All Rights Reserved.</span>
      <div class="footer-links">
        <a href="#" class="footer-link">Privacy</a>
        <span class="divider">·</span>
        <a href="#" class="footer-link">Terms</a>
      </div>
    </div>
  </el-footer>
</template>
<script setup lang="ts">
// 無邏輯，僅標記為 TS
</script>
<style scoped>
.app-footer {
  background: var(--footer-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  color: var(--text-secondary);
  text-align: center;
  height: 40px !important;
  flex-shrink: 0;
  border-top: 0.5px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  font-size: 11px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang TC", sans-serif;
  letter-spacing: 0.2px;
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 16px;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.footer-content:hover {
  opacity: 1;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--macos-blue);
}

.divider {
  color: var(--border-color);
}

@media (max-width: 480px) {
  .footer-links {
    display: none;
  }
}
</style>
