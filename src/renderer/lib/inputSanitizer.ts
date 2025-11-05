import toast from 'react-hot-toast';
import { settings } from './settings';
import { countries, defaultSettings } from '../../defaultSettings';
import { defaultToast } from './toasts';
import { Language } from '../../localization/type';
import { withDefault } from './withDefault';

type ConfigType =
    | {
          method: 'profile';
          endpoint: string;
          name: string;
      }
    | {
          method: 'endpoint';
          endpoint: string;
      }
    | {
          method: 'warp' | 'psiphon' | 'gool' | 'masque';
          endpoint: string;
          location: string;
          license: string;
          ipType: '' | 'v4' | 'v6';
          reserved: '0' | '1';
      };

const UNTITLED = 'untitled';
const isIPv4 = (address: string) => /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(address);
const isIPv6 = (address: string) => /^[0-9a-fA-F:]+$/.test(address);
const VALID_COUNTRIES = countries.map((c) => c.value);

export const sanitizeProfileName = (name: string): string => {
    name = name.trim();
    name = name.replace(/[^a-zA-Z0-9-_ ]/g, '');
    name = name.replace(/@/g, '');
    name = name.replace(/[?&]/g, '');
    if (name.length > 10) {
        name = name.slice(0, 10);
    }
    return name;
};

export const validEndpoint = (value: string) => {
    const endpoint = value.replace(/^https?:\/\//, '').replace(/\/$/, '');
    let regex = /^(?:(?:\d{1,3}\.){3}\d{1,3}|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(?::\d{1,5})$/;
    if (endpoint.startsWith('[')) {
        regex =
            /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))/;
    }
    return regex.test(endpoint) && endpoint.length > 7 ? endpoint : '';
};

export const newProfile = (savedProfiles: any, newName: string, newEndpoint: string) => {
    if (validEndpoint(newEndpoint) !== '' && newEndpoint === defaultSettings.endpoint) {
        return false;
    }
    if (!Array.isArray(savedProfiles)) {
        savedProfiles = JSON.parse(withDefault(savedProfiles, defaultSettings.profiles));
    }
    if (savedProfiles.length > 7) {
        return false;
    }
    const isDuplicate =
        Array.isArray(savedProfiles) &&
        savedProfiles.some((item: any) => item?.name === newName && item?.endpoint === newEndpoint);
    if (!isDuplicate) {
        return [...savedProfiles, { name: newName, endpoint: newEndpoint }];
    } else {
        return false;
    }
};

export const validateCountry = (location: string, method: string): string => {
    const upperCountry = location.toUpperCase();
    return String(
        method === 'psiphon' && VALID_COUNTRIES.includes(upperCountry) ? upperCountry : ''
    );
};

export const validateLicense = (license: string): string => {
    license = license.trim();
    // eslint-disable-next-line no-control-regex
    license = license.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    if (license.length < 3) {
        return '';
    }
    return /^[a-zA-Z0-9-]*$/.test(license) ? license : '';
};

export const validateTestUrl = (url: string): string => {
    if (!url || typeof url !== 'string') {
        return defaultSettings.testUrl;
    }
    url = url.trim();
    if (url === '') {
        return defaultSettings.testUrl;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    if (!url.endsWith('/cdn-cgi/trace')) {
        url = url.replace(/\/$/, '');
        url += '/cdn-cgi/trace';
    }
    url = url.replace(/\/$/, '');
    return url;
};

export const determineIpType = (endpoint: string, ipType: string): '' | 'v4' | 'v6' => {
    if (endpoint === defaultSettings.endpoint) {
        return ipType === 'v4' || ipType === 'v6' ? ipType : '';
    } else if (isIPv4(endpoint)) {
        return 'v4';
    } else if (isIPv6(endpoint)) {
        return 'v6';
    }
    return ipType === 'v4' || ipType === 'v6' ? ipType : '';
};

export const validateReserved = (reserved: string): '0' | '1' => {
    return reserved === '0' || reserved === '1'
        ? (reserved as '0' | '1')
        : defaultSettings.reserved
          ? '1'
          : '0';
};

export const sanitizeConfig = (input: string): string => {
    if (input === '') {
        return '';
    }
    input = input.trim();
    input = input.replace('?&', '?');
    const licenseMatch = input.match(/[?&]license=([^&]*)/i);
    const licenseValue = licenseMatch ? licenseMatch[1] : false;
    if (licenseValue) {
        input = input.replace(/([?&])license=[^&]*/i, '$1license=placeholder');
    }
    input = input.toLowerCase();
    input = input.replace('license=placeholder', `license=${licenseValue}`);
    let atCount = 0;
    input = input.replace('cfon', 'psiphon');
    input = input.replace(/@/g, (match) => {
        atCount += 1;
        return atCount > 1 ? '' : match;
    });
    let hashCount = 0;
    input = input.replace(/#/g, (match) => {
        hashCount += 1;
        return hashCount > 1 ? '' : match;
    });
    let questionMarkCount = 0;
    input = input.replace(/\?/g, (match) => {
        questionMarkCount += 1;
        return questionMarkCount > 1 ? '' : match;
    });
    return input;
};

export const parseProfileConfig = (pastedText: string): ConfigType | null => {
    const match = /^oblivion:\/\/profile@([^#]*)#([a-zA-Z0-9-_ &?]*)$/i.exec(pastedText);
    if (!match) return null;
    const endpoint = match[1] || defaultSettings.endpoint;
    const name = sanitizeProfileName(match[2]);
    return {
        method: 'profile',
        endpoint,
        name: name.length < 3 ? UNTITLED : name
    };
};

export const parseEndpointConfig = (pastedText: string): ConfigType | null => {
    const match = /^oblivion:\/\/endpoint@([^#]*)$/i.exec(pastedText);
    if (!match) return null;
    if (validEndpoint(match[1]) === '') {
        return null;
    }
    const endpoint = match[1] || defaultSettings.endpoint;
    return {
        method: 'endpoint',
        endpoint
    };
};

export const parseConnectionConfig = (pastedText: string): ConfigType | null => {
    const match = /^oblivion:\/\/(warp|psiphon|gool|masque)@([^?]*)\??(.*)$/i.exec(pastedText);
    if (!match) return null;
    const method: 'warp' | 'psiphon' | 'gool' | 'masque' =
        (match[1] as any) || defaultSettings.method;
    const endpoint = match[2] || defaultSettings.endpoint;
    const params = match[3] ? new URLSearchParams(match[3]) : new URLSearchParams();
    const location = validateCountry(params?.get('location') || '', method);
    const license = validateLicense(params?.get('license') || '');
    const reserved = validateReserved(params?.get('reserved') || '');
    const ipType = determineIpType(endpoint, params?.get('ip') || '');
    return {
        method,
        endpoint,
        location,
        license,
        ipType,
        reserved
    };
};

export const validateConfig = (pastedText: string): ConfigType | null => {
    if (pastedText.startsWith('oblivion://profile')) {
        return parseProfileConfig(pastedText);
    } else if (pastedText.startsWith('oblivion://endpoint')) {
        return parseEndpointConfig(pastedText);
    } else if (pastedText.startsWith('oblivion://')) {
        return parseConnectionConfig(pastedText);
    }
    return null;
};

export const removeLeadingZeros = (input: number) => {
    const numberString = input.toString();
    if (numberString.startsWith('0')) {
        return Number(numberString.replace(/^0+/, ''));
    }
    return Number(numberString);
};

export const saveConfig = (
    pastedText: string,
    isConnected: boolean,
    isLoading: boolean,
    appLang: Language
) => {
    if (typeof pastedText !== 'string') {
        return false;
    }
    pastedText = sanitizeConfig(pastedText);
    const config = validateConfig(pastedText);
    if (config) {
        toast.remove('SETTINGS_CHANGED');
        if (config.method === 'profile') {
            setTimeout(async () => {
                const profiles = await settings.get('profiles');
                const canSaveProfile = newProfile(profiles, config.name, config.endpoint);
                if (canSaveProfile) {
                    await settings.set('profiles', JSON.stringify(canSaveProfile));
                    defaultToast(appLang?.toast?.profile_added, 'SETTINGS_CHANGED', 5000);
                } else {
                    //console.log(config);
                }
            }, 200);
        } else if (config.method === 'endpoint') {
            setTimeout(async () => {
                const endpoint = await settings.get('endpoint');
                if (endpoint !== config.endpoint) {
                    await settings.set('endpoint', config.endpoint);
                }
                defaultToast(appLang?.toast?.endpoint_added, 'SETTINGS_CHANGED', 5000);
            }, 200);
        } else {
            if (isConnected || isLoading) {
                defaultToast(appLang?.toast?.settings_changed, 'SETTINGS_CHANGED', 5000);
            } else {
                defaultToast(appLang?.toast?.config_added, 'SETTINGS_CHANGED', 5000);
            }
            setTimeout(async () => {
                await settings.set('method', config.method === 'warp' ? '' : config.method);
                await settings.set('endpoint', config.endpoint);
                await settings.set('location', config.location);
                if (config.license !== '') {
                    await settings.set('license', config.license);
                }
                await settings.set(
                    'ipType',
                    config.ipType === '' ? '' : '-' + config.ipType.replace('v', '')
                );
                await settings.set('reserved', config.reserved === '1' ? true : false);
            }, 200);
        }
        setTimeout(async () => {
            toast.remove('SETTINGS_CHANGED');
        }, 5000);
    } else {
        //console.log(config);
    }
};
