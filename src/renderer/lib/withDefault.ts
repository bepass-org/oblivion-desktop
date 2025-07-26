export const withDefault = <T>(value: T | undefined, fallback: T): T =>
    typeof value === 'undefined' ? fallback : value;
