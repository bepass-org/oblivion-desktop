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
    | 'openAtLogin'
    | 'autoConnect'
    | 'reserved'
    | 'scanResult'
    | 'profiles'
    | 'forceClose'
    | 'shortcut'
    | 'dataUsage'
    | 'asn'
    | 'closeHelper'
    | 'singBoxMTU'
    | 'singBoxGeoIp'
    | 'singBoxGeoSite'
    | 'singBoxGeoBlock'
    | 'singBoxLog'
    | 'singBoxStack'
    | 'singBoxSniff'
    | 'restartCounter';

const date = new Date();
const getTimeZone = date?.toString().toLowerCase();

export const defaultSettings = {
    scan: true,
    endpoint: 'engage.cloudflareclient.com:2408',
    ipType: '',
    port: 8086,
    location: '',
    license: '',
    theme: 'light',
    lang: getTimeZone?.includes('iran') ? 'fa' : 'en',
    systemTray: false,
    flag: 'xx',
    ipData: true,
    routingRules: '',
    autoSetProxy: true,
    proxyMode: 'system',
    shareVPN: false,
    hostIP: '127.0.0.1',
    method: 'gool',
    dns: '',
    rtt: '1s',
    openAtLogin: false,
    autoConnect: false,
    reserved: true,
    scanResult: '',
    profiles: '[]',
    forceClose: false,
    shortcut: false,
    dataUsage: false,
    asn: 'UNK',
    closeHelper: true,
    singBoxMTU: 9000,
    singBoxGeoBlock: false,
    singBoxSniff: true,
    restartCounter: 0
};

export const countries: { value: string; label: string }[] = [
    { value: 'AU', label: '🇦🇺 Australia' },
    { value: 'AT', label: '🇦🇹 Austria' },
    { value: 'BE', label: '🇧🇪 Belgium' },
    { value: 'BG', label: '🇧🇬 Bulgaria' },
    //{ value: 'BR', label: '🇧🇷 Brazil' },
    { value: 'CA', label: '🇨🇦 Canada' },
    { value: 'HR', label: '🇭🇷 Croatia' },
    { value: 'CH', label: '🇨🇭 Switzerland' },
    { value: 'CZ', label: '🇨🇿 Czechia' },
    { value: 'DE', label: '🇩🇪 Germany' },
    { value: 'DK', label: '🇩🇰 Denmark' },
    { value: 'EE', label: '🇪🇪 Estonia' },
    { value: 'ES', label: '🇪🇸 Spain' },
    { value: 'FI', label: '🇫🇮 Finland' },
    { value: 'FR', label: '🇫🇷 France' },
    { value: 'GB', label: '🇬🇧 United Kingdom' },
    { value: 'HU', label: '🇭🇺 Hungary' },
    { value: 'IE', label: '🇮🇪 Ireland' },
    { value: 'IN', label: '🇮🇳 India' },
    //{ value: 'ID', label: '🇮🇩 Indonesia' },
    { value: 'IT', label: '🇮🇹 Italy' },
    { value: 'JP', label: '🇯🇵 Japan' },
    { value: 'LV', label: '🇱🇻 Latvia' },
    { value: 'NL', label: '🇳🇱 Netherlands' },
    { value: 'NO', label: '🇳🇴 Norway' },
    { value: 'PL', label: '🇵🇱 Poland' },
    { value: 'PT', label: '🇵🇹 Portugal' },
    { value: 'RO', label: '🇷🇴 Romania' },
    { value: 'RS', label: '🇷🇸 Serbia' },
    { value: 'SE', label: '🇸🇪 Sweden' },
    { value: 'SG', label: '🇸🇬 Singapore' },
    { value: 'SK', label: '🇸🇰 Slovakia' },
    //{ value: 'UA', label: '🇺🇦 Ukraine' },
    { value: 'US', label: '🇺🇸 United States' }
];

export const languages: { value: string; label: string }[] = [
    { value: 'fa', label: 'فارسی' },
    { value: 'en', label: 'English' },
    { value: 'cn', label: '中文' },
    { value: 'ru', label: 'Русский' },
    { value: 'tr', label: 'Türkçe' },
    { value: 'id', label: 'Indonesia' },
    { value: 'ar', label: 'العربية' },
    { value: 'pt', label: 'Português (Brasil)' },
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'ur', label: 'اردو' }
];

export const dnsServers: { value: string; label: string }[] = [
    { value: '1.1.1.1', label: 'Cloudflare' },
    { value: '8.8.8.8', label: 'Google' },
    { value: '94.140.14.14', label: 'Adguard' },
    { value: '94.140.14.15', label: 'Adguard Family' }
];

export const dohDnsServers: { key: string; value: string }[] = [
    { key: '1.1.1.1', value: 'https://1.1.1.2/dns-query' },
    { key: '8.8.8.8', value: 'https://dns.google/dns-query' },
    { key: '94.140.14.14', value: 'https://dns.adguard-dns.com/dns-query' },
    { key: '94.140.14.15', value: 'https://family.adguard-dns.com/dns-query' }
];

export const singBoxGeoIp: { label: string; geoIp: string }[] = [
    { label: 'None', geoIp: 'none' },
    {
        label: '🇮🇷 Iran',
        geoIp: 'ir'
    },
    {
        label: '🇨🇳 China',
        geoIp: 'cn'
    },
    {
        label: '🇷🇺 Russia',
        geoIp: 'ru'
    },
    {
        label: '🇦🇫 Afghanistan',
        geoIp: 'af'
    },
    {
        label: '🇹🇷 Turkey',
        geoIp: 'tr'
    },
    {
        label: '🇮🇩 Indonesia',
        geoIp: 'id'
    },
    {
        label: '🇧🇷 Brazil',
        geoIp: 'br'
    }
];

export const singBoxGeoSite: { label: string; geoSite: string }[] = [
    { label: 'None', geoSite: 'none' },
    {
        label: '🇮🇷 Iran',
        geoSite: 'ir'
    },
    {
        label: '🇨🇳 China',
        geoSite: 'cn'
    },
    {
        label: '🇷🇺 Russia',
        geoSite: 'category-ru'
    }
];

export const singBoxLog: { value: string; label: string }[] = [
    { value: 'disabled', label: 'Disabled' },
    { value: 'trace', label: 'Trace' },
    { value: 'debug', label: 'Debug' },
    { value: 'info', label: 'Info' },
    { value: 'warn', label: 'Warn' },
    { value: 'error', label: 'Error' },
    { value: 'fatal', label: 'Fatal' },
    { value: 'panic', label: 'Panic' }
];

export const singBoxStack: { value: string; label: string }[] = [
    { value: 'mixed', label: 'Mixed' },
    { value: 'system', label: 'System' },
    { value: 'gvisor', label: 'gVisor' }
];
