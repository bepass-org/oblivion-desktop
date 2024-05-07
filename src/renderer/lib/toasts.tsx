import toast from 'react-hot-toast';

const defaultToastStyle = {
    fontSize: '13px',
    borderRadius: '10px',
    background: '#333',
    color: '#fff'
    // borderRadius: '10px',
    // background: theme === 'dark' ? '#535353' : '#242424',
    // color: '#F4F5FB'
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
    defaultToast('شما به اینترنت متصل نیستید!', 'ONLINE_STATUS', Infinity);
};
