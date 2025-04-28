export const isSystemDateValid = (): boolean => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const minYear = 2025;
    if (currentYear < minYear) {
        return false;
    }
    return true;
};
