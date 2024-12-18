import { useEffect } from 'react';
import { settings } from '../lib/settings';
import { countries, defaultSettings } from '../../defaultSettings';
import { ipcRenderer } from '../lib/utils';
import toast from 'react-hot-toast';
import { defaultToast } from '../lib/toasts';

type ConfigType =
    | {
          method: 'profile';
          endpoint: string;
          name: string;
      }
    | {
          method: 'warp' | 'cfon' | 'gool';
          endpoint: string;
          location: string;
          license: string;
          ipType: '' | '4' | '6';
          reserved: '0' | '1';
      };

const UNTITLED = 'untitled';
const VALID_COUNTRIES = countries.map((c) => c.value);

const isIPv4 = (address: string) => /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(address);
const isIPv6 = (address: string) => /^[0-9a-fA-F:]+$/.test(address);

const validateName = (name: string): string => {
    const trimmedName = name.trim();
    if (trimmedName.length < 3) return UNTITLED;
    if (trimmedName.length > 10) return trimmedName.slice(0, 10);
    return trimmedName;
};

const validateCountry = (location: string, method: string): string => {
    const upperCountry = location.toUpperCase();
    return String(method === 'cfon' && VALID_COUNTRIES.includes(upperCountry) ? upperCountry : '');
};

const validateLicense = (license: string): string => {
    return /^[a-zA-Z0-9-]*$/.test(license) ? license : '';
};

const determineIpType = (endpoint: string, ipType: string): '' | '4' | '6' => {
    if (endpoint === defaultSettings.endpoint) {
        return ipType === '4' || ipType === '6' ? (ipType as '4' | '6') : '';
    } else if (isIPv4(endpoint)) {
        return '4';
    } else if (isIPv6(endpoint)) {
        return '6';
    }
    return '';
};

const validateReserved = (reserved: string): '0' | '1' => {
    return reserved === '0' || reserved === '1'
        ? (reserved as '0' | '1')
        : defaultSettings.reserved
          ? '1'
          : '0';
};

const parseProfileConfig = (pastedText: string): ConfigType | null => {
    const match = /^oblivion:\/\/profile@([^#]*)#([a-zA-Z0-9-_ &?]*)$/i.exec(pastedText);
    if (!match) return null;
    const endpoint = match[1] || defaultSettings.endpoint;
    let name = match[2] || UNTITLED;
    name = name.replace(/[^a-zA-Z0-9-_ ]/g, '');
    name = name.replace(/@/g, '');
    name = name.replace(/[?&]/g, '');
    name = validateName(name);
    return {
        method: 'profile',
        endpoint,
        name
    };
};

const parseConnectionConfig = (pastedText: string): ConfigType | null => {
    const match = /^oblivion:\/\/(warp|cfon|gool)@([^?]*)\?(.+)$/i.exec(pastedText);
    if (!match) return null;

    const method: 'warp' | 'cfon' | 'gool' = (match[1] as any) || defaultSettings.method;
    const endpoint = match[2] || defaultSettings.endpoint;
    const params = new URLSearchParams(match[3]);
    const location = validateCountry(params.get('c') || '', method);
    const license = validateLicense(params.get('l') || '');
    const reserved = validateReserved(params.get('r') || '');
    const ipType = determineIpType(
        endpoint,
        params.get('t')?.toLowerCase() === 'i' ? 'i' : params.get('t') || ''
    );

    return {
        method,
        endpoint,
        location,
        license,
        ipType,
        reserved
    };
};

const validateConfig = (pastedText: string): ConfigType | null => {
    if (pastedText.startsWith('oblivion://profile')) {
        return parseProfileConfig(pastedText);
    } else if (pastedText.startsWith('oblivion://')) {
        return parseConnectionConfig(pastedText);
    }
    return null;
};

const sanitizeConfig = (input: string): string => {
    let atCount = 0;
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

const ConfigHandler = ({ appLang }: any) => {
    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            let pastedText = event.clipboardData?.getData('Text') || '';
            pastedText = pastedText.toLowerCase();
            pastedText = sanitizeConfig(pastedText);
            const config = validateConfig(pastedText);
            if (config) {
                if (config.method === 'profile') {
                    //defaultToast(appLang?.toast?.profile_added, 'CONFIG_HANDLER', 7000);
                } else {
                    //ipcRenderer.sendMessage('wp-end');
                    defaultToast(appLang?.toast?.config_added, 'CONFIG_HANDLER', 7000);
                    setTimeout(async () => {
                        await settings.set(
                            'method',
                            config.method === 'cfon'
                                ? 'psiphon'
                                : config.method === 'warp'
                                  ? ''
                                  : config.method
                        );
                        await settings.set('endpoint', config.endpoint);
                        await settings.set('location', config.location);
                        if (config.license !== '') {
                            await settings.set('license', config.license);
                        }
                        await settings.set(
                            'ipType',
                            config.ipType === '' ? '' : '-' + config.ipType
                        );
                        await settings.set('reserved', config.reserved === '1' ? true : false);
                    }, 200);
                }
                setTimeout(() => {
                    // wp-start
                    toast.remove('ONLINE_STATUS');
                }, 7000);
            }
            event.preventDefault();
        };
        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, []);
    return null;
};

export default ConfigHandler;
