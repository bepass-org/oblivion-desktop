import { defaultToastWithSubmitButton } from './toasts';

export const settingsHaveChanged = ({
    isConnected,
    isLoading
}: {
    isConnected: boolean;
    isLoading: boolean;
}) => {
    if (localStorage.getItem('OBLIVION_CHANGES') === 'TOASTED') return;
    if (isConnected || isLoading) {
        defaultToastWithSubmitButton(
            'اعمال تنظیمات نیازمند اتصال مجدد می‌باشد.',
            'متوجه شدم',
            'SETTINGS_CHANGED',
            10000
        );

        localStorage.setItem('OBLIVION_CHANGES', 'TOASTED');
    }
};
