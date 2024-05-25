export type settingsKeys =
    | 'scan'
    | 'endpoint'
    | 'ipType'
    | 'port'
    | 'location'
    | 'license'
    | 'theme'
    | 'lang'
    | 'systemTray'
    | 'flag'
    | 'ipData'
    | 'routingRules'
    | 'autoSetProxy'
    | 'proxyMode'
    | 'shareVPN'
    | 'hostIP'
    | 'method'
    | 'dns'
    | 'rtt'
    | 'openAtLogin';

export const defaultSettings = {
    scan: true,
    endpoint: 'engage.cloudflareclient.com:2408',
    ipType: '',
    port: 8086,
    location: '',
    license: '',
    theme: 'light',
    lang: 'fa',
    systemTray: false,
    flag: 'xx',
    ipData: true,
    routingRules: '',
    autoSetProxy: true,
    proxyMode: 'system',
    shareVPN: false,
    hostIP: '127.0.0.1',
    method: 'gool',
    dns: true,
    rtt: '1s',
    openAtLogin: false
};

export const countries: { value: string; label: string }[] = [
    { value: 'AT', label: 'Austria' },
    { value: 'BE', label: 'Belgium' },
    { value: 'BG', label: 'Bulgaria' },
    { value: 'BR', label: 'Brazil' },
    { value: 'CA', label: 'Canada' },
    { value: 'HR', label: 'Croatia' },
    { value: 'CH', label: 'Switzerland' },
    { value: 'CZ', label: 'Czechia' },
    { value: 'DE', label: 'Germany' },
    { value: 'DK', label: 'Denmark' },
    { value: 'EE', label: 'Estonia' },
    { value: 'ES', label: 'Spain' },
    { value: 'FI', label: 'Finland' },
    { value: 'FR', label: 'France' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'HU', label: 'Hungary' },
    { value: 'IE', label: 'Ireland' },
    { value: 'IN', label: 'India' },
    { value: 'IT', label: 'Italy' },
    { value: 'JP', label: 'Japan' },
    { value: 'LV', label: 'Latvia' },
    { value: 'NL', label: 'Netherlands' },
    { value: 'NO', label: 'Norway' },
    { value: 'PL', label: 'Poland' },
    { value: 'PT', label: 'Portugal' },
    { value: 'RO', label: 'Romania' },
    { value: 'RS', label: 'Serbia' },
    { value: 'SE', label: 'Sweden' },
    { value: 'SG', label: 'Singapore' },
    { value: 'SK', label: 'Slovakia' },
    { value: 'UA', label: 'Ukraine' },
    { value: 'US', label: 'United States' }
];

export const languages: { value: string; label: string }[] = [
    { value: 'fa', label: 'فارسی' },
    { value: 'en', label: 'English' },
    { value: 'cn', label: '中文' },
    { value: 'ru', label: 'Русский' },
    { value: 'de', label: 'Deutsch' },
];
