import fs from 'fs';
import log from 'electron-log';
import { sbConfigPath } from '../ipcListeners/wp';
import { disableSbLogs } from '../dxConfig';

export function createSbConfig(
    socksPort: number,
    mtu: number,
    geoBlock: boolean,
    geoIp: string,
    geoSite: string,
    ipSet: string[],
    domainSet: string[],
    domainSuffixSet: string[],
    processSet: string[]
) {
    if (
        socksPort === undefined ||
        mtu === undefined ||
        geoBlock === undefined ||
        geoIp === undefined ||
        geoSite === undefined
    ) {
        throw new Error('some required parameters are undefined');
    }

    const config = {
        log: {
            disabled: disableSbLogs,
            level: 'warn',
            timestamp: true,
            output: 'sing-box.log'
        },
        dns: {
            final: 'dns-remote',
            independent_cache: true,
            rules: [
                {
                    outbound: ['any'],
                    server: 'dns-direct'
                },
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
                              disable_cache: true,
                              server: 'dns-block'
                          }
                      ]
                    : []),
                ...(geoIp !== 'none'
                    ? [
                          {
                              rule_set: `geoip-${geoIp}`,
                              server: 'dns-direct'
                          }
                      ]
                    : []),
                ...(geoSite !== 'none'
                    ? [
                          {
                              rule_set: `geosite-${geoSite}`,
                              server: 'dns-direct'
                          }
                      ]
                    : [])
            ],
            servers: [
                {
                    address: 'https://1.1.1.2/dns-query',
                    address_resolver: 'dns-direct',
                    detour: 'socks-out',
                    tag: 'dns-remote'
                },
                {
                    address: '8.8.8.8',
                    detour: 'direct-out',
                    tag: 'dns-direct'
                },
                {
                    address: 'rcode://success',
                    tag: 'dns-block'
                }
            ]
        },
        inbounds: [
            {
                listen: '0.0.0.0',
                listen_port: 6450,
                override_address: '8.8.8.8',
                override_port: 53,
                tag: 'dns-in',
                type: 'direct'
            },
            {
                type: 'tun',
                tag: 'tun-in',
                mtu: mtu,
                address: ['172.19.0.1/30', 'fdfe:dcba:9876::1/126'],
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
                server_port: socksPort,
                version: '5',
                udp_fragment: true
            },
            {
                type: 'direct',
                tag: 'direct-out'
            },
            {
                type: 'block',
                tag: 'block-out'
            },
            {
                type: 'dns',
                tag: 'dns-out'
            }
        ],
        route: {
            rules: [
                {
                    outbound: 'dns-out',
                    port: [53]
                },
                {
                    inbound: ['dns-in'],
                    outbound: 'dns-out'
                },
                {
                    network: 'udp',
                    outbound: 'direct-out'
                },
                {
                    ip_is_private: true,
                    outbound: 'direct-out'
                },
                ...(ipSet.length > 0
                    ? [
                          {
                              ip_cidr: ipSet,
                              outbound: 'direct-out'
                          }
                      ]
                    : []),
                ...(domainSet.length > 0
                    ? [
                          {
                              domain: domainSet,
                              outbound: 'direct-out'
                          }
                      ]
                    : []),
                ...(domainSuffixSet.length > 0
                    ? [
                          {
                              domain_suffix: domainSuffixSet,
                              outbound: 'direct-out'
                          }
                      ]
                    : []),
                ...(processSet.length > 0
                    ? [
                          {
                              process_name: processSet,
                              outbound: 'dns-out'
                          },
                          {
                              process_name: processSet,
                              outbound: 'direct-out'
                          }
                      ]
                    : []),
                ...(geoIp !== 'none'
                    ? [
                          {
                              rule_set: `geoip-${geoIp}`,
                              outbound: 'direct-out'
                          }
                      ]
                    : []),
                ...(geoSite !== 'none'
                    ? [
                          {
                              rule_set: `geosite-${geoSite}`,
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
                ...(geoIp !== 'none'
                    ? [
                          {
                              tag: `geoip-${geoIp}`,
                              type: 'local',
                              format: 'source',
                              path: `geoip-${geoIp}.json`
                          }
                      ]
                    : []),
                ...(geoSite !== 'none'
                    ? [
                          {
                              tag: `geosite-${geoSite}`,
                              type: 'local',
                              format: 'source',
                              path: `geosite-${geoSite}.json`
                          }
                      ]
                    : []),
                ...(geoBlock
                    ? [
                          {
                              tag: 'geosite-category-ads-all',
                              type: 'local',
                              format: 'source',
                              path: 'geosite-category-ads-all.json'
                          },
                          {
                              tag: 'geosite-malware',
                              type: 'local',
                              format: 'source',
                              path: 'geosite-malware.json'
                          },
                          {
                              tag: 'geosite-phishing',
                              type: 'local',
                              format: 'source',
                              path: 'geosite-phishing.json'
                          },
                          {
                              tag: 'geosite-cryptominers',
                              type: 'local',
                              format: 'source',
                              path: 'geosite-cryptominers.json'
                          },
                          {
                              tag: 'geoip-malware',
                              type: 'local',
                              format: 'source',
                              path: 'geoip-malware.json'
                          },
                          {
                              tag: 'geoip-phishing',
                              type: 'local',
                              format: 'source',
                              path: 'geoip-phishing.json'
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
                path: 'sbCache.db',
                store_fakeip: true
            }
        }
    };

    fs.writeFileSync(sbConfigPath, JSON.stringify(config, null, 2), 'utf-8');
    log.info(`Sing-Box config file has been created at ${sbConfigPath}`);
}
