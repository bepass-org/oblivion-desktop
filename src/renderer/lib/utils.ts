import toast from 'react-hot-toast';

export const ipcRenderer = window.electron.ipcRenderer;

export const isDev = () => window.electron.nodeEnv === 'development';

export const checkInternet = async () => {
    toast('شما به اینترنت متصل نیستید!', {
        id: 'onlineStatus',
        duration: Infinity,
        style: {
            fontSize: '13px',
            borderRadius: '10px',
            background: '#333',
            color: '#fff'
        }
    });
};
