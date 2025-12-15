(function() {
  // Function to get the current theme
  function getTheme() {
    // Check localStorage first
    const stored = localStorage.getItem('theme');
    if (stored) {
      return stored;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  // Function to set the theme
  function setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      // Switch highlight.js theme
      const lightTheme = document.getElementById('hljs-light');
      const darkTheme = document.getElementById('hljs-dark');
      if (lightTheme) lightTheme.media = 'none';
      if (darkTheme) darkTheme.media = 'all';
    } else {
      document.documentElement.classList.remove('dark');
      // Switch highlight.js theme
      const lightTheme = document.getElementById('hljs-light');
      const darkTheme = document.getElementById('hljs-dark');
      if (lightTheme) lightTheme.media = 'all';
      if (darkTheme) darkTheme.media = 'none';
    }
    localStorage.setItem('theme', theme);
    updateToggleButton(theme);
  }

  // Function to update toggle button state
  function updateToggleButton(theme) {
    const toggleButton = document.getElementById('dark-mode-toggle');
    if (!toggleButton) return;
    
    // Update aria-checked for accessibility
    toggleButton.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
    
    // The toggle switch state is controlled by the dark class on html element
    // The CSS classes handle the visual state automatically
  }

  // Initialize theme on page load
  function initTheme() {
    const currentTheme = getTheme();
    setTheme(currentTheme);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // Expose toggle function globally
  window.toggleDarkMode = function() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };
})();

