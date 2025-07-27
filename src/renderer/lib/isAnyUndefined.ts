export function isAnyUndefined(...values: unknown[]): boolean {
    return values.some((value) => typeof value === 'undefined');
}

export function typeIsUndefined(value: unknown): boolean {
    return typeof value === 'undefined';
}

export function typeIsNotUndefined(value: unknown): boolean {
    return typeof value !== 'undefined';
}
