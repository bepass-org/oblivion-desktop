import fs from 'fs';
import log from 'electron-log';
import { sbConfigPath } from '../ipcListeners/wp';

export function createSbConfig(
    socksServerPort: number,
    mtu: number,
    geoBlock: boolean,
    geoRegion: string,
    geoIp: string,
    geoSite: string
) {
    if (
        socksServerPort === undefined ||
        mtu === undefined ||
        geoBlock === undefined ||
        geoRegion === undefined ||
        geoIp === undefined ||
        geoSite === undefined
    ) {
        throw new Error('some required parameters are undefined');
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
                mtu: mtu,
                inet4_address: '172.19.0.1/28',
                inet6_address: 'fdfe:dcba:9876::1/126',
                auto_route: true,
                strict_route: false,
                stack: 'mixed',
                sniff: true,
                sniff_override_destination: true
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
            },
            {
                type: 'block',
                tag: 'block-out'
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
                },
                {
                    ip_is_private: true,
                    outbound: 'direct-out'
                },
                ...(geoIp !== ''
                    ? [
                          {
                              rule_set: `geoip-${geoRegion.toLowerCase()}`,
                              outbound: 'direct-out'
                          }
                      ]
                    : []),
                ...(geoSite !== ''
                    ? [
                          {
                              rule_set: `geosite-${geoRegion.toLowerCase()}`,
                              outbound: 'direct-out'
                          }
                      ]
                    : []),
                ...(geoBlock
                    ? [
                          {
                              rule_set: [
                                  'geosite-category-ads-all',
                                  'geosite-malware',
                                  'geosite-phishing',
                                  'geosite-cryptominers',
                                  'geoip-malware',
                                  'geoip-phishing'
                              ],
                              outbound: 'block-out'
                          }
                      ]
                    : [])
            ],
            rule_set: [
                ...(geoIp !== ''
                    ? [
                          {
                              tag: `geoip-${geoRegion.toLowerCase()}`,
                              type: 'remote',
                              format: 'binary',
                              url: geoIp,
                              download_detour: 'direct-out'
                          }
                      ]
                    : []),
                ...(geoSite !== ''
                    ? [
                          {
                              tag: `geosite-${geoRegion.toLowerCase()}`,
                              type: 'remote',
                              format: 'binary',
                              url: geoSite,
                              download_detour: 'direct-out'
                          }
                      ]
                    : []),
                ...(geoBlock
                    ? [
                          {
                              tag: 'geosite-category-ads-all',
                              type: 'remote',
                              format: 'binary',
                              url: 'https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-category-ads-all.srs',
                              download_detour: 'direct-out'
                          },
                          {
                              tag: 'geosite-malware',
                              type: 'remote',
                              format: 'binary',
                              url: 'https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-malware.srs',
                              download_detour: 'direct-out'
                          },
                          {
                              tag: 'geosite-phishing',
                              type: 'remote',
                              format: 'binary',
                              url: 'https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-phishing.srs',
                              download_detour: 'direct-out'
                          },
                          {
                              tag: 'geosite-cryptominers',
                              type: 'remote',
                              format: 'binary',
                              url: 'https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geosite-cryptominers.srs',
                              download_detour: 'direct-out'
                          },
                          {
                              tag: 'geoip-malware',
                              type: 'remote',
                              format: 'binary',
                              url: 'https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geoip-malware.srs',
                              download_detour: 'direct-out'
                          },
                          {
                              tag: 'geoip-phishing',
                              type: 'remote',
                              format: 'binary',
                              url: 'https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/geoip-phishing.srs',
                              download_detour: 'direct-out'
                          }
                      ]
                    : [])
            ],
            final: 'socks-out',
            auto_detect_interface: true
        },
        experimental: {
            cache_file: {
                enabled: true,
                path: 'sbCache.db'
            }
        }
    };

    fs.writeFileSync(sbConfigPath, JSON.stringify(config, null, 2), 'utf-8');
    log.info(`✅ sbConfig.json has been created at ${sbConfigPath}`);
}
