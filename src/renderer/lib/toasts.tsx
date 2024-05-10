import toast from 'react-hot-toast';
import { getLang } from './loaders';

const appLang = getLang();
const defaultToastStyle = {
    fontSize: '13px',
    borderRadius: '10px',
    background: '#333',
    color: '#fff'
};

export const defaultToast = (msg = '', id = 'ID', duration = 5000) => {
    toast(msg, {
        id: id,
        duration: duration,
        style: defaultToastStyle
    });
};

export const defaultToastWithSubmitButton = (
    msg = '',
    submitTitle = '',
    id = 'ID',
    duration = 5000
) => {
    toast(
        (currentToast) => (
            <>
                <div className='customToast'>
                    <p>{msg}</p>
                    <button onClick={() => toast.dismiss(currentToast?.id)}> {submitTitle}</button>
                </div>
            </>
        ),
        {
            id: id,
            duration: duration,
            style: defaultToastStyle
        }
    );
};

export const checkInternetToast = () => {
    defaultToast(appLang?.toast?.offline, 'ONLINE_STATUS', Infinity);
};

export const settingsHaveChangedToast = ({
                                             isConnected,
                                             isLoading
                                         }: {
    isConnected: boolean;
    isLoading: boolean;
}) => {
    if (localStorage.getItem('OBLIVION_CHANGES') === 'TOASTED') return;
    if (isConnected || isLoading) {
        defaultToastWithSubmitButton(
            appLang?.toast?.settings_changed,
            'متوجه شدم',
            'SETTINGS_CHANGED',
            10000
        );

        localStorage.setItem('OBLIVION_CHANGES', 'TOASTED');
    }
};

export const loadingToast = () => {
    toast.loading(appLang?.toast?.please_wait, {
        id: 'LOADING',
        duration: Infinity,
        style: defaultToastStyle
    });
};