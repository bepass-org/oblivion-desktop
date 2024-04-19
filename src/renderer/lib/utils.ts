export const ipcRenderer = window.electron.ipcRenderer;

export const saveSettings = (key:string, value:any) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

export const loadSettings = (key:string) => {
    if (typeof window !== 'undefined') {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : false;
    }
    return false;
};

export const loadThemeMode = () => {
    let theme = loadSettings('OBLIVION_THEME');
    if (!theme) {
        theme = 'light';
        saveSettings('OBLIVION_THEME', theme);
    }
    document.documentElement.setAttribute('data-bs-theme', theme);
};

export const isDev = () => window.electron.nodeEnv === 'development';
