export const checkNewUpdate = (localVersion: any, apiVersion: any) => {
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
