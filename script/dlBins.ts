import fs from 'fs';
import axios from 'axios';
import decompress from 'decompress';
import { doesDirectoryExist, doesFileExist } from '../src/main/lib/utils';
import { sbVersion, wpVersion, helperVersion } from '../src/main/config';

const forceDownload = process.argv[2] === 'force';
const platform = process.argv[3] || process.platform;
const arch = process.argv[4] || process.arch;

console.log('➡️ platform:', platform);
console.log('➡️ arch:', arch);

async function downloadFile(uri: string, destPath: string) {
    try {
        const response = await axios.get(uri, {
            responseType: 'arraybuffer',
            onDownloadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / (progressEvent.total || 1)
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
        });

        const buffer = Buffer.from(new Uint8Array(response.data));
        fs.writeFileSync(destPath, buffer);
        console.log();
    } catch (error: any) {
        console.error(`Failed to download ${uri}:`, error.message);
    }
}

async function dlUnzipMove(url: string, binPath: string, zipFileName: string) {
    const isBinDirExist = await doesDirectoryExist(binPath);
    if (!isBinDirExist) {
        fs.mkdirSync(binPath, { recursive: true });
    }

    const zipFilePath = `./${zipFileName}`;

    const isZipFileExist = await doesFileExist(zipFilePath);
    if (!isZipFileExist || forceDownload) {
        console.log(`Downloading ${zipFileName} binary based on your platform and architecture...`);
        await downloadFile(url, zipFilePath);
    } else {
        console.log(`➡️ Skipping Download as ${zipFilePath} already exists.`);
    }

    try {
        await decompress(zipFilePath, binPath, { strip: 1 });
        console.log(`✅ ${zipFileName} binary is ready to use.`);
    } catch (error) {
        console.error(error);
    }
}

const warpPlusUrlBase = `https://github.com/bepass-org/warp-plus/releases/download/v${wpVersion}/warp-plus_`;
const singBoxUrlBase = `https://github.com/SagerNet/sing-box/releases/download/v${sbVersion}/sing-box-${sbVersion}-`;
const helperUrlBase = `https://github.com/ShadowZagrosDev/oblivion-helper/releases/download/v${helperVersion}/oblivion-helper-`;

const warpPlusUrls: Record<string, Record<string, string>> = {
    linux: {
        x64: warpPlusUrlBase + 'linux-amd64.zip',
        arm64: warpPlusUrlBase + 'linux-arm64.zip'
    },
    win32: {
        x64: warpPlusUrlBase + 'windows-amd64.zip',
        arm64: warpPlusUrlBase + 'windows-arm64.zip',
        ia32: warpPlusUrlBase + 'windows-386.zip'
    },
    darwin: {
        x64: warpPlusUrlBase + 'darwin-amd64.zip',
        arm64: warpPlusUrlBase + 'darwin-arm64.zip'
    }
};

const singBoxUrls: Record<string, Record<string, string>> = {
    linux: {
        x64: singBoxUrlBase + 'linux-amd64.tar.gz',
        arm64: singBoxUrlBase + 'linux-arm64.tar.gz'
    },
    win32: {
        x64: singBoxUrlBase + 'windows-amd64.zip',
        arm64: singBoxUrlBase + 'windows-arm64.zip',
        ia32: singBoxUrlBase + 'windows-386.zip'
    },
    darwin: {
        x64: singBoxUrlBase + 'darwin-amd64.tar.gz',
        arm64: singBoxUrlBase + 'darwin-arm64.tar.gz'
    }
};

const helperUrls: Record<string, Record<string, string>> = {
    linux: {
        x64: helperUrlBase + 'linux-amd64.zip',
        arm64: helperUrlBase + 'linux-arm64.zip'
    },
    win32: {
        x64: helperUrlBase + 'windows-amd64.zip',
        arm64: helperUrlBase + 'windows-arm64.zip',
        ia32: helperUrlBase + 'windows-386.zip'
    },
    darwin: {
        x64: helperUrlBase + 'darwin-amd64.zip',
        arm64: helperUrlBase + 'darwin-arm64.zip'
    }
};

const removeFile = async (filePath: string) => {
    const isExist = await doesFileExist(filePath);
    if (isExist) {
        fs.rm(filePath, (err) => {
            if (err) console.error(`Error removing ${filePath}:`, err);
        });
    }
};

async function handleDownload() {
    await dlUnzipMove(warpPlusUrls[platform][arch], './assets/bin', `warp-plus-v${wpVersion}.zip`);
    await removeFile('./assets/bin/wintun.dll');

    await dlUnzipMove(
        singBoxUrls[platform][arch],
        './assets/bin/sing-box',
        `sing-box-v${sbVersion}.${platform === 'win32' ? 'zip' : 'tar.gz'}`
    );

    await dlUnzipMove(
        helperUrls[platform][arch],
        './assets/bin',
        `oblivion-helper-v${helperVersion}.zip`
    );
}

const notSupported = () => console.log('Your platform/architecture is not supported.');

switch (platform) {
    case 'linux':
    case 'win32':
    case 'darwin':
        switch (arch) {
            case 'x64':
            case 'arm64':
            case 'ia32':
                handleDownload().catch(notSupported);
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
