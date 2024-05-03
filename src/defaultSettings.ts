export type settingsKeys =
    | 'scan'
    | 'endpoint'
    | 'ipType'
    | 'port'
    | 'psiphon'
    | 'location'
    | 'license'
    | 'gool'
    | 'theme'
    | 'systemTray'
    | 'flag'
    | 'ipData'
    | 'routingRules';

export const defaultSettings = {
    scan: true,
    endpoint: 'engage.cloudflareclient.com:2048',
    ipType: '',
    port: 8086,
    psiphon: false,
    location: '',
    license: '',
    gool: true,
    theme: 'light',
    systemTray: false,
    flag: 'xx',
    ipData: false,
    routingRules: ''
};

export const countries: { value: string; label: string }[] = [
    { value: 'AT', label: 'Austria' },
    { value: 'BE', label: 'Belgium' },
    { value: 'BG', label: 'Bulgaria' },
    { value: 'BR', label: 'Brazil' },
    { value: 'CA', label: 'Canada' },
    { value: 'HR', label: 'Croatia' },
    { value: 'CH', label: 'Switzerland' },
    { value: 'CZ', label: 'Czech Republic' },
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
