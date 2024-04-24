export type settingsKeys =
    | 'endpoint'
    | 'port'
    | 'psiphon'
    | 'location'
    | 'license'
    | 'gool'
    | 'theme'
    | 'systemTray'
    | 'flag';

export const defaultSettings = {
    endpoint: 'engage.cloudflareclient.com:2048',
    port: 8086,
    psiphon: false,
    location: '',
    license: '',
    gool: false,
    theme: 'light',
    systemTray: false,
    flag: 'xx',
};
