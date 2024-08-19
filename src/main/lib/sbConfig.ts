import fs from 'fs';
import path from 'path';
import { wpDirPath } from '../ipcListeners/wp';

export function createOrUpdateSbConfig(socksServerPort: number, method: any) {
    if (socksServerPort === undefined) {
        throw new Error('socksServerPort and method are required parameters');
    }

    const commonConfig = {
        log: {
            disabled: true,
            level: 'warn',
            timestamp: true
        },
        inbounds: [
            {
                type: 'mixed',
                tag: 'mixed-in',
                listen: '::',
                listen_port: 7890,
                set_system_proxy: true
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
                    outbound: 'direct-out'
                }
            ],
            final: 'socks-out'
        }
    };

    const config =
        method === 'tun'
            ? {
                  ...commonConfig,
                  inbounds: [
                      {
                          type: 'tun',
                          tag: 'tun-in',
                          mtu: 9000,
                          inet4_address: '172.18.0.1/30',
                          inet6_address: 'fdfe:dcba:9876::1/126',
                          auto_route: true,
                          strict_route: true
                      },
                      ...commonConfig.inbounds
                  ],
                  route: {
                      ...commonConfig.route,
                      auto_detect_interface: true
                  }
              }
            : commonConfig;

    const filePath = path.join(wpDirPath, 'sbConfig.json');
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');
    console.log(`✅ sbConfig.json has been created/updated at ${filePath}`);
}
