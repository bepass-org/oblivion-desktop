// eslint-disable-next-line max-classes-per-file
import { isWindows, ICommand, IPlatformHelper, IRoutingRules } from '../../constants';

export class WindowsHelper implements IPlatformHelper {
    start(binPath: string): ICommand {
        return {
            command: 'powershell.exe',
            args: [
                '-Command',
                `Start-Process -FilePath '${binPath.replace(/'/g, "''")}' -Verb RunAs -WindowStyle Hidden;`
            ]
        };
    }

    running(): ICommand {
        return {
            command: `tasklist`
        };
    }
}

export class DarwinHelper implements IPlatformHelper {
    start(binPath: string): ICommand {
        return {
            command: 'osascript',
            args: [
                '-e',
                `do shell script "\\"${binPath}\\" > /dev/null 2>&1 & echo $! &" with prompt "Oblivion Desktop requires administrator privileges to run Oblivion-Helper, which is needed to manage network connections." with administrator privileges`
            ]
        };
    }

    running(processName: string): ICommand {
        return {
            command: `pgrep -l ${processName} | awk '{ print $2 }'`
        };
    }
}

export class LinuxHelper implements IPlatformHelper {
    start(binPath: string): ICommand {
        return {
            command: 'pkexec',
            args: [binPath]
        };
    }

    running(processName: string): ICommand {
        return {
            command: `pgrep -l ${processName} | awk '{ print $2 }'`
        };
    }
}

export class RoutingRuleParser {
    parse(routingRules: any): IRoutingRules {
        const result: IRoutingRules = {
            ipSet: [],
            domainSet: [],
            domainSuffixSet: [],
            processSet: []
        };

        if (typeof routingRules !== 'string' || routingRules.trim() === '') {
            return result;
        }

        routingRules
            .split('\n')
            .map((line: string) => line.trim().replace(/,$/, ''))
            .filter(Boolean)
            .forEach((line: string) => {
                const [prefix, value] = line.split(':').map((part) => part.trim());
                if (!value) return;

                this.processRule(prefix, value, result);
            });

        return result;
    }

    private processRule(prefix: string, value: string, result: IRoutingRules): void {
        switch (prefix) {
            case 'ip':
                result.ipSet.push(value);
                break;
            case 'domain':
                this.processDomainRule(value, result);
                break;
            case 'app':
                this.processAppRule(value, result);
                break;
            default:
                break;
        }
    }

    private processDomainRule(value: string, result: IRoutingRules): void {
        if (value.startsWith('*')) {
            result.domainSuffixSet.push(value.substring(1));
        } else {
            result.domainSet.push(value.replace('www.', ''));
        }
    }

    private processAppRule(value: string, result: IRoutingRules): void {
        const app = isWindows && !value.endsWith('.exe') ? `${value}.exe` : value;
        result.processSet.push(app);
    }
}
