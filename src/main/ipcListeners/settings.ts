import { ipcMain } from 'electron';
import settings from 'electron-settings';

ipcMain.on('settings', async (event, arg) => {
    if (arg.mode === 'get') {
        const res = await settings.get(arg.key);
        event.reply('settings', {
            key: arg.key,
            value: res
        });
    } else if (arg.mode === 'getAll') {
        const res = await settings.get();
        event.reply('settings', res);
    } else if (arg.mode === 'set') {
        await settings.set(arg.key, arg.value);
        event.reply('settings', {
            key: arg.key,
            value: arg.value
        });
    }
});
