const util = require('util');
const exec = util.promisify(require('child_process').exec);

exports.default = async function (context) {
    const archDict = {
        0: 'ia32',
        1: 'x64',
        3: 'arm64'
    };
    // TODO don't force download when packaging on the local platform
    const { stdout, stderr } = await exec(
        `npm exec ts-node script/dlBins.ts force ${context.electronPlatformName} ${archDict[context.arch]}`
    );

    if (stderr) {
        console.error(stderr);
    }
    console.log(stdout);
};
