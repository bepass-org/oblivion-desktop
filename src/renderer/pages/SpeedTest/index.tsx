import { FC, useMemo } from 'react';
import classNames from 'classnames';
import { Toaster } from 'react-hot-toast';
import Nav from '../../components/Nav';
import { useSpeedTest } from './useSpeedTest';
import ResultCard from '../../components/Card';

const Speed: FC = () => {
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

    const renderResults = useMemo(() => {
        if (!testResults) return null;

        return (
            <div className='results'>
                <div className='resultRow'>
                    <ResultCard
                        label={appLang?.speedTest?.download_speed}
                        value={formatSpeed(testResults.download)}
                        unit='Mbps'
                    />
                    <ResultCard
                        label={appLang?.speedTest?.upload_speed}
                        value={formatSpeed(testResults.upload)}
                        unit='Mbps'
                    />
                </div>
                <div className='resultRow'>
                    <ResultCard
                        label={appLang?.speedTest?.latency}
                        value={formatValue(testResults.latency)}
                        unit='Ms'
                    />
                    <ResultCard
                        label={appLang?.speedTest?.jitter}
                        value={formatValue(testResults.jitter)}
                        unit='Ms'
                    />
                </div>
            </div>
        );
    }, [appLang?.speedTest, formatSpeed, formatValue, testResults]);

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
                        onClick={toggleTest}
                        disabled={!navigator.onLine}
                    >
                        {testButtonText}
                    </button>
                    {!testResults ? (
                        <span className='statusMessage'>
                            {isRunning
                                ? appLang?.speedTest?.initializing
                                : appLang?.speedTest?.click_start}
                        </span>
                    ) : (
                        renderResults
                    )}
                </div>
            </div>
            <Toaster position='bottom-center' reverseOrder={false} />
        </>
    );
};

export default Speed;
