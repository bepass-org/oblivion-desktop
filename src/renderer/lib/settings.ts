import { settingsKeys } from '../../defaultSettings';
import { ipcRenderer } from './utils';

export class settings {
    public static async get(key: settingsKeys): Promise<any> {
        return ipcRenderer.invoke('settings', 'get', { key }).catch((error) => {
            console.error('settings - ipcRenderer.on - error:', error);
        });
    }

    public static async getMultiple(keys: string[]): Promise<any> {
        return ipcRenderer
            .invoke('settings', 'getAll')
            .then((res: any) => {
                const filteredObj = Object.entries(res).reduce((acc: any, [key, value]) => {
                    if (keys.includes(key)) {
                        acc[key] = value;
                    }
                    return acc;
                }, {});
                return filteredObj;
            })
            .catch((error) => {
                console.error('settings - ipcRenderer.on - error:', error);
            });
    }

    public static async set(key: settingsKeys, value: any) {
        return ipcRenderer
            .invoke('settings', 'set', { key, value })
            .then((res: any) => {
                return res;
            })
            .catch((error) => {
                console.error('settings - ipcRenderer.on - error:', error);
            });
    }
}
