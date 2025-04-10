import { regeditVbsDirPath } from '../constants';
import regeditModule, { RegistryPutItem, promisified as regedit } from 'regedit';

const disableProxyQuickly = async () => {
    if (process.platform !== 'win32') return;
    try {
        const registryPath =
            'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings';
        const proxySettings = {
            ProxyServer: { type: 'REG_SZ', value: '' },
            ProxyOverride: { type: 'REG_SZ', value: '' },
            AutoConfigURL: { type: 'REG_SZ', value: '' },
            ProxyEnable: { type: 'REG_DWORD', value: 0 }
        };
        regeditModule.setExternalVBSLocation(regeditVbsDirPath);
        await regedit.putValue({ [registryPath]: proxySettings });
    } catch (error) {
        console.log(`Error while disabling system proxy: ${error}`);
    }
};

disableProxyQuickly();
