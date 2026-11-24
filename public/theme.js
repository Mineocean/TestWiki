(() => {
  const darkQuery = window.matchMedia?.('(prefers-color-scheme: dark)')

  function readSavedTheme() {
    try {
      const saved = localStorage.getItem('theme')
      return saved === 'light' || saved === 'dark' ? saved : null
    } catch {
      return null
    }
  }

  function resolveTheme() {
    return readSavedTheme() ?? (darkQuery?.matches ? 'dark' : 'light')
  }

  function applyTheme(theme) {
    const root = document.documentElement
    root.dataset.theme = theme
    root.style.colorScheme = theme
    const isDark = theme === 'dark'
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-pressed', String(isDark))
      button.setAttribute('aria-label', isDark ? '切换至亮色模式' : '切换至暗色模式')
    })
  }

  function handleClick(event) {
    if (!(event.target instanceof Element) || !event.target.closest('[data-theme-toggle]')) return

    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    applyTheme(nextTheme)
    try {
      localStorage.setItem('theme', nextTheme)
    } catch {
      // Keep the user's choice for the current page.
    }
  }

  function handleReady() {
    applyTheme(resolveTheme())
  }

  function handleSystemChange() {
    if (!readSavedTheme()) applyTheme(resolveTheme())
  }

  const state = window.__sageTheme
  if (state) {
    document.removeEventListener('click', state.handleClick)
    document.removeEventListener('DOMContentLoaded', state.handleReady)
    window.removeEventListener('pageshow', state.handleReady)
    state.darkQuery?.removeEventListener?.('change', state.handleSystemChange)
  }

  window.__sageTheme = { darkQuery, handleClick, handleReady, handleSystemChange }

  applyTheme(resolveTheme())
  document.addEventListener('DOMContentLoaded', handleReady)
  window.addEventListener('pageshow', handleReady)
  darkQuery?.addEventListener?.('change', handleSystemChange)
  document.addEventListener('click', handleClick)
})()
