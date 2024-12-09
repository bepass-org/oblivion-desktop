import { useState, useEffect, useCallback, useMemo } from 'react';
import { ipcRenderer } from '../../lib/utils';
import useTranslate from '../../../localization/useTranslate';
import { defaultToast } from '../../lib/toasts';

interface TestResults {
    download?: number;
    upload?: number;
    latency?: number;
    jitter?: number;
}

const MB_CONVERSION = 1_000_000;

export const useSpeedTest = () => {
    const appLang = useTranslate();
    const [testResults, setTestResults] = useState<TestResults | undefined>(undefined);
    const [isRunning, setIsRunning] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [testButtonText, setTestButtonText] = useState('play_arrow');

    useEffect(() => {
        if (!navigator.onLine) {
            defaultToast(appLang?.toast?.offline, 'ONLINE_STATUS', 3000);
        }

        ipcRenderer.on('speed-test-results', (event: any, data: any) => {
            switch (event) {
                case 'started':
                    setIsRunning(true);
                    setIsFinished(false);
                    setTestButtonText('pause');
                    break;
                case 'paused':
                    setIsRunning(false);
                    setIsFinished(false);
                    setTestButtonText('play_arrow');
                    break;
                case 'finished':
                    setIsRunning(false);
                    setIsFinished(true);
                    setTestButtonText('replay');
                    break;
                default:
                    break;
            }
            setTestResults(data);
        });
    }, [appLang?.toast?.offline]);

    const checkServerAvailability = useCallback(async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            await fetch('https://speed.cloudflare.com', {
                mode: 'no-cors',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return true;
        } catch (error) {
            console.error('Server availability check failed:', error);
            defaultToast(appLang?.speedTest?.server_unavailable, 'SPEED_TEST', 5000);
            return false;
        }
    }, [appLang?.speedTest?.server_unavailable]);

    const toggleTest = useCallback(async () => {
        if (!navigator.onLine) {
            return;
        }

        if (isRunning) {
            ipcRenderer.sendMessage('speed-test-command', 'pause');
            return;
        }

        const serverAvailable = await checkServerAvailability();
        if (!serverAvailable) {
            return;
        }

        if (isFinished) {
            ipcRenderer.sendMessage('speed-test-command', 'restart');
        } else {
            ipcRenderer.sendMessage('speed-test-command', 'play');
        }
    }, [checkServerAvailability, isFinished, isRunning]);

    const formattedResults = useMemo(() => {
        if (!testResults) return null;

        return {
            download: testResults.download
                ? (testResults.download / MB_CONVERSION).toFixed(2)
                : 'N/A',
            upload: testResults.upload ? (testResults.upload / MB_CONVERSION).toFixed(2) : 'N/A',
            latency: testResults.latency?.toFixed(2) ?? 'N/A',
            jitter: testResults.jitter?.toFixed(2) ?? 'N/A'
        };
    }, [testResults]);

    return {
        appLang,
        testResults: formattedResults,
        isRunning,
        isFinished,
        testButtonText,
        toggleTest
    };
};
