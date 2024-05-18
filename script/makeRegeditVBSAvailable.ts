// https://www.npmjs.com/package/regedit#a-note-about-electron

import fs from 'fs';

(async () => {
    const vbsAssetsPath = './node_modules/regedit/vbs';
    const vbsDirPath = './assets/bin/vbs';

    if (process.platform === 'win32') {
        fs.mkdir(vbsDirPath, { recursive: true }, (err) => {
            if (err) {
                console.error(`Error creating directory ${vbsDirPath}:`, err);
            }
            fs.cp(vbsAssetsPath, vbsDirPath, { recursive: true }, (err2) => {
                if (err2) throw err2;
                console.log('✅ regedit wsf files are ready to use.\n');
            });
        });
    }
})();
