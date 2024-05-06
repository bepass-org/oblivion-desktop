import toast from 'react-hot-toast';

export const settingsHaveChanged = ({
    isConnected,
    isLoading
}: {
    isConnected: boolean;
    isLoading: boolean;
}) => {
    if (localStorage.getItem('OBLIVION_CHANGES') === 'TOASTED') return;
    if (isConnected || isLoading) {
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
