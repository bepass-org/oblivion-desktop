export const cfFlag = (code: string | boolean): string => {
    const flagMapping: Record<string, string> = {
        ir: 'iran',
        in: 'ind'
    };
    const defaultFlag = require('../../../assets/img/flags/xx.svg').default;
    if (!code || typeof code !== 'string') {
        return defaultFlag;
    }
    const normalizedCode = flagMapping[code.toLowerCase()] || code.toLowerCase();
    try {
        return require(`../../../assets/img/flags/${normalizedCode}.svg`).default;
    } catch {
        return defaultFlag;
    }
};
