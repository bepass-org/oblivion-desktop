import { FC, useEffect } from 'react';
import { saveConfig } from '../lib/inputSanitizer';
import { Language } from '../../localization/type';

interface ConfigHandlerProps {
    isConnected: boolean;
    isLoading: boolean;
    appLang: Language;
}

const ConfigHandler: FC<ConfigHandlerProps> = ({ isConnected, isLoading, appLang }) => {
    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            event.preventDefault();
            const pastedText = event.clipboardData?.getData('Text') || '';
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
