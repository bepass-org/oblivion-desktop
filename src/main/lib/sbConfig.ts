import fs from 'fs';
import log from 'electron-log';
import { sbConfigPath } from '../ipcListeners/wp';

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
                stack: 'gvisor',
                sniff: true,
                endpoint_independent_nat: false,
                sniff_override_destination: true
            }
        ],
        outbounds: [
            {
                type: 'socks',
                tag: 'socks-out',
                server: '127.0.0.1',
                server_port: socksPort
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
        }
    };

    fs.writeFileSync(sbConfigPath, JSON.stringify(config, null, 2), 'utf-8');
    log.info(`Sing-Box config file has been created at ${sbConfigPath}`);
}
