import { ref, computed, onMounted } from 'vue'

export function useTheme() {
  const isDark = ref(false)
  const isAnimatingTheme = ref(false)
  const theme = computed(() => (isDark.value ? 'dark' : 'light'))

  const apply = () => {
    if (isDark.value) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  const toggleTheme = () => {
    isAnimatingTheme.value = true
    document.documentElement.classList.add('theme-transition')
    isDark.value = !isDark.value
    apply()
    window.setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
      isAnimatingTheme.value = false
    }, 400)
  }

  const initTheme = () => {
    apply()
  }

  onMounted(() => {
    apply()
  })

  return { isDark, isAnimatingTheme, theme, toggleTheme, initTheme }
}
