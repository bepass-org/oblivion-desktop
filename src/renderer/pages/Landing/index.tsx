import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import 'react-modern-drawer/dist/index.css';
import useLanding from './useLanding';
import LandingDrawer from './LandingDrawer';
import LandingHeader from './LandingHeader';
import LandingBody from './LandingBody';
import Tabs from '../../components/Tabs';
import ConfigHandler from '../../components/ConfigHandler';

export default function Landing() {
    const {
        appLang,
        drawerIsOpen,
        ipData,
        lang,
        proxyMode,
        handleMenuOnKeyDown,
        handleOnClickIp,
        handleOnClickPing,
        handleOnSwipedLeft,
        handleOnSwipedRight,
        hasNewUpdate,
        ipInfo,
        isConnected,
        isLoading,
        onSubmit,
        ping,
        statusText,
        toggleDrawer,
        proxyStatus,
        appVersion,
        shortcut,
        netStats,
        dataUsage,
        betaRelease
    } = useLanding();

    return (
        <>
            <ConfigHandler isConnected={isConnected} isLoading={isLoading} appLang={appLang} />
            <LandingHeader
                handleMenuOnKeyDown={handleMenuOnKeyDown}
                hasNewUpdate={hasNewUpdate}
                toggleDrawer={toggleDrawer}
                isConnected={isConnected}
                isLoading={isLoading}
                appLang={appLang}
            />
            <LandingDrawer
                appLang={appLang}
                drawerIsOpen={drawerIsOpen}
                lang={lang}
                toggleDrawer={toggleDrawer}
                hasNewUpdate={hasNewUpdate}
                appVersion={appVersion}
                proxyMode={proxyMode}
                betaRelease={betaRelease}
            />
            <LandingBody
                appLang={appLang}
                handleOnClickIp={handleOnClickIp}
                handleOnClickPing={handleOnClickPing}
                handleOnSwipedLeft={handleOnSwipedLeft}
                handleOnSwipedRight={handleOnSwipedRight}
                ipData={ipData}
                ipInfo={ipInfo}
                isConnected={isConnected}
                isLoading={isLoading}
                onSubmit={onSubmit}
                ping={ping}
                proxyMode={proxyMode}
                statusText={statusText}
                proxyStatus={proxyStatus}
                appVersion={appVersion}
                netStats={netStats}
                dataUsage={dataUsage}
            />
            {(!isConnected || (isConnected && !ipData)) && shortcut && (
                <Tabs active='landing' proxyMode={proxyMode} />
            )}
            <Toaster
                position='bottom-center'
                reverseOrder={false}
                containerStyle={{ bottom: shortcut ? '70px' : '16px' }}
            />
        </>
    );
}
