import { useEffect } from 'react';
import { saveConfig } from '../lib/inputSanitizer';

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
            setTimeout(async () => {
                try {
                    await navigator.clipboard?.writeText('');
                } catch (err) {
                    //
                }
            }, 200);
        };

        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, [isConnected, isLoading, appLang]);

    return null;
};

export default ConfigHandler;
