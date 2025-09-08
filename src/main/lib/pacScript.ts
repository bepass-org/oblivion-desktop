// proxy setup script

import handler from 'serve-handler';
import http from 'http';
import { app } from 'electron';
import { detect } from 'detect-port';
import path from 'path';
import log from 'electron-log';
import settings from 'electron-settings';
import { promises as fsPromises } from 'fs';
import { doesDirectoryExist } from './utils';

export const createPacScript = async (hostIp: string, port: string | number) => {
    log.info('generating pac script...');
    const binPath = path.join(app?.getPath('userData'), 'pac');
    const isBinDirExist = await doesDirectoryExist(binPath);
    if (!isBinDirExist) {
        await fsPromises.mkdir(binPath, { recursive: true });
    }
    const routingRules = await settings.get('routingRules');
    //console.log(routingRules);
    let domainRules = {};
    if (typeof routingRules === 'string' && routingRules !== '') {
        domainRules = routingRules
            .replace(/\n|<br>/g, '')
            .replace(/app:[^,]+(,|$)/g, '')
            .split(',')
            .filter((rule) => rule.trim() !== '')
            .map((rule) => {
                const parts = rule.split(':');
                const isException = parts[1].startsWith('!');
                const value = isException ? parts[1].substring(1) : parts[1];
                return {
                    type: parts[0],
                    value,
                    regex: value.startsWith('*'),
                    forceProxy: isException
                };
            });
    }
    await fsPromises.writeFile(
        path.join(app.getPath('userData'), 'pac', 'proxy.txt'),
        `        var FindProxyForURL = function(init, profiles) {
            return function(url, host) {
                "use strict";
                var result = init, scheme = url.substr(0, url.indexOf(":"));
                do {
                    result = profiles[result];
                    if (typeof result === "function") result = result(url, host, scheme);
                } while (typeof result !== "string" || result.charCodeAt(0) === 43);
                return result;
            };
        }("+proxy", {
            "+proxy": function(url, host, scheme) {
                "use strict";
                if (Object.keys(${JSON.stringify(domainRules)}).length > 0) {
                    for (const rule of ${JSON.stringify(domainRules)}) {
                        if (rule.forceProxy && rule.type === "domain" && rule.value === host) {
                            return "SOCKS5 ${hostIp}:${port}; SOCKS ${hostIp}:${port}";
                        }
                        if (rule.type === "domain" && rule.value === host) {
                            return "DIRECT";
                        }
                        if (rule.type === "ip" && rule.value === host) {
                            return "DIRECT";
                        }
                        if ((rule.type === "domain" || rule.type === "range") && rule.regex && new RegExp(rule.value.replace("*", ".*") + "$").test(host)) {
                            return "DIRECT";
                        }
                    }
                }
                if (/^127.0.0.1$/.test(host) || /^::1$/.test(host) || /^localhost$/.test(host)) {
                    return "DIRECT";
                }
                return "SOCKS5 ${hostIp}:${port}; SOCKS ${hostIp}:${port}";
            }
        });`
    );
    log.info('pac script generated.');
};

let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;

export const servePacScript = (port = 8087) => {
    return new Promise<string>((resolve, reject) => {
        detect(port)
            .then((realPort) => {
                if (port === realPort) {
                    const pacPath = path.join(app.getPath('userData'), 'pac');
                    server = http.createServer((request, response) => {
                        return handler(request, response, {
                            public: pacPath
                        });
                    });
                    server.listen({ port }, () => {
                        log.info(`serving pac script file at http://127.0.0.1:${port}`);
                        resolve(`http://127.0.0.1:${port}`);
                    });
                } else {
                    log.info(`port: ${port} was occupied, trying port: ${realPort}`);
                    servePacScript(realPort);
                }
            })
            .catch((err) => {
                log.error(err);
                reject();
            });
    });
};

export const killPacScriptServer = async () => {
    try {
        if (server) {
            server.close();
            log.info('pac script server closed.');
        }
    } catch (error) {
        log.error(error);
    }
};
