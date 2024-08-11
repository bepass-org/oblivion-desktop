import path from 'path';
import log from 'electron-log';

const { spawn } = require('child_process');

let child: any;

const simpleLog = log.create('simpleLog');
simpleLog.transports.console.format = '{text}';
simpleLog.transports.file.format = '{text}';

export const enableTune = ({
    onSuccess,
    userDataPath,
    sbFileName
}: {
    onSuccess: Function;
    userDataPath: any;
    sbFileName: any;
}) => {
    const command = path.join(userDataPath, sbFileName);

    log.info('starting sb process...');
    // TODO sb args
    // log.info(`${command + ' ' + args.join(' ')}`);
    log.info(`${command}`);

    // TODO sb args
    child = spawn(command, ['run', '-c', 'sb-tun-default.json'], { cwd: userDataPath });

    // const successMessage = `level=INFO msg="serving proxy" address=${hostIP}`;
    // const successTunMessage = `level=INFO msg="serving tun"`;

    child.stdout.on('data', async (data: any) => {
        const strData = data.toString();
        // if (strData.includes(successMessage)) {
        //     onSuccess();
        // }

        // handleWpErrors(strData, event, String(port));

        // if (!showWpLogs && isDev()) return;
        simpleLog.info(strData);
    });

    child.stderr.on('data', (err: any) => {
        // if (!showWpLogs && isDev()) return;
        simpleLog.error(`err: ${err.toString()}`);
    });

    child.on('exit', async () => {
        // disconnectedFlags[1] = true;
        // sendDisconnectedSignalToRenderer();
        log.info('sb process exited.');
        // manually setting pid to undefined
        // child.pid = undefined;
        // handleSystemProxyDisconnect();
    });
};
