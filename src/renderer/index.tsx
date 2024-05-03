import { createRoot } from 'react-dom/client';
import App from './App';
import { ipcRenderer } from './lib/utils';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
    <div dir='rtl'>
        <App />
    </div>
);

// calling IPC exposed from preload script
ipcRenderer.on('ipc-example', (arg) => {
    // eslint-disable-next-line no-console
    console.log(arg);
});
ipcRenderer.sendMessage('ipc-example', ['ping']);

setTimeout(() => {
    ipcRenderer.sendMessage('ipc-example', ['ping2']);
}, 1000);
