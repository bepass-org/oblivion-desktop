export const ipcRenderer = window.electron.ipcRenderer;

// TODO remove
export const saveSettings = (key: string, value: any) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

// TODO remove
export const loadSettings = (key: string) => {
    if (typeof window !== 'undefined') {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : false;
    }
    return false;
};

export const isDev = () => window.electron.nodeEnv === 'development';
