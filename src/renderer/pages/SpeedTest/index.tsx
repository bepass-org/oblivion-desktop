import { useMemo } from 'react';
import classNames from 'classnames';
import Nav from '../../components/Nav';
import { useSpeedTest } from './useSpeedTest';
import ResultCard from '../../components/Card';
import { defaultToast } from '../../lib/toasts';

export default function Speed() {
    const {
        appLang,
        testResults,
        isRunning,
        isFinished,
        testButtonText,
        toggleTest,
        formatSpeed,
        formatValue
    } = useSpeedTest();

    const renderResults = useMemo(
        () => (
            <div className='results'>
                <div className='resultRow'>
                    <ResultCard
                        label={appLang?.speedTest?.download_speed}
                        value={formatSpeed(testResults?.download)}
                        unit='Mbps'
                    />
                    <ResultCard
                        label={appLang?.speedTest?.upload_speed}
                        value={formatSpeed(testResults?.upload)}
                        unit='Mbps'
                    />
                </div>
                <div className='resultRow'>
                    <ResultCard
                        label={appLang?.speedTest?.latency}
                        value={formatValue(testResults?.latency)}
                        unit='Ms'
                    />
                    <ResultCard
                        label={appLang?.speedTest?.jitter}
                        value={formatValue(testResults?.jitter)}
                        unit='Ms'
                    />
                </div>
            </div>
        ),
        [
            appLang?.speedTest?.download_speed,
            appLang?.speedTest?.upload_speed,
            appLang?.speedTest?.latency,
            appLang?.speedTest?.jitter,
            formatSpeed,
            testResults?.download,
            testResults?.upload,
            testResults?.latency,
            testResults?.jitter,
            formatValue
        ]
    );

    return (
        <>
            <Nav title={appLang?.speedTest?.title} />
            <div className={classNames('myApp', 'normalPage')}>
                <div
                    className={classNames('speedTest', {
                        testRunning: isRunning,
                        testDone: testResults || isFinished
                    })}
                >
                    <button
                        className={classNames('startButton', 'material-icons')}
                        data-type={
                            !navigator.onLine ? 'disabled' : !isFinished ? 'enabled' : 'finished'
                        }
                        onClick={() => {
                            if (!navigator.onLine) {
                                defaultToast(appLang?.toast?.offline, 'ONLINE_STATUS', 7000);
                            } else {
                                if (isFinished) {
                                    // TODO: refresh
                                } else {
                                    toggleTest();
                                }
                            }
                        }}
                        disabled={!navigator.onLine}
                    >
                        {testButtonText}
                    </button>
                    {!testResults ? (
                        <span className='statusMessage'>
                            {isRunning
                                ? appLang?.speedTest?.initializing
                                : appLang?.speedTest?.click_start}{' '}
                        </span>
                    ) : (
                        renderResults
                    )}
                </div>
            </div>
        </>
    );
}
