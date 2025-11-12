export const cfFlag = (code: string) => {
    const flag = code?.trim().toUpperCase();
    try {
        if (flag === 'IR') {
            return require(`../../../assets/img/flags/ir.svg`).default;
        } else {
            return `https://flagsapi.com/${flag}/flat/32.png`;
        }
    } catch {
        return require('../../../assets/img/flags/xx.svg').default;
    }
};
