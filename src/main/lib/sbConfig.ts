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
    defaultWarpIPs
} from '../../constants';
import { defaultSettings } from '../../defaultSettings';
import { formatEndpointForConfig } from './utils';

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
            servers: [
                {
                    tag: 'dns-remote',
                    address: config.DoHDns,
                    address_resolver: 'dns-direct'
                },
                {
                    tag: 'dns-direct',
                    address: config.plainDns,
                    detour: 'direct-out'
                },
                {
                    tag: 'dns-block',
                    address: 'rcode://success'
                }
            ],
            rules: [
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
                    network: ['tcp', 'udp'],
                    server: 'dns-remote'
                }
            ]
        },
        inbounds: [
            {
                type: 'direct',
                tag: 'dns-in',
                listen: '0.0.0.0',
                listen_port: 6450,
                override_address: config.plainDns,
                override_port: 53
            },
            {
                type: 'tun',
                tag: 'tun-in',
                mtu: config.tunMtu,
                address: ['172.19.0.1/30', 'fdfe:dcba:9876::1/126'],
                auto_route: true,
                strict_route: true,
                stack: config.tunStack,
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
                    port: 53,
                    outbound: 'dns-out'
                },
                {
                    inbound: 'dns-in',
                    outbound: 'dns-out'
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
                    network: ['tcp', 'udp'],
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
