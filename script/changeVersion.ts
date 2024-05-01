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
    changeJson(path.resolve(__dirname, '../release/app/package.json'), 'version', v, async () => {
        await exec('git tag v' + v, (err, stdout) => {
            console.error(err);
            console.log(stdout);
        });
        await exec('npm run format', (err) => {
            console.error(err);
        });
        await exec('git add package.json release/app/package.json', (err, stdout) => {
            console.error(err);
            console.log(stdout);
        });
        await exec(`git commit -m "🔖 ${v}"`, (err, stdout) => {
            console.error(err);
            console.log(stdout);
        });
        await exec(`git push; git push --tags`, (err, stdout) => {
            console.error(err);
            console.log(stdout);
        });
    });
});
