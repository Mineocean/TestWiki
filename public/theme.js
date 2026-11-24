(() => {
  const root = document.documentElement
  const darkQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
  let savedTheme

  try {
    savedTheme = localStorage.getItem('theme')
  } catch {
    // The site also works when browser storage is unavailable.
  }

  function resolveTheme() {
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
    return darkQuery?.matches ? 'dark' : 'light'
  }

  function applyTheme(theme) {
    root.dataset.theme = theme
    const isDark = theme === 'dark'
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-pressed', String(isDark))
      button.setAttribute('aria-label', isDark ? '切换至亮色模式' : '切换至暗色模式')
    })
  }

  if (savedTheme !== 'light' && savedTheme !== 'dark') savedTheme = null
  applyTheme(resolveTheme())

  document.addEventListener('DOMContentLoaded', () => applyTheme(resolveTheme()))

  darkQuery?.addEventListener?.('change', () => {
    if (!savedTheme) applyTheme(resolveTheme())
  })

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('[data-theme-toggle]')) return

    savedTheme = root.dataset.theme === 'dark' ? 'light' : 'dark'
    applyTheme(savedTheme)
    try {
      localStorage.setItem('theme', savedTheme)
    } catch {
      // Keep the user's choice for the current page.
    }
  })
})()
