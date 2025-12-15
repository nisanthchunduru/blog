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

  // Function to update toggle button icon
  function updateToggleButton(theme) {
    const toggleButton = document.getElementById('dark-mode-toggle');
    if (!toggleButton) return;
    
    const sunIcon = toggleButton.querySelector('.sun-icon');
    const moonIcon = toggleButton.querySelector('.moon-icon');
    
    if (theme === 'dark') {
      sunIcon?.classList.remove('hidden');
      moonIcon?.classList.add('hidden');
    } else {
      sunIcon?.classList.add('hidden');
      moonIcon?.classList.remove('hidden');
    }
  }

  // Initialize theme on page load
  const currentTheme = getTheme();
  setTheme(currentTheme);

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

