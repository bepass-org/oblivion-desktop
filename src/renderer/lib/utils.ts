export const { ipcRenderer, platform, NODE_ENV, username } = window.electron;

export const isDev = () => window.electron.NODE_ENV === 'development';

export const onEscapeKeyPressed = (callback = () => {}) => {
    document.body.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            callback();
        }
    });
};

export const formatNetworkStat = (
    speed: number | null,
    precision: number = 2
): { value: string; unit: string } => {
    if (speed == null || speed < 0) return { value: 'N/A', unit: 'N/A' };

    const units = ['B', 'KB', 'MB', 'GB'];
    let index = 0;

    while (speed >= 1024 && index < units.length - 1) {
        speed /= 1024;
        index++;
    }

    return { value: parseFloat(speed.toFixed(precision)).toString(), unit: units[index] };
};
