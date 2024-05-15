import classNames from 'classnames';
import { settings } from '../../lib/settings';
import { defaultSettings } from '../../../defaultSettings';
import { ipcRenderer } from '../../lib/utils';
import { getLang, loadLang } from '../../lib/loaders';

export default function RestoreModal({
    title,
    isOpen,
    onClose,
    setTheme,
    setIpData,
    setSystemTray,
    setPort,
    //setAutoSetProxy,
    setShareVPN,
    setLang
}: {
    title: string;
    isOpen: boolean;
    onClose: any;
    setTheme: any;
    setIpData: any;
    setSystemTray: any;
    setPort: any;
    //setAutoSetProxy: any;
    setShareVPN: any;
    setLang: any;
}) {
    if (!isOpen) return null;

    const appLang = getLang();

    const onSaveModal = async () => {
        // in this page
        setTheme(defaultSettings.theme);
        setIpData(defaultSettings.ipData);
        setSystemTray(defaultSettings.systemTray);
        setPort(defaultSettings.port);
        //setAutoSetProxy(defaultSettings.autoSetProxy);
        setShareVPN(defaultSettings.shareVPN);
        setLang(defaultSettings.lang);
        await settings.set('theme', defaultSettings.theme);
        await settings.set('ipData', defaultSettings.ipData);
        await settings.set('systemTray', defaultSettings.systemTray);
        await settings.set('port', defaultSettings.port);
        //await settings.set('autoSetProxy', defaultSettings.autoSetProxy);
        await settings.set('shareVPN', defaultSettings.shareVPN);
        await settings.set('lang', defaultSettings.lang);
        document.documentElement.setAttribute('data-bs-theme', defaultSettings.theme);
        onClose();
        // other settings
        //await settings.set('scan', defaultSettings.scan);
        await settings.set('endpoint', defaultSettings.endpoint);
        //await settings.set('psiphon', defaultSettings.psiphon);
        await settings.set('location', defaultSettings.location);
        await settings.set('license', defaultSettings.license);
        //await settings.set('gool', defaultSettings.gool);
        await settings.set('method', defaultSettings.method);
        await settings.set('hostIP', defaultSettings.hostIP);
        //
        ipcRenderer.sendMessage('wp-end');
    };

    return (
        <>
            <div className='dialog'>
                <div className='dialogBg' onClick={onClose} />
                <div className='dialogBox'>
                    <div className='container'>
                        <div className='line'>
                            <div className='miniLine' />
                        </div>
                        <h3>{title}</h3>
                        <p>{appLang?.modal?.restore_desc}</p>
                        <div className='clearfix' />
                        <div className={classNames('btn', 'btn-cancel')} onClick={onClose}>
                            {appLang?.modal?.cancel}
                        </div>
                        <div
                            className={classNames('btn', 'btn-save')}
                            onClick={() => {
                                onSaveModal();
                            }}
                        >
                            {appLang?.modal?.confirm}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
