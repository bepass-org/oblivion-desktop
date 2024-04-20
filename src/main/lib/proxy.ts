const { spawn } = require('child_process');

const platform = process.platform; // linux / win32 / darwin / else(not supported...)

// tweaking windows proxy settings using powershell
const windowsProxySettings = (args: string[]) => {
    spawn('powershell', [
        'Set-ItemProperty',
        '-Path',
        "'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings'",
        ...args,
    ]);
};

export const enableProxy = () => {
    if (platform === 'win32') {
        windowsProxySettings(['ProxyEnable', '-value', '1']);
        windowsProxySettings(['ProxyServer', '-value', '127.0.0.1:8086']);
        windowsProxySettings([
            'ProxyOverride',
            '"localhost,127.*,10.*,172.16.*,172.17.*,172.18.*,172.19.*,172.20.*,172.21.*,172.22.*,172.23.*,172.24.*,172.25.*,172.26.*,172.27.*,172.28.*,172.29.*,172.30.*,172.31.*,192.168.*,<local>"',
        ]);
    } else {
        console.log('not supported yet');
    }
};

export const disableProxy = () => {
    if (platform === 'win32') {
        windowsProxySettings(['ProxyEnable', '-value', '0']);
    } else {
        console.log('not supported yet');
    }
};
