import { IpcMainEvent } from 'electron';
import settings from 'electron-settings';
import { countries, defaultSettings } from '../../defaultSettings';
import { HookManager } from './hookManager';
import { removeDirIfExists } from './utils';
import { getTranslate } from '../../localization';
import { stuffPath } from '../../constants';
import WarpPlusManager from './wpManager';
//import { customEvent } from './customEvent';
//import { getTranslateElectron } from '../../localization/electron';
//import fs from 'fs';

let appLang = getTranslate('en');

const randomCountry = () => countries[Math.floor(Math.random() * countries.length)]?.value || 'DE';

export const getUserSettings = async () => {
    const [
        endpoint,
        ipType,
        port,
        location,
        license,
        method,
        hostIP,
        rtt,
        reserved,
        lang,
        dns,
        plainDns,
        testUrl
    ] = await Promise.all([
        settings.get('endpoint'),
        settings.get('ipType'),
        settings.get('port'),
        settings.get('location'),
        settings.get('license'),
        settings.get('method'),
        settings.get('hostIP'),
        settings.get('rtt'),
        settings.get('reserved'),
        settings.get('lang'),
        settings.get('dns'),
        settings.get('plainDns'),
        settings.get('testUrl')
    ]);
    appLang = getTranslate(String(typeof lang !== 'undefined' ? lang : defaultSettings.lang));

    const finalDns =
        typeof dns === 'string' &&
        dns === 'custom' &&
        typeof plainDns === 'string' &&
        plainDns !== ''
            ? plainDns
            : typeof dns === 'string' && dns !== '' && dns !== '1.1.1.1' && dns !== 'custom'
              ? dns
              : '';

    return [
        '--bind',
        `${typeof hostIP === 'string' && hostIP.length > 0 ? hostIP : defaultSettings.hostIP}:${typeof port === 'string' || typeof port === 'number' ? port : defaultSettings.port}`,
        /*...(typeof license === 'string' && license !== '' ? ['--key', license] : []),*/
        ...(typeof testUrl === 'string' && testUrl !== '' && testUrl !== defaultSettings.testUrl
            ? ['--test-url', testUrl]
            : []),
        ...(typeof method === 'string'
            ? method === 'gool'
                ? ['--gool']
                : method === 'psiphon'
                  ? [
                        '--cfon',
                        '--country',
                        typeof location === 'string' && location !== '' ? location : randomCountry()
                    ]
                  : []
            : ['--gool']),
        ...((typeof endpoint === 'string' &&
            (endpoint === '' || endpoint === defaultSettings.endpoint)) ||
        typeof endpoint === 'undefined'
            ? [
                  '--scan',
                  ...(typeof ipType === 'string' && ipType !== '' ? [ipType] : []),
                  ...(typeof rtt === 'string' ? ['--rtt', rtt] : [])
              ]
            : [
                  '--endpoint',
                  typeof endpoint === 'string' && endpoint.length > 0
                      ? endpoint
                      : defaultSettings.endpoint
              ]),
        ...(typeof reserved === 'boolean' && !reserved ? ['--reserved', '0,0,0'] : []),
        ...(finalDns !== '' ? ['--dns', finalDns] : [])
    ];
};

// The setStuffPath function is currently not used anywhere in the codebase.
// It's been commented out to avoid unused code. If needed in the future,
// uncomment and update its usage accordingly.
/*export const setStuffPath = async (args: string[]) => {
    args.push('--cache-dir', stuffPath);
    if (!(await doesDirectoryExist(stuffPath))) {
        await fs.mkdir(stuffPath, { recursive: true }).catch(console.error);
    }
};*/

const wpErrorTranslation: Record<string, (params: { [key: string]: string }) => string> = {
    'bind: address already in use': ({ port }) => appLang.log.error_port_already_in_use(port),
    'Only one usage of each socket address': () => {
        WarpPlusManager.restartApp();
        //return appLang.log.error_port_socket;
        return 'error_port_restart';
    },
    'Invalid license': () => appLang.log.error_invalid_license,
    'Too many connected devices': () => appLang.log.error_too_many_connected,
    'Access is denied': () => appLang.log.error_access_denied,
    'failed to set endpoint': () => appLang.log.error_failed_set_endpoint,
    'load primary warp identity': () => {
        return 'error_warp_identity';
    },
    'script failed to run': () => appLang.log.error_script_failed,
    'object null is not iterable': () => appLang.log.error_object_null,
    'parse args: unknown flag': () => appLang.log.error_unknown_flag,
    'context deadline exceeded': () => appLang.log.error_deadline_exceeded,
    'connection test failed': () => appLang.log.error_connection_failed,
    'parse args: --country': () => appLang.log.error_country_failed,
    'connection reset by peer': () => {
        return appLang.log.error_wp_reset_peer;
    },
    // TEMPORARY TEST ERROR - Remove after testing
    TEST_HOOK: () => 'Test hook execution'
};

export const handleWpErrors = (strData: string, port: string, ipcEvent?: IpcMainEvent) => {
    Object.entries(wpErrorTranslation).forEach(([errorMsg, translator]) => {
        if (strData.includes(errorMsg)) {
            ipcEvent?.reply('guide-toast', translator({ port }));

            // Execute connection error hook with context
            (async () => {
                try {
                    console.log(`=== TRIGGERING CONNECTION ERROR HOOK for: ${errorMsg} ===`);
                    const [proxyMode, hostIP] = await Promise.all([
                        settings.get('proxyMode'),
                        settings.get('hostIP')
                    ]);

                    console.log(
                        `Hook context: proxyMode=${proxyMode}, port=${port}, hostIP=${hostIP}`
                    );

                    await HookManager.executeHook('connectionError', {
                        proxyMode: proxyMode || 'unknown',
                        port,
                        hostIP: hostIP || 'unknown',
                        errorMessage: errorMsg,
                        translatedError: translator({ port })
                    });

                    console.debug('Connection error hook executed successfully');
                } catch (error) {
                    console.error('Failed to execute connectionError hook:', error);
                }
            })();

            removeDirIfExists(stuffPath).catch((err) =>
                console.log('removeDirIfExists Error:', err.message)
            );
        }
    });
};

// TEMPORARY TEST FUNCTION - Remove after testing
export const testConnectionErrorHook = () => {
    console.log('=== MANUAL TEST TRIGGER ===');
    handleWpErrors('TEST_HOOK occurred', '8080');
};
