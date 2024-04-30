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
        console.log('➡️ Skipping Download since warp-plus.zip is already been downloaded.');
    }

    decompress(zipFilePath, binPath)
        .then(() => {
            console.log('✅ warp-plus binary is ready to use.');
        })
        .catch((error) => {
            console.log(error);
        });
};

const links = {
    linux: {
        x64: 'https://github.com/bepass-org/warp-plus/releases/download/v1.1.3/warp-plus_linux-amd64.zip',
    },
    win32: {
        x64: 'https://github.com/bepass-org/warp-plus/releases/download/v1.1.3/warp-plus_windows-amd64.zip',
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
    case 'linux':
        switch (arch) {
            case 'x64':
                dlUnzipMove(links[platform][arch]);
                break;

            default:
                notSupported();
                break;
        }
        break;

    // windows
    case 'win32':
        switch (arch) {
            case 'x64':
                dlUnzipMove(links[platform][arch]);
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
