import { promisified as regedit } from 'regedit';
import { isDev } from './lib/utils';

export const devPlayground = () => {
    if (!isDev()) return;
    console.log('-----------------------------------');

    async function main() {
        // const listResult = await regedit.list(['HKCU\\SOFTWARE']);
        // console.log(listResult);
        // await regedit.createKey(['HKLM\\SOFTWARE\\MyApp2', 'HKCU\\SOFTWARE\\MyApp']);
        // await regedit.putValue({
        //     'HKCU\\SOFTWARE\\MyApp': {
        //         Company: {
        //             value: 'Moo corp',
        //             type: 'REG_SZ'
        //         },
        //         Name: {
        //             type: 'REG_SZ',
        //             value: 'mmd'
        //         }
        //     },
        //     'HKLM\\SOFTWARE\\MyApp2': {
        //         test: {
        //             value: '123',
        //             type: 'REG_SZ'
        //         }
        //     }
        // });
    }

    main();

    console.log('-----------------------------------');
};
