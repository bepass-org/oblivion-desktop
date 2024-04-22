import { ipcMain } from 'electron';
import settings from 'electron-settings';

ipcMain.on('settings', async (event, arg) => {
    console.log('🚀 - ipcMain.on - arg:', arg);
    if (arg.mode === 'get') {
        const res = await settings.get(arg.key);
        console.log('🚀 - ipcMain.on - res:', res);
        event.reply('settings', {
            key: arg.key,
            value: res,
        });
    } else if (arg.mode === 'set') {
        await settings.set(arg.key, arg.value);
        event.reply('settings', {
            key: arg.key,
            value: arg.value,
        });
    }
});
