import { settings } from '../../lib/settings';
import { defaultSettings } from '../../../defaultSettings';
import classNames from 'classnames';
import { ipcRenderer } from '../../lib/utils';

export default function RestoreModal({
                                         title,
                                         isOpen,
                                         onClose,
                                         setTheme,
                                         setIpData,
                                         setSystemTray,
                                         setPort,
                                         setAutoSetProxy,
                                         setShareVPN
                                     }: {
    title: string;
    isOpen: boolean;
    onClose: any;
    setTheme: any;
    setIpData: any;
    setSystemTray: any;
    setPort: any;
    setAutoSetProxy: any;
    setShareVPN: any;
}) {
    if (!isOpen) return null;

    const onSaveModal = async () => {
        // in this page
        setTheme(defaultSettings.theme);
        setIpData(defaultSettings.ipData);
        setSystemTray(defaultSettings.systemTray);
        setPort(defaultSettings.port);
        setAutoSetProxy(defaultSettings.autoSetProxy);
        setShareVPN(defaultSettings.shareVPN);
        await settings.set('theme', defaultSettings.theme).then();
        await settings.set('ipData', defaultSettings.ipData).then();
        await settings.set('systemTray', defaultSettings.systemTray).then();
        await settings.set('port', defaultSettings.port).then();
        await settings.set('autoSetProxy', defaultSettings.autoSetProxy).then();
        await settings.set('shareVPN', defaultSettings.shareVPN).then();
        document.documentElement.setAttribute('data-bs-theme', defaultSettings.theme);
        onClose();
        // other settings
        //await settings.set('scan', defaultSettings.scan).then();
        await settings.set('endpoint', defaultSettings.endpoint).then();
        await settings.set('psiphon', defaultSettings.psiphon).then();
        await settings.set('location', defaultSettings.location).then();
        await settings.set('license', defaultSettings.license).then();
        await settings.set('gool', defaultSettings.gool).then();
        await settings.set('hostIP', defaultSettings.hostIP).then();
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
                        <p>با تایید عملیات بازگردانی تغییرات، تمامی تنظیمات برنامه به‌حالت پیشفرض باز گشته و اتصال شما
                            قطع می‌گردد.</p>
                        <div className='clearfix' />
                        <div className={classNames('btn', 'btn-cancel')} onClick={onClose}>
                            انصراف
                        </div>
                        <div
                            className={classNames('btn', 'btn-save')}
                            onClick={() => {
                                onSaveModal();
                            }}
                        >
                            تایید می‌کنم
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
