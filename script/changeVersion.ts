import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

let v = process.argv[2];
if (v.charAt(0) === 'v') {
    v = v.substring(1);
}

function changeJson(filePath: string, key: string, value: string, callback: Function) {
    fs.readFile(filePath, 'utf8', (error, data) => {
        if (error) {
            console.error(error);
            return;
        }
        const json = JSON.parse(data);
        json[key] = value;
        fs.writeFile(filePath, JSON.stringify(json), 'utf8', (error2: any) => {
            if (error2) {
                console.error(error2);
                return;
            }
            callback();
        });
    });
}

changeJson(path.resolve(__dirname, '../package.json'), 'version', v, () => {
    changeJson(path.resolve(__dirname, '../release/app/package.json'), 'version', v, () => {
        console.log('git tag v');
        exec('git tag v' + v, (err) => {
            console.error(err);
            if (err) return;

            console.log('npm run format');
            exec('npm run format', (err2) => {
                console.error(err2);
                if (err) return;

                console.log('git add package.json release/app/package.json');
                exec('git add package.json release/app/package.json', (err3, stdout) => {
                    console.error(err3);
                    console.log(stdout);
                    if (err) return;

                    console.log(`git commit -m "🔖 ${v}"`);
                    exec(`git commit -m "🔖 ${v}"`, (err4, stdout2) => {
                        console.error(err4);
                        console.log(stdout2);
                        if (err) return;

                        console.log(`git push; git push --tags`);
                        exec(`git push; git push --tags`, (err5, stdout3) => {
                            console.error(err5);
                            console.log(stdout3);
                        });
                    });
                });
            });
        });
    });
});
