import fs from 'fs';
import axios from 'axios';
import decompress from 'decompress';
import { doesDirectoryExist, doesFileExist } from '../src/main/lib/utils';
import {
    wpVersion,
    helperVersion,
    netStatsVersion,
    proxyResetVersion,
    mpVersion
} from '../src/main/config';

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
const helperUrlBase = `https://github.com/Dr-Bad/oblivion-helper/releases/download/v${helperVersion}/oblivion-helper-`;
const netStatsUrlBase = `https://github.com/ShadowZagrosDev/Zag-NetStats/releases/download/v${netStatsVersion}/zag-netStats-`;
const proxyResetUrlBase = `https://github.com/ircfspace/proxyReset/releases/download/v${proxyResetVersion}/proxy-reset-`;
const masquePlusUrlBase = `https://github.com/ircfspace/masque-plus/releases/download/v${mpVersion}/masque-plus-`;

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

const netStatsUrls: Record<string, Record<string, string>> = {
    linux: {
        x64: netStatsUrlBase + 'linux-amd64.zip',
        arm64: netStatsUrlBase + 'linux-arm64.zip'
    },
    win32: {
        x64: netStatsUrlBase + 'windows-amd64.zip',
        arm64: netStatsUrlBase + 'windows-arm64.zip',
        ia32: netStatsUrlBase + 'windows-386.zip'
    },
    darwin: {
        x64: netStatsUrlBase + 'darwin-amd64.zip',
        arm64: netStatsUrlBase + 'darwin-arm64.zip'
    }
};

const proxyResetUrls: Record<string, Record<string, string>> = {
    win32: {
        x64: proxyResetUrlBase + 'x64.zip',
        arm64: proxyResetUrlBase + 'arm64.zip',
        ia32: proxyResetUrlBase + 'ia32.zip'
    }
};

const masquePlusUrls: Record<string, Record<string, string>> = {
    linux: {
        x64: masquePlusUrlBase + 'linux_amd64.zip',
        arm64: masquePlusUrlBase + 'linux_arm64.zip'
    },
    win32: {
        x64: masquePlusUrlBase + 'windows_amd64.zip',
        arm64: masquePlusUrlBase + 'windows_arm64.zip',
        ia32: masquePlusUrlBase + 'windows_amd64.zip' // This architecture is not supported, but it is listed to prevent errors
    },
    darwin: {
        x64: masquePlusUrlBase + 'darwin_amd64.zip',
        arm64: masquePlusUrlBase + 'darwin_arm64.zip'
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
        helperUrls[platform][arch],
        './assets/bin/oblivion-helper',
        `oblivion-helper-v${helperVersion}.zip`
    );

    await dlUnzipMove(
        netStatsUrls[platform][arch],
        './assets/bin',
        `zag-netStats-v${netStatsVersion}.zip`
    );

    if (platform === 'win32') {
        await dlUnzipMove(
            proxyResetUrls[platform][arch],
            './assets/bin',
            `proxy-reset-v${proxyResetVersion}.zip`
        );
    }

    await dlUnzipMove(
        masquePlusUrls[platform][arch],
        './assets/bin',
        `masque-plus-v${mpVersion}.zip`
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
