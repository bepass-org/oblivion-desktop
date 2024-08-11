import path from 'path';
import log from 'electron-log';
import { IpcMainEvent } from 'electron';
import { getTranslate } from '../../localization';
import { showSbLogs } from '../dxConfig';
import { isDev } from './utils';
import treeKill from 'tree-kill';

const { spawn } = require('child_process');

let child: any;

const simpleLog = log.create('simpleLog');
simpleLog.transports.console.format = '{text}';
simpleLog.transports.file.format = '{text}';

const appLang = getTranslate('en');

export const sbErrorTranslation: any = {
    'configure tun interface: Access is denied': () => {
        return appLang.log.error_tun_access_denied;
    }
};

export const handleSbErrors = (
    strData: string,
    ipcEvent: IpcMainEvent,
    port: string,
    onError: Function
) => {
    Object.keys(sbErrorTranslation).forEach((errorMsg: string) => {
        if (strData.includes(errorMsg)) {
            onError();
            ipcEvent.reply(
                'guide-toast',
                sbErrorTranslation[errorMsg]({
                    port: port
                })
            );
        }
    });
};

export const enableTun = ({
    onSuccess,
    onError,
    userDataPath,
    sbFileName,
    ipcEvent
}: {
    onSuccess: Function;
    onError: Function;
    userDataPath: any;
    sbFileName: any;
    ipcEvent: IpcMainEvent;
}) => {
    const command = path.join(userDataPath, sbFileName);

    log.info('starting sb process...');
    // TODO dynamic args
    const args = ['run', '-c', 'sb-tun-default.json'];
    log.info(`${command + ' ' + args.join(' ')}`);

    child = spawn(command, args, { cwd: userDataPath });

    // TODO dynamic hostIP
    const hostIP = 2080;
    const successMessage = `tcp server started at 127.0.0.1:${hostIP}`;

    child.stderr.on('data', async (data: any) => {
        const strData = String(data);
        if (strData.includes(successMessage)) {
            onSuccess();
        }

        handleSbErrors(strData, ipcEvent, 'P0RT', onError);

        if (!showSbLogs && isDev()) return;
        simpleLog.info(strData, typeof strData);
    });
};

export const disableTun = ({ onExit }: { onExit: Function }) => {
    try {
        if (typeof child?.pid !== 'undefined') {
            treeKill(child.pid, 'SIGKILL');
        }
    } catch (error) {
        log.error(error);
    }

    child.on('exit', async () => {
        child.pid = undefined;
        onExit();
    });
};
