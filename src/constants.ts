import { app } from 'electron';
import path from 'path';
import SingBoxManager from './main/lib/sbManager';
import NetStatsManager from './main/lib/netStatsManager';
import SpeedTestManager from './main/lib/speedTestManager';

//Platforms
export const isWindows = process.platform === 'win32';
export const isLinux = process.platform === 'linux';
//export const isDarwin = process.platform === 'darwin';

// Constants
export const appVersion = app.getVersion();
export const wpFileName = `warp-plus${isWindows ? '.exe' : ''}`;
export const sbAssetFileName = `sing-box${isWindows ? '.exe' : ''}`;
export const sbWDFileName = `oblivion-sb${isWindows ? '.exe' : ''}`;
export const helperFileName = `oblivion-helper${isWindows ? '.exe' : ''}`;
export const netStatsFileName = `zag-netStats${isWindows ? '.exe' : ''}`;
export const sbConfigName = 'sbConfig.json';
export const sbCacheName = 'sbCache.db';
export const sbLogName = 'sing-box.log';

// Paths
const appPath = app.getAppPath().replace('/app.asar', '').replace('\\app.asar', '');
export const binAssetPath = path.join(appPath, 'assets', 'bin');
export const wpAssetPath = path.join(binAssetPath, wpFileName);
export const sbAssetPath = path.join(binAssetPath, 'sing-box', sbAssetFileName);
export const helperAssetPath = path.join(binAssetPath, helperFileName);
export const netStatsAssetPath = path.join(binAssetPath, netStatsFileName);
export const regeditVbsDirPath = path.join(binAssetPath, 'vbs');
export const protoAssetPath = path.join(appPath, 'assets', 'proto', 'oblivion.proto');
export const dbAssetDirPath = path.join(appPath, 'assets', 'dbs');

export const workingDirPath = app.getPath('userData');
export const wpBinPath = path.join(workingDirPath, wpFileName);
export const stuffPath = path.join(workingDirPath, 'stuff');
export const sbBinPath = path.join(workingDirPath, sbWDFileName);
export const sbConfigPath = path.join(workingDirPath, sbConfigName);
export const helperPath = path.join(workingDirPath, helperFileName);
export const netStatsPath = path.join(workingDirPath, netStatsFileName);
export const helperConfigPath = path.join(workingDirPath, 'config.obv');
//export const sbCachePath = path.join(workingDirPath, sbCacheName);
export const versionFilePath = path.join(workingDirPath, 'ver.txt');
export const ruleSetDirPath = path.join(workingDirPath, 'ruleset');
export const sbLogPath = path.join(workingDirPath, sbLogName);
export const sbCachePath = path.join(workingDirPath, sbCacheName);
export const logPath = path.join(app?.getPath('logs'), 'main.log');

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
    socksPort: number;
    tunMtu: number;
    logLevel: string;
    tunStack: string;
    tunSniff: boolean;
    plainDns: string;
    DoHDns: string;
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
