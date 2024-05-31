// proxy setup script

import handler from 'serve-handler';
import http from 'http';
import { app } from 'electron';
import detectPort from 'detect-port';
import path from 'path';
import log from 'electron-log';
import { promises as fsPromises } from 'fs';
import { doesDirectoryExist } from './utils';

export const createPacScript = async (host: string, port: string | number) => {
    log.info('generating pac script...');
    const binPath = path.join(app?.getPath('userData'), 'pac');
    const isBinDirExist = await doesDirectoryExist(binPath);
    if (!isBinDirExist) {
        await fsPromises.mkdir(binPath, { recursive: true });
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
                if (/^127.0.0.1$/.test(host) || /^::1$/.test(host) || /^localhost$/.test(host)) return "DIRECT";
                return "SOCKS5 ${host}:${port}; SOCKS ${host}:${port}";
            }
        });`
    );
    log.info('pac script generated.');
};

let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;

export const servePacScript = (port = 8087) => {
    return new Promise<string>((resolve, reject) => {
        detectPort(port)
            .then((_port) => {
                if (port === _port) {
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
                    log.info(`port: ${port} was occupied, trying port: ${_port}`);
                    servePacScript(_port);
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
        await server.close();
        log.info('pac script server closed.');
    } catch (error) {
        log.error(error);
    }
};
