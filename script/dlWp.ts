// download warp-plus binary

import fs from 'fs'; // import the built-in 'fs' module for writing files
import axios from 'axios';
import decompress from 'decompress';
import { doesFileExist } from '../src/main/lib/utils';

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
                console.log(
                    `Downloading ${uri}: ${percentCompleted}% complete`,
                );
            },
        })
        .then((response) => {
            const arrayBufferView = new Uint8Array(response.data);
            const buffer = Buffer.from(arrayBufferView);
            fs.writeFileSync(destPath, buffer);
            console.log(`Downloaded ${uri} and saved it to ${destPath}`);
        })
        .catch((error) => {
            console.error(`Failed to download ${uri}:`, error.message);
        });
}

// download, unzip and move(rename)
const dlUnzipMove = async (url: string) => {
    // TODO do not download if wp binary exist

    const zipFilePath = './bin/wp.zip';

    const isFileExist = await doesFileExist(zipFilePath);

    if (!isFileExist) {
        await downloadFile(url, zipFilePath);
    } else {
        console.log(
            '➡️ Skipping Download since wp.zip is already exist in bin directory.',
        );
    }

    decompress(zipFilePath, './bin')
        .then((files) => {
            // console.log(files);
            console.log('➡️ Extracted zip file.');
            if (platform === 'win32') {
                fs.rename('./bin/warp-plus.exe', './bin/warp-plus', (err) => {
                    if (err) throw err;
                    console.log('✅ warp-plus binary is ready to use.');
                });
            } else {
                console.log('✅ warp-plus binary is ready to use.');
            }
        })
        .catch((error) => {
            console.log(error);
        });
    // TODO rename to warp-plus based on os
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
        break;

    default:
        notSupported();
        break;
}
