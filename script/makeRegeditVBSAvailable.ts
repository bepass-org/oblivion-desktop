// https://www.npmjs.com/package/regedit#a-note-about-electron

import fs from 'fs';

const vbsAssetsPath = './node_modules/regedit/vbs';
const vbsDirPath = './assets/bin/';

if (process.platform === 'win32') {
    fs.cp(vbsAssetsPath, vbsDirPath, { recursive: true }, (err) => {
        if (err) throw err;
        console.log('✅ regedit wsf files are ready to use.\n');
    });
}
