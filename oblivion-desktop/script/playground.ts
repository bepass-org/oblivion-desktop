import { doesFileExist } from '../src/main/lib/utils';

(async () => {
    const tmp = await doesFileExist('bin');
    console.log('🚀 - tmp:', tmp);
})();
