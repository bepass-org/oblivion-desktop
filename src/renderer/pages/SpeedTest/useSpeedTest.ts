import { useState, useEffect, useCallback, useRef } from 'react';
import SpeedTest from '@cloudflare/speedtest';
import useTranslate from '../../../localization/useTranslate';
import { defaultToast } from '../../lib/toasts';

interface TestResults {
    download?: number;
    upload?: number;
    latency?: number;
    jitter?: number;
}

const MB_CONVERSION = 1_000_000;

const testMeasurements = [
    { type: 'latency', numPackets: 1 },
    { type: 'download', bytes: 1e5, count: 1, bypassMinDuration: true,  },
    { type: 'latency', numPackets: 20 },
    { type: 'download', bytes: 1e5, count: 9 },
    { type: 'download', bytes: 1e6, count: 8 },
    { type: 'upload', bytes: 1e5, count: 8 },
    { type: 'upload', bytes: 1e6, count: 6 },
    { type: 'download', bytes: 1e7, count: 6 },
] as const;

export const useSpeedTest = () => {
    const appLang = useTranslate();
    const [testResults, setTestResults] = useState<TestResults | undefined>(undefined);
    const [isRunning, setIsRunning] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [testButtonText, setTestButtonText] = useState('play_arrow');
    const speedTestRef = useRef<SpeedTest | null>(null);
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        // @ts-ignore
        speedTestRef.current = new SpeedTest({ autoStart: false, measurements: testMeasurements });
        const speedTest = speedTestRef.current;

        speedTest.onFinish = (results) => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
            setIsRunning(false);
            setIsFinished(true);
            setTestResults(results?.getSummary());
            setTestButtonText('replay');
        };

        speedTest.onError = (err) => {
            defaultToast(err, 'SPEED_TEST', 5000);
        };

        return () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
            speedTest?.pause();
        };
    }, []);

    const checkServerAvailability = useCallback(async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            await fetch('https://speed.cloudflare.com', {
                mode: 'no-cors',
                signal: controller.signal,
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
        const speedTest = speedTestRef.current;
        if (!speedTest) return;

        if (!navigator.onLine) {
            defaultToast(appLang?.toast?.offline, 'ONLINE_STATUS', 3000);
            return;
        }

        if (isRunning) {
            speedTest.pause();
            setIsRunning(false);
            setTestButtonText('play_arrow');
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
            return;
        }

        try {
            setTestButtonText('pause');
            setIsRunning(true);
            const serverAvailable = await checkServerAvailability();
            if (!serverAvailable) {
                setTestButtonText('play_arrow');
                setIsRunning(false);
                return;
            }
            setTestResults(undefined);

            if (isFinished) {
                setIsFinished(false);
                speedTest.restart();
            } else {
                speedTest.play();
            }

            const updateResults = () => {
                setTestResults(speedTest.results?.getSummary());
                if (speedTest.isRunning) {
                    rafIdRef.current = requestAnimationFrame(updateResults);
                }
            };
            rafIdRef.current = requestAnimationFrame(updateResults);
        } catch (err) {
            defaultToast(appLang?.speedTest?.error_msg, 'SPEED_TEST', 5000);
            setIsRunning(false);
            setTestButtonText('play_arrow');
        }
    }, [appLang?.speedTest?.error_msg, appLang?.toast?.offline, checkServerAvailability, isFinished, isRunning]);

    const formatSpeed = useCallback(
        (speed?: number) => (speed ? (speed / MB_CONVERSION).toFixed(2) : 'N/A'),
        []
    );

    const formatValue = useCallback((value?: number) => value?.toFixed(2) ?? 'N/A', []);

    return {
        appLang,
        testResults,
        isRunning,
        isFinished,
        testButtonText,
        toggleTest,
        formatSpeed,
        formatValue
    };
};