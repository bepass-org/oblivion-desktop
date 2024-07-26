import classNames from 'classnames';
import { FC, FormEvent } from 'react';
import { Swipe } from 'react-swipe-component';
import { cfFlag } from '../../lib/cfFlag';

interface LandingBodyProps {
    appLang: any;
    isConnected: boolean;
    isLoading: boolean;
    ipInfo: {
        countryCode: string | boolean;
        ip: string;
    };
    ipData?: boolean;
    proxyMode: string;
    ping: number;
    statusText: string;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    handleOnSwipedLeft: () => void;
    handleOnSwipedRight: () => void;
    handleOnClickIp: () => void;
    handleOnClickPing: () => void;
    proxyStatus: string;
    appVersion: string;
}

const LandingBody: FC<LandingBodyProps> = ({
    appLang,
    handleOnClickIp,
    handleOnClickPing,
    handleOnSwipedLeft,
    handleOnSwipedRight,
    ipData,
    ipInfo,
    isConnected,
    isLoading,
    onSubmit,
    ping,
    proxyMode,
    statusText,
    proxyStatus,
    appVersion
}) => {
    return (
        <div className={classNames('myApp', 'verticalAlign')}>
            <div className='container'>
                <div className='homeScreen'>
                    <div className='title'>
                        <h1>OBLIVION</h1>
                        <h2>
                            {appLang?.home?.title_warp_based}{' '}
                            <span className='badge'>v{appVersion.replace('-beta', '')}</span>
                        </h2>
                    </div>
                    <form action='' onSubmit={onSubmit}>
                        <div className='connector'>
                            <Swipe
                                nodeName='div'
                                onSwipedLeft={handleOnSwipedLeft}
                                onSwipedRight={handleOnSwipedRight}
                            >
                                <button
                                    type='submit'
                                    role='switch'
                                    aria-checked={isConnected}
                                    tabIndex={0}
                                    className={classNames(
                                        'switch',
                                        isConnected ? 'active' : '',
                                        isLoading ? 'isLoading' : ''
                                    )}
                                >
                                    <div className='circle'>
                                        <div className='spinner' />
                                    </div>
                                </button>
                            </Swipe>
                        </div>
                    </form>
                    <div
                        className={classNames(
                            'status',
                            isConnected && !isLoading && (ipInfo?.countryCode || !ipData)
                                ? 'active'
                                : ''
                        )}
                    >
                        {statusText}
                    </div>
                    <div
                        className={classNames(
                            'inFoot',
                            'withIp',
                            isConnected &&
                                !isLoading &&
                                proxyMode !== 'none' &&
                                proxyStatus !== 'none' &&
                                proxyMode !== '' &&
                                ipData
                                ? 'active'
                                : ''
                        )}
                    >
                        <div
                            role='presentation'
                            className={classNames('item', ipData ? '' : 'hidden')}
                            onClick={handleOnClickIp}
                        >
                            <img
                                src={cfFlag(ipInfo.countryCode ? ipInfo?.countryCode : 'xx')}
                                alt={`${ipInfo?.countryCode} Flag`}
                            />
                            <span className={ipInfo?.countryCode ? '' : 'shimmer'}>
                                {ipInfo.ip ? ipInfo.ip : '127.0.0.1'}
                            </span>
                        </div>
                        <div
                            role='presentation'
                            className={classNames('item', 'ping')}
                            onClick={handleOnClickPing}
                        >
                            <i className='material-icons'>&#xebca;</i>
                            <span className={ping === 0 ? 'shimmer' : ''}>
                                {ping > 0
                                    ? String(ping).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ms'
                                    : 'timeout'}
                            </span>
                        </div>
                        <div role='presentation' className={classNames('item', 'speed', 'hidden')}>
                            <div className='download'>
                                <i className='material-icons'>&#xe2c0;</i>
                                <span className={ping === 0 ? 'shimmer' : ''}>
                                    0 <small>MB/s</small>
                                </span>
                            </div>
                            <div className='upload'>
                                <i className='material-icons'>&#xe2c3;</i>
                                <span className={ping === 0 ? 'shimmer' : ''}>
                                    0 <small>KB/s</small>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default LandingBody;
