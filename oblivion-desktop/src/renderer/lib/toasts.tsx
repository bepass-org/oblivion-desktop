import toast from 'react-hot-toast';
import { Language } from '../../localization/type';

const defaultToastStyle = {
    fontSize: '13px',
    lineHeight: '22px',
    borderRadius: '10px',
    background: '#333',
    color: '#fff'
};

export const defaultToast = (msg = '', id = 'ID', duration = 5000) => {
    /* eslint-disable-next-line react/no-danger */
    toast(<div dangerouslySetInnerHTML={{ __html: msg }} />, {
        id: id,
        duration: duration,
        style: defaultToastStyle
    });
    setTimeout(() => {
        toast.remove(id);
    }, duration + 200);
};

export const defaultToastWithHelp = (
    msg = '',
    linkRef = '',
    linkText = '',
    id = 'ID',
    duration = 7000
) => {
    let text = msg;
    if (linkRef !== '') {
        //text += `<div class="clearfix"></div>`;
        text += `<a href="${linkRef}" class="toastHelp" target="_blank">${linkText}</a>`;
    }
    defaultToast(text, id, duration);
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
        ),
        {
            id: id,
            duration: duration,
            style: defaultToastStyle
        }
    );
};

export const checkInternetToast = (msg: string) => {
    defaultToast(msg, 'ONLINE_STATUS', Infinity);
};

let doNotShowSettingsHaveChangedToastInCurrentSession = false;
export const settingsHaveChangedToast = ({
    isConnected,
    isLoading,
    appLang
}: {
    isConnected: boolean;
    isLoading: boolean;
    appLang: Language;
}) => {
    if (doNotShowSettingsHaveChangedToastInCurrentSession) return;
    if (isConnected || isLoading) {
        defaultToastWithSubmitButton(
            appLang?.toast?.settings_changed,
            appLang?.toast?.btn_submit,
            'SETTINGS_CHANGED',
            3000,
            () => {
                doNotShowSettingsHaveChangedToastInCurrentSession = true;
            }
        );
    }
};

export const loadingToast = (msg: string) => {
    toast.loading(msg, {
        id: 'LOADING',
        duration: Infinity,
        style: defaultToastStyle
    });
};

export const stopLoadingToast = () => {
    setTimeout(() => {
        toast.remove('LOADING');
    }, 1000);
};
