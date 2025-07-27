import { ipcMain, dialog, BrowserWindow } from 'electron';

ipcMain.handle('show-open-dialog', async (event, options) => {
    const focusedWindow = BrowserWindow.getFocusedWindow();

    const dialogOptions = {
        properties: ['openFile' as const],
        filters: [
            { name: 'Executables', extensions: ['exe', 'app', 'sh', 'bat', 'cmd'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        ...options
    };

    let result;
    if (focusedWindow) {
        result = await dialog.showOpenDialog(focusedWindow, dialogOptions);
    } else {
        result = await dialog.showOpenDialog(dialogOptions);
    }

    return result;
});
