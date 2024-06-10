import { Menu, shell, BrowserWindow } from 'electron';
import { exitTheApp } from './lib/utils';
import { regeditVbsDirPath } from './main';

export default class MenuBuilder {
    mainWindow: BrowserWindow;

    constructor(mainWindow: BrowserWindow) {
        this.mainWindow = mainWindow;
    }

    buildMenu(): Menu {
        if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
            this.setupDevelopmentEnvironment();
        }

        const template = this.buildDefaultTemplate();

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);

        return menu;
    }

    setupDevelopmentEnvironment(): void {
        this.mainWindow.webContents.on('context-menu', (_, props) => {
            const { x, y } = props;

            Menu.buildFromTemplate([
                {
                    label: 'Inspect element',
                    click: () => {
                        this.mainWindow.webContents.inspectElement(x, y);
                    }
                }
            ]).popup({ window: this.mainWindow });
        });
    }

    buildDefaultTemplate() {
        const templateDefault = [
            {
                // TODO locale
                label: '&File',
                submenu: [
                    {
                        // TODO locale
                        label: '&Exit',
                        accelerator: 'Ctrl+Q',
                        click: async () => {
                            await exitTheApp(this.mainWindow);
                        }
                    }
                ]
            },
            {
                // TODO locale
                label: 'Help',
                submenu: [
                    {
                        // TODO locale
                        label: 'Learn More',
                        click() {
                            shell.openExternal('https://github.com/bepass-org/oblivion-desktop');
                        }
                    }
                ]
            }
        ];

        return templateDefault;
    }
}
