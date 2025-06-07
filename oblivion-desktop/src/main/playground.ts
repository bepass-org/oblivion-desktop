import { isDev } from './lib/utils';

export const devPlayground = () => {
    if (!isDev()) return;
    console.log('-----------------------------------');

    // // serving pac script file
    // const servePacScript = (port: number) => {
    //     detectPort(port)
    //         .then((_port) => {
    //             if (port === _port) {
    //                 // console.log(`port: ${port} was not occupied`);
    //                 const pacPath = path.join(app.getPath('userData'), 'pac');
    //                 const server = http.createServer((request, response) => {
    //                     return handler(request, response, {
    //                         public: pacPath
    //                     });
    //                 });
    //                 server.listen(port, () => {
    //                     log.info(`Serving static files(pac script) at http://{host}:${port}`);
    //                 });
    //                 // server.close()
    //             } else {
    //                 log.info(`port: ${port} was occupied, trying port: ${_port}`);
    //                 servePacScript(_port);
    //             }
    //         })
    //         .catch((err) => {
    //             log.error(err);
    //         });
    // };

    // servePacScript(8087);

    // regedit
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
