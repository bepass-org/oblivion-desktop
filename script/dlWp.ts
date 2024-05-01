// download warp-plus binary

import fs from 'fs';
import axios from 'axios';
import decompress from 'decompress';
import { doesDirectoryExist, doesFileExist } from '../src/main/lib/utils';

async function downloadFile(uri: string, destPath: string) {
    return axios
        .get(uri, {
            responseType: 'arraybuffer',
            onDownloadProgress: (progressEvent) => {
                // TODO improve DX
                const percentCompleted = Math.round(
                    // @ts-ignore
                    (progressEvent.loaded * 100) / progressEvent.total,
                );
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(`Downloading ${uri}: ${percentCompleted}%`);
            },
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

    if (!isZipFileExist) {
        await downloadFile(url, zipFilePath);
    } else {
        console.log('➡️ Skipping Download since warp-plus.zip is already has been downloaded.');
    }

    decompress(zipFilePath, binPath)
        .then(() => {
            console.log('✅ warp-plus binary is ready to use.');
        })
        .catch((error) => {
            console.log(error);
        });
};

const wpVersion = 'v1.1.3';
const baseUrl = `https://github.com/bepass-org/warp-plus/releases/download/${wpVersion}`;

const urls = {
    linux: {
        x64: baseUrl + '/warp-plus_linux-amd64.zip',
        arm64: baseUrl + '/warp-plus_linux-arm64.zip',
    },
    win32: {
        x64: baseUrl + '/warp-plus_windows-amd64.zip',
        arm64: baseUrl + '/warp-plus_windows-arm64.zip',
    },
    darwin: {
        x64: baseUrl + '/warp-plus_darwin-amd64.zip',
        arm64: baseUrl + '/warp-plus_darwin-arm64.zip',
    },
};

const platform = process.platform; // linux / win32 / darwin / else(not supported...)
console.log('➡️ platform:', platform);
const arch = process.arch; // x64 / arm / arm64 or... / else(not supported...)
console.log('➡️ arch:', arch);

const notSupported = () => {
    console.log('your platform/architecture is not supported.');
};

switch (platform) {
    case 'linux' || 'win32' || 'darwin':
        switch (arch) {
            case 'x64' || 'arm64':
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
