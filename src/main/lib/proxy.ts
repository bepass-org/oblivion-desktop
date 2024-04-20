const { spawn } = require('child_process');

const platform = process.platform; // linux / win32 / darwin / else(not supported...)

export const enableProxy = () => {
    if (platform === 'win32') {
        spawn('powershell', [
            'Set-ItemProperty',
            '-Path',
            "'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings'",
            'ProxyEnable',
            '-value',
            '1',
        ]);
        spawn('powershell', [
            'Set-ItemProperty',
            '-Path',
            "'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings'",
            'ProxyOverride',
            '"localhost,127.*,10.*,172.16.*,172.17.*,172.18.*,172.19.*,172.20.*,172.21.*,172.22.*,172.23.*,172.24.*,172.25.*,172.26.*,172.27.*,172.28.*,172.29.*,172.30.*,172.31.*,192.168.*,<local>"',
        ]);
    } else {
        console.log('not supported yet');
    }
};

export const disableProxy = () => {
    if (platform === 'win32') {
        spawn('powershell', [
            'Set-ItemProperty',
            '-Path',
            "'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings'",
            'ProxyEnable',
            '-value',
            '0',
        ]);
    } else {
        console.log('not supported yet');
    }
};
