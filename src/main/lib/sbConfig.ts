import fs from 'fs';
import log from 'electron-log';
import path from 'path';
import {
    sbConfigPath,
    sbLogPath,
    sbCachePath,
    ruleSetDirPath,
    IConfig,
    IGeoConfig,
    IRoutingRules,
    defaultWarpIPs,
    isLinux,
    isWindows,
    isDarwin
} from '../../constants';
import { defaultSettings } from '../../defaultSettings';
import { formatEndpointForConfig, isIpBasedDoH } from './utils';

export function createSbConfig(config: IConfig, geoConfig: IGeoConfig, rulesConfig: IRoutingRules) {
    const domainSetDirect = rulesConfig.domainSet.filter((d) => !d.startsWith('!'));
    const domainSetException = rulesConfig.domainSet
        .filter((d) => d.startsWith('!'))
        .map((d) => d.slice(1));

    const logConfig =
        config.logLevel === 'disabled'
            ? { disabled: true }
            : {
                  level: config.logLevel,
                  timestamp: true,
                  output: sbLogPath
              };

    const DoHDns = new URL(config.DoHDns);

    const configuration = {
        log: logConfig,
        dns: {
            independent_cache: true,
            strategy: 'prefer_ipv4',
            final: 'dns-remote',
            servers: [
                {
                    tag: 'dns-remote',
                    type: 'https',
                    server: DoHDns.hostname,
                    server_port: DoHDns.port === '' ? 443 : DoHDns.port,
                    path: DoHDns.pathname,
                    detour: 'proxy',
                    ...(!isIpBasedDoH(config.DoHDns) && { domain_resolver: 'dns-cf' })
                },
                {
                    tag: 'dns-direct',
                    ...(config.plainDns === ''
                        ? {
                              type: 'local'
                          }
                        : {
                              type: 'udp',
                              server: config.plainDns
                          }),
                    detour: 'direct'
                },
                ...(!isIpBasedDoH(config.DoHDns)
                    ? [
                          {
                              tag: 'dns-cf',
                              type: 'udp',
                              server: '1.1.1.1',
                              detour: 'proxy'
                          }
                      ]
                    : []),
                {
                    tag: 'dns-hosts',
                    type: 'hosts'
                }
            ],
            rules: [
                ...(domainSetException.length > 0
                    ? [
                          {
                              action: 'route',
                              domain: domainSetException,
                              server: 'dns-remote'
                          }
                      ]
                    : []),
                {
                    server: 'dns-hosts',
                    ip_accept_any: true
                },
                ...(domainSetDirect.length > 0
                    ? [
                          {
                              action: 'route',
                              domain: domainSetDirect,
                              server: 'dns-direct'
                          }
                      ]
                    : []),
                ...(rulesConfig.domainSuffixSet.length > 0
                    ? [
                          {
                              action: 'route',
                              domain_suffix: rulesConfig.domainSuffixSet,
                              server: 'dns-direct'
                          }
                      ]
                    : [])
            ]
        },
        inbounds: [
            {
                type: 'tun',
                tag: 'tun-in',
                mtu: config.tunMtu,
                address: config.tunAddr,
                auto_route: true,
                strict_route: true,
                stack: config.tunStack,
                endpoint_independent_nat: true,
                sniff: config.tunSniff,
                sniff_override_destination: config.tunSniff,
                route_exclude_address:
                    config.tunEndpoint === defaultSettings.endpoint
                        ? defaultWarpIPs
                        : [formatEndpointForConfig(config.tunEndpoint)]
            }
        ],
        outbounds: [
            {
                type: 'socks',
                tag: 'proxy',
                server: config.socksIp,
                server_port: config.socksPort,
                version: '5'
            },
            {
                type: 'direct',
                tag: 'direct',
                domain_resolver: 'dns-direct'
            }
        ],
        route: {
            rules: [
                {
                    action: 'sniff'
                },
                {
                    protocol: 'dns',
                    action: 'hijack-dns'
                },
                {
                    action: 'resolve'
                },
                { action: 'route', ip_is_private: true, outbound: 'direct' },
                ...(config.socksIp
                    ? [
                          {
                              action: 'route',
                              ip_cidr: [
                                  config.socksIp === '0.0.0.0'
                                      ? '0.0.0.0/0'
                                      : `${config.socksIp}/32`
                              ],
                              outbound: 'direct'
                          }
                      ]
                    : []),
                ...(config.discordBypass
                    ? [
                          {
                              action: 'route',
                              domain: ['full:updates.discord.com'],
                              outbound: 'proxy'
                          },
                          {
                              action: 'route',
                              process_name: [
                                  'Discord' + (isWindows ? '.exe' : ''),
                                  'discord' + (isWindows ? '.exe' : '')
                              ],
                              network: 'udp',
                              outbound: 'direct'
                          },
                          {
                              action: 'route',
                              domain: [
                                  'full:discord.com',
                                  'full:*.discord.com',
                                  'full:discordapp.com',
                                  'full:*.discordapp.com',
                                  'full:discord.gg',
                                  'full:*.discord.gg'
                              ],
                              outbound: 'direct'
                          }
                      ]
                    : []),

                // Universal required ports for all platforms
                {
                    action: 'route',
                    port: [
                        123, // NTP (Network Time Protocol) for system time sync
                        1900, // SSDP (Simple Service Discovery Protocol) for device discovery
                        5353 // mDNS (Multicast DNS) for local network service discovery
                    ],
                    outbound: 'direct'
                },

                // Windows-specific ports
                ...(isWindows
                    ? [
                          {
                              action: 'route',
                              network: 'udp',
                              port: [
                                  123, // The NTP port uses UDP and UDP may be blocked by the user
                                  68, // DHCP client for network configuration
                                  137, // NetBIOS name service
                                  138, // NetBIOS datagram service
                                  88, // Kerberos authentication - conditionally direct
                                  389, // LDAP for Active Directory - conditionally direct
                                  5355 // LLMNR (Link-Local Multicast Name Resolution)
                              ],
                              outbound: 'direct'
                          },
                          {
                              action: 'route',
                              network: 'tcp',
                              port: [
                                  445, // SMB (Server Message Block) for file sharing
                                  139, // NetBIOS session service
                                  88, // Kerberos authentication - conditionally direct
                                  389 // LDAP for Active Directory - conditionally direct
                              ],
                              outbound: 'direct'
                          }
                      ]
                    : []),

                // macOS-specific ports
                ...(isDarwin
                    ? [
                          {
                              action: 'route',
                              network: 'tcp',
                              port: [
                                  631, // IPP (Internet Printing Protocol)
                                  3283, // Apple Net Assistant for screen sharing
                                  633, // Apple Configurator for device management
                                  548, // AFP (Apple Filing Protocol) - conditionally direct
                                  5900, // VNC/Screen sharing
                                  427 // SLP (Service Location Protocol)
                              ],
                              outbound: 'direct'
                          },
                          {
                              action: 'route',
                              network: 'udp',
                              port: [
                                  514, // Syslog for system logging
                                  631, // IPP (UDP variant)
                                  427 // SLP (Service Location Protocol)
                              ],
                              outbound: 'direct'
                          }
                      ]
                    : []),

                // Linux-specific ports
                ...(isLinux
                    ? [
                          {
                              action: 'route',
                              network: 'tcp',
                              port: [
                                  111, // Portmapper/RPC for service registration
                                  2049, // NFS (Network File System)
                                  427 // SLP (Service Location Protocol)
                              ],
                              outbound: 'direct'
                          },
                          {
                              action: 'route',
                              network: 'udp',
                              port: [
                                  68, // DHCP client
                                  111, // Portmapper/RPC (UDP variant)
                                  427 // SLP (Service Location Protocol)
                              ],
                              outbound: 'direct'
                          }
                      ]
                    : []),

                {
                    action: 'route',
                    domain: [
                        'full:time.windows.com',
                        'full:*.pool.ntp.org',
                        'full:time.apple.com',
                        'full:time.nist.gov',
                        'full:ntp.ubuntu.com',
                        'full:ntp2.aliyun.com',
                        'full:ntp.aliyun.com',
                        'full:*.ntp.org'
                    ],
                    outbound: 'direct'
                },

                ...(config.udpBlock
                    ? [
                          {
                              action: 'reject',
                              network: 'udp'
                          }
                      ]
                    : []),

                ...(geoConfig.geoBlock
                    ? [
                          {
                              action: 'reject',
                              rule_set: [
                                  'geosite-category-ads-all',
                                  'geosite-malware',
                                  'geosite-phishing',
                                  'geosite-cryptominers',
                                  'geoip-malware',
                                  'geoip-phishing'
                              ]
                          }
                      ]
                    : []),
                ...(geoConfig.geoNSFW
                    ? [
                          {
                              action: 'reject',
                              rule_set: 'geosite-nsfw'
                          }
                      ]
                    : []),
                ...(rulesConfig.ipSet.length > 0
                    ? [
                          {
                              action: 'route',
                              ip_cidr: rulesConfig.ipSet,
                              outbound: 'direct'
                          }
                      ]
                    : []),
                ...(domainSetException.length > 0
                    ? [
                          {
                              action: 'route',
                              domain: domainSetException,
                              outbound: 'proxy'
                          }
                      ]
                    : []),
                ...(domainSetDirect.length > 0
                    ? [
                          {
                              action: 'route',
                              domain: domainSetDirect,
                              outbound: 'direct'
                          }
                      ]
                    : []),
                ...(rulesConfig.domainSuffixSet.length > 0
                    ? [
                          {
                              action: 'route',
                              domain_suffix: rulesConfig.domainSuffixSet,
                              outbound: 'direct'
                          }
                      ]
                    : []),
                ...(rulesConfig.processSet.length > 0
                    ? [
                          {
                              action: 'route',
                              process_name: rulesConfig.processSet,
                              outbound: 'direct'
                          }
                      ]
                    : []),
                ...(geoConfig.geoIp !== 'none'
                    ? [
                          {
                              action: 'route',
                              rule_set: `geoip-${geoConfig.geoIp}`,
                              outbound: 'direct'
                          }
                      ]
                    : []),
                ...(geoConfig.geoSite !== 'none'
                    ? [
                          {
                              action: 'route',
                              rule_set: `geosite-${geoConfig.geoSite}`,
                              outbound: 'direct'
                          }
                      ]
                    : [])
            ],
            ...(geoConfig.geoIp !== 'none' ||
            geoConfig.geoSite !== 'none' ||
            geoConfig.geoBlock ||
            geoConfig.geoNSFW
                ? {
                      rule_set: [
                          ...(geoConfig.geoIp !== 'none'
                              ? [
                                    {
                                        tag: `geoip-${geoConfig.geoIp}`,
                                        type: 'local',
                                        format: 'binary',
                                        path: path.join(
                                            ruleSetDirPath,
                                            `geoip-${geoConfig.geoIp}.srs`
                                        )
                                    }
                                ]
                              : []),
                          ...(geoConfig.geoSite !== 'none'
                              ? [
                                    {
                                        tag: `geosite-${geoConfig.geoSite}`,
                                        type: 'local',
                                        format: 'binary',
                                        path: path.join(
                                            ruleSetDirPath,
                                            `geosite-${geoConfig.geoSite}.srs`
                                        )
                                    }
                                ]
                              : []),
                          ...(geoConfig.geoBlock
                              ? [
                                    {
                                        tag: 'geosite-category-ads-all',
                                        type: 'local',
                                        format: 'binary',
                                        path: path.join(
                                            ruleSetDirPath,
                                            'geosite-category-ads-all.srs'
                                        )
                                    },
                                    {
                                        tag: 'geosite-malware',
                                        type: 'local',
                                        format: 'binary',
                                        path: path.join(ruleSetDirPath, 'geosite-malware.srs')
                                    },
                                    {
                                        tag: 'geosite-phishing',
                                        type: 'local',
                                        format: 'binary',
                                        path: path.join(ruleSetDirPath, 'geosite-phishing.srs')
                                    },
                                    {
                                        tag: 'geosite-cryptominers',
                                        type: 'local',
                                        format: 'binary',
                                        path: path.join(ruleSetDirPath, 'geosite-cryptominers.srs')
                                    },
                                    {
                                        tag: 'geoip-malware',
                                        type: 'local',
                                        format: 'binary',
                                        path: path.join(ruleSetDirPath, 'geoip-malware.srs')
                                    },
                                    {
                                        tag: 'geoip-phishing',
                                        type: 'local',
                                        format: 'binary',
                                        path: path.join(ruleSetDirPath, 'geoip-phishing.srs')
                                    }
                                ]
                              : []),
                          ...(geoConfig.geoNSFW
                              ? [
                                    {
                                        tag: 'geosite-nsfw',
                                        type: 'local',
                                        format: 'binary',
                                        path: path.join(ruleSetDirPath, 'geosite-nsfw.srs')
                                    }
                                ]
                              : [])
                      ]
                  }
                : undefined),
            default_domain_resolver: 'dns-direct',
            final: 'proxy',
            auto_detect_interface: true
        },
        experimental: {
            cache_file: {
                enabled: true,
                path: sbCachePath,
                store_fakeip: true
            }
        }
    };

    fs.writeFileSync(sbConfigPath, JSON.stringify(configuration, null, 2), 'utf-8');
    log.info(`Sing-Box config file has been created at ${sbConfigPath}`);
}
