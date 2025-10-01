import { ipcMain } from 'electron';
import settings from 'electron-settings';

ipcMain.handle('settings', async (event, mode, arg) => {
    if (mode === 'get') {
        const res = await settings.get(arg.key);
        return res;
    } else if (mode === 'getAll') {
        const res = await settings.get();
        return res;
    } else if (mode === 'set') {
        await settings.set(arg.key, arg.value);
        return {
            key: arg.key,
            value: arg.value
        };
    }
});
