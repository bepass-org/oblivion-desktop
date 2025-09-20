import { createRoot } from 'react-dom/client';
import App from './App';
import { ipcRenderer } from './lib/utils';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

// calling IPC exposed from preload script
ipcRenderer.once('ipc-example', (arg) => {
    // eslint-disable-next-line no-console
    console.log(arg);
});
ipcRenderer.sendMessage('ipc-example', ['ping']);

setTimeout(() => {
    ipcRenderer.sendMessage('ipc-example', ['ping2']);
}, 1000);

// tray-menu example(listening for tryMenu click on renderer)
/*ipcRenderer.on('tray-menu', (args) => {
    console.log('🚀 ~ file: index.tsx:22 ~ args:', args);
});*/

// ! this needs to be executed for it to work so make sure you put in somewhere that gets executed (like useEffect)
ipcRenderer.sendMessage('tray-menu');
ipcRenderer.sendMessage('check-update');
