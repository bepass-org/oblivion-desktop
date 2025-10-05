import { ipcMain } from 'electron';
import settings from 'electron-settings';

ipcMain.handle('settings', (event, mode, arg) => {
    if (mode === 'get') {
        const res = settings.getSync(arg.key);
        return res;
    } else if (mode === 'getAll') {
        const res = settings.getSync();
        return res;
    } else if (mode === 'set') {
        settings.setSync(arg.key, arg.value);
        return {
            key: arg.key,
            value: arg.value
        };
    }
});
