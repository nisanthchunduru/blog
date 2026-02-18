(function() {
  function getTheme() {
    const stored = localStorage.getItem('theme');
    if (stored) {
      return stored;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      const lightTheme = document.getElementById('hljs-light');
      const darkTheme = document.getElementById('hljs-dark');
      if (lightTheme) lightTheme.media = 'none';
      if (darkTheme) darkTheme.media = 'all';
    } else {
      document.documentElement.classList.remove('dark');
      const lightTheme = document.getElementById('hljs-light');
      const darkTheme = document.getElementById('hljs-dark');
      if (lightTheme) lightTheme.media = 'all';
      if (darkTheme) darkTheme.media = 'none';
    }
    localStorage.setItem('theme', theme);
    updateToggleButton(theme);
  }

  function updateToggleButton(theme) {
    const toggleButton = document.getElementById('dark-mode-toggle');
    if (!toggleButton) return;
    toggleButton.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
  }

  function initTheme() {
    const currentTheme = getTheme();
    setTheme(currentTheme);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  window.toggleDarkMode = function() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };
})();
