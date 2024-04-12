export const ipcRenderer = window.electron.ipcRenderer;

export const toggleDarkMode = () => {
    const theme = document.documentElement.getAttribute('data-bs-theme');
    console.log('🚀 - toggleDarkMode - theme:', theme);
    if (theme === 'light') {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else if (theme === 'dark') {
        document.documentElement.setAttribute('data-bs-theme', 'light');
    } else {
        document.documentElement.setAttribute('data-bs-theme', 'light');
    }
};
