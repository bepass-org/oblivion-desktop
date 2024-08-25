import fs from 'fs';
import { sbConfigPath } from '../ipcListeners/wp';

export function createOrUpdateSbConfig(socksServerPort: number, endpointPorts: number[]) {
    if (socksServerPort === undefined) {
        throw new Error('socksServerPort is a required parameter');
    }

    const config = {
        log: {
            disabled: true,
            level: 'warn',
            timestamp: true
        },
        inbounds: [
            {
                type: 'tun',
                tag: 'tun-in',
                mtu: 9000,
                inet4_address: '172.18.0.1/30',
                inet6_address: 'fdfe:dcba:9876::1/126',
                auto_route: true,
                strict_route: true
            }
        ],
        outbounds: [
            {
                type: 'socks',
                tag: 'socks-out',
                server: '127.0.0.1',
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
                    process_name: process.platform === 'win32' ? 'warp-plus.exe' : 'warp-plus',
                    outbound: 'direct-out'
                },
                {
                    network: 'udp',
                    port: endpointPorts,
                    outbound: 'direct-out'
                }
            ],
            final: 'socks-out',
            auto_detect_interface: true
        }
    };

    fs.writeFileSync(sbConfigPath, JSON.stringify(config, null, 2), 'utf-8');
    console.log(`✅ sbConfig.json has been created/updated at ${sbConfigPath}`);
}
