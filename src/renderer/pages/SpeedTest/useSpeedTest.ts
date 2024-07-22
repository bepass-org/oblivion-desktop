import { useState, useEffect, useCallback, useRef } from 'react';
import SpeedTest from '@cloudflare/speedtest';
import useTranslate from "../../../localization/useTranslate";

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
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isFinished, setIsFinished] = useState<boolean>(false);
    const [testButtonText, setTestButtonText] = useState<string>('play_arrow');
    const [error, setError] = useState<string | null>(null);
    const speedTestRef = useRef<SpeedTest | null>(null);
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        speedTestRef.current = new SpeedTest({ autoStart: false });
        const speedTest = speedTestRef.current;

        speedTest.onFinish = (results) => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
            setIsRunning(false);
            setIsFinished(true);
            setTestResults(results.getSummary());
            setTestButtonText('done');
        };

        return () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
            speedTest?.pause();
        };
    }, []);

    const toggleTest = useCallback(() => {
        const speedTest = speedTestRef.current;

        if (speedTest) {
            try {
                if (isRunning) {
                    speedTest.pause();
                    setIsRunning(false);
                    setTestButtonText('play_arrow');
                    if (rafIdRef.current) {
                        cancelAnimationFrame(rafIdRef.current);
                    }
                } else {
                    setError(null);
                    speedTest.play();
                    setIsRunning(true);
                    setTestButtonText('pause');
                    rafIdRef.current = requestAnimationFrame(function updateResults() {
                        setTestResults(speedTest.results.getSummary());
                        if (speedTest.isRunning) {
                            rafIdRef.current = requestAnimationFrame(updateResults);
                        }
                    });
                }
            } catch (err) {
                setError(appLang?.speedTest?.errorMessage);
                setIsRunning(false);
                setTestButtonText('play_arrow');
            }
        }
    }, [appLang?.speedTest?.errorMessage, isRunning]);

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
        error,
        toggleTest,
        formatSpeed,
        formatValue
    };
};