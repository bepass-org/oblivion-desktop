export const ipcRenderer = window.electron.ipcRenderer;

export const setLightMode = () => {
    localStorage.setItem('data-bs-theme', 'light');
    document.documentElement.setAttribute('data-bs-theme', 'light');
};

export const setDarkMode = () => {
    localStorage.setItem('data-bs-theme', 'dark');
    document.documentElement.setAttribute('data-bs-theme', 'dark');
};

export const toggleDarkMode = () => {
    const theme = document.documentElement.getAttribute('data-bs-theme');
    if (theme === 'light') {
        setDarkMode();
    } else if (theme === 'dark') {
        setLightMode();
    } else {
        setLightMode();
    }
};

export const loadThemeMode = () => {
    const theme = localStorage.getItem('data-bs-theme');
    if (!theme) {
        localStorage.setItem('data-bs-theme', 'light');
    } else {
        if (theme === 'light') {
            setLightMode();
        } else if (theme === 'dark') {
            setDarkMode();
        } else {
            setLightMode();
        }
    }
};

export const isDev = () => window.electron.nodeEnv === 'development';
