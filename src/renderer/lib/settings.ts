import { settingsKeys } from '../../defaultSettings';
import { ipcRenderer } from './utils';

export class settings {
    public static async get(key: settingsKeys): Promise<any> {
        ipcRenderer.sendMessage('settings', {
            mode: 'get',
            key: key,
        });

        return new Promise((resolve, reject) => {
            ipcRenderer.on('settings', (res: any) => {
                try {
                    if (res.key === key) {
                        resolve(res.value);
                    } else {
                        console.error('unmatched key event!', res.key, key);
                    }
                } catch (error) {
                    console.error('settings - ipcRenderer.on - error:', error);
                    reject(error);
                }
            });
        });
    }

    public static async set(key: settingsKeys, value: any) {
        ipcRenderer.sendMessage('settings', {
            mode: 'set',
            key: key,
            value: value,
        });

        return new Promise((resolve, reject) => {
            ipcRenderer.on('settings', (res: any) => {
                try {
                    if (res.key === key) {
                        resolve(res.value);
                    } else {
                        console.error('unmatched key event!', res.key, key);
                    }
                } catch (error) {
                    console.error('settings - ipcRenderer.on - error:', error);
                    reject(error);
                }
            });
        });
    }
}
