import { typeIsUndefined } from './isAnyUndefined';

export const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export const toPersianNumber = (
    n: string | number | undefined,
    doNotConvertFloat = false
): string => {
    if (typeIsUndefined(n)) {
        return '';
    }
    n = n?.toString() || '';
    if (doNotConvertFloat && n.includes('.')) {
        return n;
    }
    return n.replace(/\d/g, (x) => farsiDigits[Number(x)]);
};
