const util = require('util');
const exec = util.promisify(require('child_process').exec);

exports.default = async function (context) {
    console.log('🚀 ~ file: beforePackHook.js:12 ~ context.arch:', context.arch);
    const archDict = {
        1: 'x64',
        2: 'ia32',
        3: 'arm64'
    };
    // TODO don't force download when packaging on the local platform
    const { stdout, stderr } = await exec(
        `npm exec ts-node script/dlWp.ts force ${context.electronPlatformName} ${archDict[context.arch]}`
    );

    if (stderr) {
        console.error(stderr);
    }
    console.log(stdout);
};
