import { useMemo } from 'react';
import classNames from 'classnames';
import Nav from '../../components/Nav';
import { useSpeedTest } from './useSpeedTest';
import ResultCard from "../../components/Card";

export default function Speed() {
    const {
        appLang,
        testResults,
        isRunning,
        isFinished,
        testButtonText,
        error,
        toggleTest,
        formatSpeed,
        formatValue
    } = useSpeedTest();

    const renderResults = useMemo(
        () => (
            <div className='results'>
                <div className='result-row'>
                    <ResultCard
                        label={appLang?.speedTest?.downloadSpeed}
                        value={formatSpeed(testResults?.download)}
                        unit='Mbps'
                    />
                    <ResultCard
                        label={appLang?.speedTest?.uploadSpeed}
                        value={formatSpeed(testResults?.upload)}
                        unit='Mbps'
                    />
                </div>
                <div className='result-row'>
                    <ResultCard
                        label={appLang?.speedTest?.latency}
                        value={formatValue(testResults?.latency)}
                        unit='ms'
                    />
                    <ResultCard
                        label={appLang?.speedTest?.jitter}
                        value={formatValue(testResults?.jitter)}
                        unit='ms' />
                </div>

            </div>
        ),
        [appLang?.speedTest?.downloadSpeed, appLang?.speedTest?.uploadSpeed, appLang?.speedTest?.latency, appLang?.speedTest?.jitter, formatSpeed, testResults?.download, testResults?.upload, testResults?.latency, testResults?.jitter, formatValue]
    );

    return (
        <>
            <Nav title={appLang?.speedTest?.title} />
            <div className={classNames('myApp', 'normalPage')}>
                <div
                    className={classNames('speedtest-container', {
                        'test-running': isRunning,
                        'test-done': testResults || isFinished
                    })}
                >
                    <button
                        className={classNames('start-button', 'material-icons')}
                        id={!navigator.onLine ? 'disabled' : !isFinished ? 'enabled' : 'finished'}
                        onClick={toggleTest}
                        disabled={!navigator.onLine || isFinished}
                    >
                        {testButtonText}
                    </button>
                    {!testResults ? (
                        <span className='status-message'>{isRunning ? appLang?.speedTest?.speedTestInitializing : appLang?.speedTest?.clickToStart} </span>
                    ) : (
                        renderResults
                    )}
                    {error && (
                        <div className='error-message' role='alert'>
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}