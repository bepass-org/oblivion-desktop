// download necessary binary files based on os and arch (warp-plus + sing-box)

import fs from 'fs';
import axios from 'axios';
import decompress from 'decompress';
import { doesDirectoryExist, doesFileExist } from '../src/main/lib/utils';
import { sbVersion, wpVersion } from '../src/main/config';

let forceDownload = false;
if (process.argv[2] && process.argv[2] === 'force') {
    forceDownload = true;
}

let platform: any = process.platform;
if (typeof process.argv[3] === 'string') {
    platform = process.argv[3];
}
console.log('➡️  platform:', platform);

let arch: any = process.arch;
if (typeof process.argv[4] === 'string') {
    arch = process.argv[4];
}
console.log('➡️  arch:', arch);
console.log();

async function downloadFile(uri: string, destPath: string) {
    return axios
        .get(uri, {
            responseType: 'arraybuffer',
            onDownloadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                    // @ts-ignore
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                try {
                    process?.stdout?.clearLine(0);
                    process?.stdout?.cursorTo(0);
                    process?.stdout?.write(`Downloading ${uri}: ${percentCompleted}%`);
                } catch (error) {
                    if (
                        !String(error).includes(
                            'TypeError: process?.stdout?.clearLine is not a function'
                        )
                    ) {
                        console.error(error);
                    }
                }
            }
        })
        .then((response) => {
            const arrayBufferView = new Uint8Array(response.data);
            const buffer = Buffer.from(arrayBufferView);
            fs.writeFileSync(destPath, buffer);
            console.log();
        })
        .catch((error) => {
            console.error(`Failed to download ${uri}:`, error.message);
        });
}

// download, unzip and move(rename)
const dlDecompressMove = async ({
    name,
    url,
    compressedFilePath
}: {
    name: 'warp-plus' | 'sing-box';
    url: string;
    compressedFilePath: string;
}) => {
    const binPath = './assets/bin';

    const isBinDirExist = await doesDirectoryExist(binPath);
    if (!isBinDirExist) {
        fs.mkdir(binPath, { recursive: true }, (err) => {
            if (err) {
                console.error(`Error creating directory ${binPath}:`, err);
            }
        });
    }

    const isCompressedFileExist = await doesFileExist(compressedFilePath);

    if (!isCompressedFileExist || forceDownload) {
        console.log(`Downloading ${name} binary based on your platform and architecture...`);

        await downloadFile(url, compressedFilePath);
    } else {
        console.log(`➡️  Skipping Download as ${compressedFilePath} already exist.`);
    }

    return decompress(compressedFilePath, binPath, {
        strip: 1
    })
        .then(() => {
            console.log(`✅ ${name} binary is ready to use.`);

            if (name === 'warp-plus') {
                // removing wintun.dll cause it's getting flagged by antivirus's
                const wintunPath = binPath + '/wintun.dll';
                doesFileExist(wintunPath).then((isExist) => {
                    if (isExist)
                        fs.rm(wintunPath, (err) => {
                            if (err) {
                                console.error(`Error removing ${wintunPath}:`, err);
                            }
                        });
                });
            }
        })
        .catch((error) => {
            console.log(error);
        });
};

const wpBaseUrl = `https://github.com/bepass-org/warp-plus/releases/download/v${wpVersion}/warp-plus_`;

const wpUrls: any = {
    linux: {
        x64: wpBaseUrl + 'linux-amd64.zip',
        arm64: wpBaseUrl + 'linux-arm64.zip'
    },
    win32: {
        x64: wpBaseUrl + 'windows-amd64.zip',
        arm64: wpBaseUrl + 'windows-arm64.zip',
        ia32: wpBaseUrl + 'windows-386.zip'
    },
    darwin: {
        x64: wpBaseUrl + 'darwin-amd64.zip',
        arm64: wpBaseUrl + 'darwin-arm64.zip'
    }
};

const sbBaseUrl = `https://github.com/SagerNet/sing-box/releases/download/v${sbVersion}/sing-box-${sbVersion}-`;

const sbUrls: any = {
    linux: {
        x64: sbBaseUrl + 'linux-amd64.tar.gz',
        arm64: sbBaseUrl + 'linux-arm64.tar.gz'
    },
    win32: {
        x64: sbBaseUrl + 'windows-amd64.zip',
        arm64: sbBaseUrl + 'windows-arm64.zip',
        ia32: sbBaseUrl + 'windows-386.zip'
    },
    darwin: {
        x64: sbBaseUrl + 'darwin-amd64.tar.gz',
        arm64: sbBaseUrl + 'darwin-arm64.tar.gz'
    }
};

const notSupported = () => {
    console.log('your platform/architecture is not supported.');
};

switch (platform) {
    case 'linux':
    case 'win32':
    case 'darwin':
        switch (arch) {
            case 'x64':
            case 'arm64':
            case 'ia32':
                (async () => {
                    await dlDecompressMove({
                        name: 'warp-plus',
                        url: wpUrls[platform][arch],
                        compressedFilePath: `./warp-plus-v${wpVersion}.zip`
                    });
                    await dlDecompressMove({
                        name: 'sing-box',
                        url: sbUrls[platform][arch],
                        compressedFilePath: `./sing-box-v${sbVersion}.${platform === 'win32' ? 'zip' : 'tar.gz'}`
                    });
                })();

                break;

            default:
                notSupported();
                break;
        }
        break;

    default:
        notSupported();
        break;
}
