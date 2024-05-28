// download warp-plus binary

import fs from 'fs';
import axios from 'axios';
import decompress from 'decompress';
import { doesDirectoryExist, doesFileExist } from '../src/main/lib/utils';
import { wpVersion } from '../src/main/config';

let forceDownload = false;
if (process.argv[2] && process.argv[2] === 'force') {
    forceDownload = true;
}

let platform: any = process.platform;
if (typeof process.argv[3] === 'string') {
    platform = process.argv[3];
}
console.log('➡️ platform:', platform);

let arch: any = process.arch;
if (typeof process.argv[4] === 'string') {
    arch = process.argv[4];
}
console.log('➡️ arch:', arch);

async function downloadFile(uri: string, destPath: string) {
    return axios
        .get(uri, {
            responseType: 'arraybuffer',
            onDownloadProgress: (progressEvent) => {
                // TODO improve DX
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
            // console.log(`Downloaded ${uri} and saved it to ${destPath}`);
            console.log();
        })
        .catch((error) => {
            console.error(`Failed to download ${uri}:`, error.message);
        });
}

// download, unzip and move(rename)
const dlUnzipMove = async (url: string) => {
    const binPath = './assets/bin';

    const isBinDirExist = await doesDirectoryExist(binPath);
    if (!isBinDirExist) {
        fs.mkdir(binPath, { recursive: true }, (err) => {
            if (err) {
                console.error(`Error creating directory ${binPath}:`, err);
            }
        });
    }

    const zipFilePath = './warp-plus.zip';

    const isZipFileExist = await doesFileExist(zipFilePath);

    if (!isZipFileExist || forceDownload) {
        console.log('downloading warp-plus binary based on your platform and architecture...');

        await downloadFile(url, zipFilePath);
    } else {
        console.log('➡️ Skipping Download as warp-plus.zip already exist.');
    }

    decompress(zipFilePath, binPath)
        .then(() => {
            console.log('✅ warp-plus binary is ready to use.');
        })
        .catch((error) => {
            console.log(error);
        });
};

const baseUrl = `https://github.com/bepass-org/warp-plus/releases/download/${wpVersion}/warp-plus_`;

const urls: any = {
    linux: {
        x64: baseUrl + 'linux-amd64.zip',
        arm64: baseUrl + 'linux-arm64.zip'
    },
    win32: {
        x64: baseUrl + 'windows-amd64.zip',
        arm64: baseUrl + 'windows-arm64.zip',
        ia32: baseUrl + 'windows-386.zip'
    },
    darwin: {
        x64: baseUrl + 'darwin-amd64.zip',
        arm64: baseUrl + 'darwin-arm64.zip'
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
                dlUnzipMove(urls[platform][arch]);
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
