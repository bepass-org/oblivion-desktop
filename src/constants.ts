import { app } from 'electron';
import path from 'path';
import SingBoxManager from './main/lib/sbManager';
import NetStatsManager from './main/lib/netStatsManager';
import SpeedTestManager from './main/lib/speedTestManager';

//Platforms
export const isWindows = process.platform === 'win32';
export const isLinux = process.platform === 'linux';
export const isDarwin = process.platform === 'darwin';

// Constants
export const appVersion = app.getVersion();
export const wpFileName = `warp-plus${isWindows ? '.exe' : ''}`;
export const helperFileName = `oblivion-helper${isWindows ? '.exe' : ''}`;
export const netStatsFileName = `zag-netStats${isWindows ? '.exe' : ''}`;
export const sbConfigName = 'sbConfig.json';
export const sbExportListName = 'sbExportList.json';
export const sbCacheName = 'sbCache.db';
export const sbLogName = 'sing-box.log';
export const protoName = `oblivion.proto`;
export const ruleSetBaseUrl =
    'https://raw.githubusercontent.com/Chocolate4U/Iran-sing-box-rules/rule-set/';

// Paths
const appPath = app.getAppPath().replace('/app.asar', '').replace('\\app.asar', '');
export const binAssetPath = path.join(appPath, 'assets', 'bin');
export const wpAssetPath = path.join(binAssetPath, wpFileName);
export const helperAssetPath = path.join(binAssetPath, 'oblivion-helper', helperFileName);
export const netStatsAssetPath = path.join(binAssetPath, netStatsFileName);
export const regeditVbsDirPath = path.join(binAssetPath, 'vbs');
export const protoAssetPath = path.join(appPath, 'assets', 'proto', protoName);

export const workingDirPath = app.getPath('userData');
export const wpBinPath = path.join(workingDirPath, wpFileName);
export const helperPath = path.join(workingDirPath, helperFileName);
export const sbConfigPath = path.join(workingDirPath, sbConfigName);
export const sbExportListPath = path.join(workingDirPath, sbExportListName);
export const sbLogPath = path.join(workingDirPath, sbLogName);
export const sbCachePath = path.join(workingDirPath, sbCacheName);
export const ruleSetDirPath = path.join(workingDirPath, 'ruleset');
export const netStatsPath = path.join(workingDirPath, netStatsFileName);
export const versionFilePath = path.join(workingDirPath, 'ver.txt');
export const stuffPath = path.join(workingDirPath, 'stuff');
export const logPath = path.join(app?.getPath('logs'), 'main.log');
export const soundEffect = path.join(appPath, 'assets', 'sound', 'notification.mp3');

// Managers
export const singBoxManager = new SingBoxManager();
export const netStatsManager = new NetStatsManager();
export const speedTestManager = new SpeedTestManager();

//Interfaces
export interface INetStats {
    sentSpeed: { value: number; unit: string };
    recvSpeed: { value: number; unit: string };
    totalSent: { value: number; unit: string };
    totalRecv: { value: number; unit: string };
    totalUsage: { value: number; unit: string };
}

export interface IConfig {
    socksIp: string;
    socksPort: number;
    tunMtu: number;
    logLevel: string;
    tunStack: string;
    tunSniff: boolean;
    plainDns: string;
    DoHDns: string;
    tunEndpoint: string;
}

export interface IGeoConfig {
    geoIp: string;
    geoSite: string;
    geoBlock: boolean;
}

export interface IRoutingRules {
    ipSet: string[];
    domainSet: string[];
    domainSuffixSet: string[];
    processSet: string[];
}

export interface ICommand {
    command: string;
    args?: string[];
}

export interface IPlatformHelper {
    start(binPath: string): ICommand;
    running(processName: string): ICommand;
}

//Lists
export const defaultWarpIPs = [
    '162.159.192.0/24',
    '162.159.193.0/24',
    '162.159.195.0/24',
    '188.114.96.0/24',
    '188.114.97.0/24',
    '188.114.98.0/24',
    '188.114.99.0/24',
    '2606:4700:d0::/64',
    '2606:4700:d1::/64'
];
