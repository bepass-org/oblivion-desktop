import { exec } from 'child_process';

(async () => {
    if (process.platform === 'win32') {
        exec('npm run postinstall:windows"', (err, stdout) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(stdout);
        });
    } else {
        exec('npm run postinstall:darwin-linux', (err, stdout) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(stdout);
        });
    }
})();
