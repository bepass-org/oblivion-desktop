import { isDev } from './utils';
import { defaultSettings } from '../../defaultSettings';
import { settings } from './settings';

const comparison = (localVersion: any, apiVersion: any) => {
    const parts1 = localVersion
        .toLowerCase()
        .replace('v', '')
        .replace('-beta', '')
        .split('.')
        .map(Number);
    const parts2 = apiVersion
        .toLowerCase()
        .replace('v', '')
        .replace('-beta', '')
        .split('.')
        .map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const part1 = parts1[i] || 0;
        const part2 = parts2[i] || 0;
        if (part1 > part2) {
            return false;
        } else if (part1 < part2) {
            return true;
        }
    }
    return false;
};

let isCheckingVersion = false;
export const checkNewUpdate = async (appVersion: string) => {
    if (isDev()) return false;
    if (isCheckingVersion) return false;
    try {
        isCheckingVersion = true;
        const betaRelease = await settings.get('betaRelease');
        const isBetaVersionChecking =
            typeof betaRelease === 'undefined' ? defaultSettings.betaRelease : betaRelease;
        const response = await fetch(
            `https://api.github.com/repos/bepass-org/oblivion-desktop/releases${isBetaVersionChecking ? '' : '/latest'}`
        );
        if (response.ok) {
            const data = await response.json();
            //console.log(data);
            let latestVersion = String(data?.tag_name);
            if (isBetaVersionChecking) {
                latestVersion = String(data?.[0]?.tag_name);
            }
            if (latestVersion && comparison(String(appVersion), latestVersion)) {
                return true;
            }
        } else {
            console.log('Failed to fetch release version:', response.statusText);
            return false;
        }
    } catch (error) {
        console.log('Failed to fetch release version:', error);
        return false;
    } finally {
        isCheckingVersion = false;
    }
};
