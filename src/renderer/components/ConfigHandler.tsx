import { useEffect } from 'react';
import { settings } from '../lib/settings';
import { ipcRenderer } from '../lib/utils';
import toast from 'react-hot-toast';
import { defaultToast, settingsHaveChangedToast } from '../lib/toasts';
import { newProfile, sanitizeConfig, saveConfig, validateConfig } from '../lib/inputSanitizer';

const ConfigHandler = ({ isConnected, isLoading, appLang }: any) => {
    useEffect(() => {
        /*ipcRenderer.on('process-url', (url: any) => {
            if (typeof url === 'string' && url !== '') {
                saveConfig(url, isConnected, isLoading, appLang);
            }
        });*/

        const handlePaste = (event: ClipboardEvent) => {
            event.preventDefault();
            let pastedText = event.clipboardData?.getData('Text') || '';
            saveConfig(pastedText, isConnected, isLoading, appLang);
        };

        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, [isConnected, isLoading, appLang]);

    return null;
};

export default ConfigHandler;
