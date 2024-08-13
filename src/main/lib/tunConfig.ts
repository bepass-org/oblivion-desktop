import fs from 'fs';
import path from 'path';
import { wpDirPath } from '../ipcListeners/wp';

export function createOrUpdateTunConfig({
    logLevel = 'warn',
    logTimestamp = true,
    tunMtu = 9000,
    tunAddress = ['172.18.0.1/30', 'fdfe:dcba:9876::1/126'],
    tunAutoRoute = true,
    tunStrictRoute = true,
    mixedListenPort = 7890,
    socksServer = '127.0.0.1',
    socksServerPort = 8086,
    routeProcessNames = [
        'warp-plus',
        'oblivion-desktop',
        'Electron',
        'oblivion-desktop - electronmon'
    ],
    routeFinalOutbound = 'socks-out',
    routeAutoDetectInterface = true
} = {}) {
    if (process.platform === 'win32') {
        routeProcessNames = routeProcessNames.map((name) => `${name}.exe`);
    }

    const tunConfig = {
        log: {
            level: logLevel,
            timestamp: logTimestamp
        },
        inbounds: [
            {
                type: 'tun',
                tag: 'tun-in',
                mtu: tunMtu,
                address: tunAddress,
                auto_route: tunAutoRoute,
                strict_route: tunStrictRoute
            },
            {
                type: 'mixed',
                tag: 'mixed-in',
                listen: '::',
                listen_port: mixedListenPort,
                set_system_proxy: true
            }
        ],
        outbounds: [
            {
                type: 'socks',
                tag: 'socks-out',
                server: socksServer,
                server_port: socksServerPort
            },
            {
                type: 'direct',
                tag: 'direct-out'
            }
        ],
        route: {
            rules: [
                {
                    process_name: routeProcessNames,
                    outbound: 'direct-out'
                },
                {
                    network: 'udp',
                    outbound: 'direct-out'
                }
            ],
            final: routeFinalOutbound,
            auto_detect_interface: routeAutoDetectInterface
        }
    };

    const filePath = path.join(wpDirPath, 'tun-config.json');

    fs.writeFileSync(filePath, JSON.stringify(tunConfig, null, 2), 'utf-8');

    console.log(`✅ tun-config.json has been created/updated at ${filePath}`);
}
