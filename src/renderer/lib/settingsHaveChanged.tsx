import toast from 'react-hot-toast';

export const settingsHaveChanged = () => {
    const connected = localStorage.getItem('OBLIVION_STATUS');
    const changesToast = localStorage.getItem('OBLIVION_CHANGES');

    if (connected === 'CONNECTED' && !changesToast) {
        toast(
            (currentToast) => (
                <>
                    <div className='customToast'>
                        <p>اعمال تنظیمات نیازمند اتصال مجدد می‌باشد.</p>
                        <button onClick={() => toast.dismiss(currentToast?.id)}>متوجه شدم</button>
                    </div>
                </>
            ),
            {
                id: 'settingsChanged',
                duration: 10000,
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff'
                }
            }
        );
        localStorage.setItem('OBLIVION_CHANGES', 'TOASTED');
    }
};
