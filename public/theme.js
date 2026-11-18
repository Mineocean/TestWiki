(() => {
  const root = document.documentElement
  let savedTheme

  try {
    savedTheme = localStorage.getItem('theme')
  } catch {
    // The site also works when browser storage is unavailable.
  }

  function applyTheme(theme) {
    root.dataset.theme = theme
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-pressed', String(theme === 'dark'))
    })
  }

  if (savedTheme !== 'light' && savedTheme !== 'dark') savedTheme = null
  applyTheme(savedTheme ?? 'light')

  document.addEventListener('DOMContentLoaded', () => applyTheme(savedTheme ?? 'light'))

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
