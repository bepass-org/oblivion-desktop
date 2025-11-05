import { DropdownItem } from './renderer/components/Dropdown';

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
    | 'startMinimized'
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
    | 'singBoxGeoNSFW'
    | 'singBoxLog'
    | 'singBoxStack'
    | 'singBoxSniff'
    | 'singBoxAddrType'
    | 'singBoxUdpBlock'
    | 'singBoxDiscordBypass'
    | 'restartCounter'
    | 'betaRelease'
    | 'soundEffect'
    | 'plainDns'
    | 'DoH'
    | 'testUrl'
    | 'updaterVersion'
    | 'networkList'
    | 'connectTimeout';

const date = new Date();
const getTimeZone = date?.toString().toLowerCase();

/*const platform =
    typeof window !== 'undefined' && window.platformAPI
        ? window.platformAPI.getPlatform()
        : 'unknown';*/

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
    proxyMode: 'tun',
    shareVPN: false,
    hostIP: '127.0.0.1',
    method: 'gool',
    dns: '',
    rtt: '1s',
    openAtLogin: false,
    autoConnect: false,
    startMinimized: false,
    reserved: true,
    scanResult: '',
    profiles: '[]',
    forceClose: false,
    shortcut: true,
    dataUsage: false,
    asn: 'UNK',
    closeHelper: true,
    singBoxMTU: 9000,
    singBoxGeoBlock: false,
    singBoxGeoNSFW: false,
    singBoxSniff: true,
    singBoxUdpBlock: false,
    singBoxDiscordBypass: false,
    restartCounter: 0,
    betaRelease: false,
    soundEffect: false,
    testUrl: 'https://connectivity.cloudflareclient.com/cdn-cgi/trace',
    plainDns: '',
    DoH: '',
    updaterVersion: null,
    networkList: '[]',
    connectTimeout: '2m'
};

export const countries: DropdownItem[] = [
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

export const languages: DropdownItem[] = [
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

export const dnsServers: DropdownItem[] = [
    { value: '1.1.1.1', label: 'Cloudflare' },
    { value: '1.1.1.2', label: 'Cloudflare Security' },
    { value: '1.1.1.3', label: 'Cloudflare Family' },
    { value: 'local', label: 'Local Resolver' },
    { value: 'custom', label: 'Custom' }
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

export const singBoxLog: DropdownItem[] = [
    { value: 'disabled', label: 'Disabled' },
    { value: 'trace', label: 'Trace' },
    { value: 'debug', label: 'Debug' },
    { value: 'info', label: 'Info' },
    { value: 'warn', label: 'Warn' },
    { value: 'error', label: 'Error' },
    { value: 'fatal', label: 'Fatal' },
    { value: 'panic', label: 'Panic' }
];

export const singBoxStack: DropdownItem[] = [
    { value: 'mixed', label: 'Mixed' },
    { value: 'system', label: 'System' },
    { value: 'gvisor', label: 'gVisor' }
];

export const singBoxAddrType: DropdownItem[] = [
    { value: 'v64', label: 'Automatic' },
    { value: 'v4', label: 'IPv4' },
    { value: 'v6', label: 'IPv6' }
];

export const defaultRoutingRules: { type: string; value: string }[] = [
    { type: 'ip', value: '127.0.0.1' },
    { type: 'domain', value: '!test.ir' },
    { type: 'domain', value: '*.ir' },
    { type: 'domain', value: 'dolat.ir' },
    { type: 'domain', value: 'apps.apple.com' },
    { type: 'app', value: 'Figma' },
    { type: 'domain', value: 'figma.com' },
    { type: 'domain', value: 'github.com' },
    { type: 'domain', value: 'objects.githubusercontent.com' },
    { type: 'domain', value: 'meet.google.com' },
    { type: 'domain', value: 'bargheman.com' },
    { type: 'domain', value: 'digikala.com' },
    { type: 'domain', value: 'web.whatsapp.com' },
    { type: 'domain', value: 'aparat.com' },
    { type: 'domain', value: 'chatgpt.com' }
];
