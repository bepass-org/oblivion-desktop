import classNames from 'classnames';
import { FC, FormEvent } from 'react';
//import { Swipe } from 'react-swipe-component';
import { cfFlag } from '../../lib/cfFlag';
import { IpConfig } from './useLanding';
import { Language } from '../../../localization/type';
import { INetStats } from '../../../constants';

interface LandingBodyProps {
    appLang: Language;
    isConnected: boolean;
    isLoading: boolean;
    ipInfo: IpConfig;
    ipData?: boolean;
    ping: number;
    statusText: string;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    handleOnSwipedLeft: () => void;
    handleOnSwipedRight: () => void;
    handleOnClickIp: () => void;
    handleOnClickPing: () => void;
    proxyStatus: string;
    appVersion: string;
    netStats: INetStats;
    dataUsage: boolean;
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
    statusText,
    proxyStatus,
    appVersion,
    netStats,
    dataUsage
}) => {
    const pingIsZero = ping === 0;
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
                            isConnected && !isLoading && proxyStatus !== 'none' && ipData
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
                                src={cfFlag(ipInfo.countryCode || 'xx')}
                                alt={`${ipInfo?.countryCode} Flag`}
                            />
                            <span className={ipInfo?.countryCode ? '' : 'shimmer'}>
                                {ipInfo.ip || '127.0.0.1'}
                            </span>
                        </div>
                        <div className={classNames('item', 'speed')}>
                            <div
                                className='download isPing'
                                role='presentation'
                                onClick={handleOnClickPing}
                            >
                                <i className='material-icons'>&#xebca;</i>
                                <span className={pingIsZero ? 'shimmer' : ''}>
                                    {ping > 0
                                        ? String(ping).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ms'
                                        : 'Timeout'}
                                </span>
                            </div>
                            <div
                                className={classNames(
                                    'upload',
                                    'hasTooltip',
                                    dataUsage ? '' : 'hidden'
                                )}
                            >
                                <i className='material-icons'>&#xe1af;</i>
                                <span
                                    className={
                                        pingIsZero || netStats.totalUsage.unit === 'N/A'
                                            ? 'shimmer'
                                            : ''
                                    }
                                >
                                    {netStats.totalUsage.value}{' '}
                                    <small>{netStats.totalUsage.unit}</small>
                                </span>
                                <div
                                    className={classNames(
                                        'isTooltip',
                                        netStats.totalSent.value === -1 ||
                                            netStats.totalRecv.value === -1 ||
                                            pingIsZero ||
                                            netStats.totalUsage.value === -1
                                            ? 'hidden'
                                            : ''
                                    )}
                                >
                                    <i className='material-icons'>&#xe5d8;</i>
                                    <span>
                                        {netStats.totalSent.value}{' '}
                                        <small>{netStats.totalSent.unit}</small>
                                    </span>
                                    <div className='clearfix' />
                                    <i className='material-icons latest'>&#xe5db;</i>
                                    <span>
                                        {netStats.totalRecv.value}{' '}
                                        <small>{netStats.totalRecv.unit}</small>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div
                            role='presentation'
                            className={classNames('item', 'speed', dataUsage ? '' : 'hidden')}
                        >
                            <div className='download'>
                                <i className='material-icons'>&#xe2c0;</i>
                                <span
                                    className={
                                        pingIsZero || netStats.recvSpeed.value === -1
                                            ? 'shimmer'
                                            : ''
                                    }
                                >
                                    {netStats.recvSpeed.value}{' '}
                                    <small>{netStats.recvSpeed.unit}</small>
                                </span>
                            </div>
                            <div className='upload'>
                                <i className='material-icons'>&#xe2c3;</i>
                                <span
                                    className={
                                        pingIsZero || netStats.sentSpeed.value === -1
                                            ? 'shimmer'
                                            : ''
                                    }
                                >
                                    {netStats.sentSpeed.value}{' '}
                                    <small>{netStats.sentSpeed.unit}</small>
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
