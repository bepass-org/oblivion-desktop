const util = require('util');
const exec = util.promisify(require('child_process').exec);

exports.default = async function (context) {
    console.log(context);
    // TODO don't force download when packaging for the local platform
    const { stdout, stderr } = await exec('npm exec ts-node script/dlWp.ts force');

    if (stderr) {
        console.error(stderr);
    }
    console.log(stdout);
};
