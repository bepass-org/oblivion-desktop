import fs from 'fs';
import log from 'electron-log';
import path from 'path';
import {
    sbConfigPath,
    sbLogPath,
    sbCachePath,
    wpBinPath,
    helperPath,
    ruleSetDirPath,
    IConfig,
    IGeoConfig,
    IRoutingRules
} from '../../constants';

export function createSbConfig(config: IConfig, geoConfig: IGeoConfig, rulesConfig: IRoutingRules) {
    const logConfig =
        config.logLevel === 'disabled'
            ? { disabled: true }
            : {
                  level: config.logLevel,
                  timestamp: true,
                  output: sbLogPath
              };

    const configuration = {
        log: logConfig,
        dns: {
            final: 'dns-remote',
            independent_cache: true,
            strategy: 'prefer_ipv4',
            rules: [
                {
                    outbound: ['any'],
                    server: 'dns-direct'
                },
                ...(geoConfig.geoBlock
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
                ...(geoConfig.geoSite !== 'none'
                    ? [
                          {
                              rule_set: `geosite-${geoConfig.geoSite}`,
                              server: 'dns-direct'
                          }
                      ]
                    : []),
                {
                    process_path: [wpBinPath, helperPath],
                    server: 'dns-direct'
                }
            ],
            servers: [
                {
                    address: config.DoHDns,
                    address_resolver: 'dns-direct',
                    detour: 'socks-out',
                    tag: 'dns-remote'
                },
                {
                    address: config.plainDns,
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
                override_address: config.plainDns,
                override_port: 53,
                tag: 'dns-in',
                type: 'direct'
            },
            {
                type: 'tun',
                tag: 'tun-in',
                mtu: config.tunMtu,
                address: ['172.19.0.1/30'],
                auto_route: true,
                strict_route: true,
                stack: config.tunStack,
                sniff: config.tunSniff,
                sniff_override_destination: config.tunSniff
            }
        ],
        outbounds: [
            {
                type: 'socks',
                tag: 'socks-out',
                server: '127.0.0.1',
                server_port: config.socksPort,
                version: '5'
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
                    process_path: [wpBinPath, helperPath],
                    outbound: 'direct-out'
                },
                ...(geoConfig.geoBlock
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
                    : []),
                ...(rulesConfig.ipSet.length > 0
                    ? [
                          {
                              ip_cidr: rulesConfig.ipSet,
                              outbound: 'direct-out'
                          }
                      ]
                    : []),
                ...(rulesConfig.domainSet.length > 0
                    ? [
                          {
                              domain: rulesConfig.domainSet,
                              outbound: 'direct-out'
                          }
                      ]
                    : []),
                ...(rulesConfig.domainSuffixSet.length > 0
                    ? [
                          {
                              domain_suffix: rulesConfig.domainSuffixSet,
                              outbound: 'direct-out'
                          }
                      ]
                    : []),
                ...(rulesConfig.processSet.length > 0
                    ? [
                          {
                              process_name: rulesConfig.processSet,
                              outbound: 'direct-out'
                          }
                      ]
                    : []),
                ...(geoConfig.geoIp !== 'none'
                    ? [
                          {
                              rule_set: `geoip-${geoConfig.geoIp}`,
                              outbound: 'direct-out'
                          }
                      ]
                    : []),
                ...(geoConfig.geoSite !== 'none'
                    ? [
                          {
                              rule_set: `geosite-${geoConfig.geoSite}`,
                              outbound: 'direct-out'
                          }
                      ]
                    : []),
                {
                    network: 'tcp',
                    outbound: 'socks-out'
                },
                {
                    ip_is_private: true,
                    outbound: 'direct-out'
                },
                {
                    source_ip_is_private: true,
                    outbound: 'direct-out'
                }
            ],
            ...(geoConfig.geoIp !== 'none' || geoConfig.geoSite !== 'none' || geoConfig.geoBlock
                ? {
                      rule_set: [
                          ...(geoConfig.geoIp !== 'none'
                              ? [
                                    {
                                        tag: `geoip-${geoConfig.geoIp}`,
                                        type: 'local',
                                        format: 'source',
                                        path: path.join(
                                            ruleSetDirPath,
                                            `geoip-${geoConfig.geoIp}.json`
                                        )
                                    }
                                ]
                              : []),
                          ...(geoConfig.geoSite !== 'none'
                              ? [
                                    {
                                        tag: `geosite-${geoConfig.geoSite}`,
                                        type: 'local',
                                        format: 'source',
                                        path: path.join(
                                            ruleSetDirPath,
                                            `geosite-${geoConfig.geoSite}.json`
                                        )
                                    }
                                ]
                              : []),
                          ...(geoConfig.geoBlock
                              ? [
                                    {
                                        tag: 'geosite-category-ads-all',
                                        type: 'local',
                                        format: 'source',
                                        path: path.join(
                                            ruleSetDirPath,
                                            'geosite-category-ads-all.json'
                                        )
                                    },
                                    {
                                        tag: 'geosite-malware',
                                        type: 'local',
                                        format: 'source',
                                        path: path.join(ruleSetDirPath, 'geosite-malware.json')
                                    },
                                    {
                                        tag: 'geosite-phishing',
                                        type: 'local',
                                        format: 'source',
                                        path: path.join(ruleSetDirPath, 'geosite-phishing.json')
                                    },
                                    {
                                        tag: 'geosite-cryptominers',
                                        type: 'local',
                                        format: 'source',
                                        path: path.join(ruleSetDirPath, 'geosite-cryptominers.json')
                                    },
                                    {
                                        tag: 'geoip-malware',
                                        type: 'local',
                                        format: 'source',
                                        path: path.join(ruleSetDirPath, 'geoip-malware.json')
                                    },
                                    {
                                        tag: 'geoip-phishing',
                                        type: 'local',
                                        format: 'source',
                                        path: path.join(ruleSetDirPath, 'geoip-phishing.json')
                                    }
                                ]
                              : [])
                      ]
                  }
                : undefined),
            final: 'socks-out',
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
