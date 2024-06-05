import { getLang } from './loaders';
import toast from 'react-hot-toast';

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
    duration = 5000,
    onSubmitCallBack = () => {}
) => {
    toast(
        (currentToast) => (
            <>
                <div className='customToast'>
                    <p>{msg}</p>
                    <button
                        onClick={() => {
                            toast.remove(currentToast?.id);
                            onSubmitCallBack();
                        }}
                    >
                        {submitTitle}
                    </button>
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
    defaultToast(`${appLang?.toast?.offline}`, 'ONLINE_STATUS', Infinity);
};

let doNotShowSettingsHaveChangedToastInCurrentSession = false;
export const settingsHaveChangedToast = ({
    isConnected,
    isLoading
}: {
    isConnected: boolean;
    isLoading: boolean;
}) => {
    if (doNotShowSettingsHaveChangedToastInCurrentSession) return;
    if (isConnected || isLoading) {
        defaultToastWithSubmitButton(
            `${appLang?.toast?.settings_changed}`,
            `${appLang?.toast?.btn_submit}`,
            'SETTINGS_CHANGED',
            3000,
            () => {
                doNotShowSettingsHaveChangedToastInCurrentSession = true;
            }
        );
    }
};

export const loadingToast = () => {
    toast.loading(`${appLang?.toast?.please_wait}`, {
        id: 'LOADING',
        duration: Infinity,
        style: defaultToastStyle
    });
};
