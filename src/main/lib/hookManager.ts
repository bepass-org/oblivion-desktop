import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import settings from 'electron-settings';
import log from 'electron-log';

export type HookType = 'connectSuccess' | 'connectFail' | 'disconnect' | 'connectionError';

interface HookConfig {
    executable: string;
    args: string;
}

class HookManager {
    /**
     * Execute a hook by type
     */
    public static async executeHook(
        hookType: HookType,
        context?: Record<string, any>
    ): Promise<void> {
        try {
            const hookConfig = await this.getHookConfig(hookType);
            if (!hookConfig.executable) {
                log.info(`No executable configured for hook: ${hookType}`);
                return;
            }

            await this.runHook(hookType, hookConfig, context);
        } catch (error) {
            log.error(`Error executing hook ${hookType}:`, error);
        }
    }

    /**
     * Get hook configuration from settings
     */
    private static async getHookConfig(hookType: HookType): Promise<HookConfig> {
        const executableKey = `hook${this.capitalizeFirst(hookType)}` as const;
        const argsKey = `hook${this.capitalizeFirst(hookType)}Args` as const;

        const executable = (await settings.get(executableKey)) || '';
        const args = (await settings.get(argsKey)) || '';

        return {
            executable: String(executable),
            args: String(args)
        };
    }

    /**
     * Run the hook executable
     */
    private static async runHook(
        hookType: HookType,
        config: HookConfig,
        context?: Record<string, any>
    ): Promise<void> {
        // Validate executable exists
        if (!fs.existsSync(config.executable)) {
            log.error(`Hook executable not found: ${config.executable}`);
            return;
        }

        const executablePath = path.resolve(config.executable);
        const args = this.parseArguments(config.args);

        // Prepare environment variables with context information
        const env = { ...process.env };

        // Add hook type and timestamp
        env.OBLIVION_HOOK_TYPE = hookType;
        env.OBLIVION_TIMESTAMP = new Date().toISOString();

        // Add context information as environment variables
        if (context) {
            Object.entries(context).forEach(([key, value]) => {
                env[`OBLIVION_${key.toUpperCase()}`] = String(value);
            });
        }

        // Handle Windows batch files and cmd files
        let command = executablePath;
        let commandArgs = args;

        const ext = path.extname(executablePath).toLowerCase();
        let spawnOptions: any;

        if (process.platform === 'win32' && (ext === '.bat' || ext === '.cmd')) {
            // For Windows batch files, use shell execution
            command = executablePath;
            commandArgs = args;
            spawnOptions = {
                detached: true,
                env,
                cwd: path.dirname(executablePath),
                windowsHide: false, // Allow console to show for debugging
                stdio: ['ignore', 'pipe', 'pipe'], // Capture output for logging
                shell: true // Use shell execution for batch files
            };
        } else {
            spawnOptions = {
                detached: true,
                env,
                cwd: path.dirname(executablePath),
                stdio: 'ignore',
                windowsHide: true
            };
        }

        log.info(`Executing hook: ${hookType} - ${command} ${commandArgs.join(' ')}`);

        try {
            const child = spawn(command, commandArgs, spawnOptions);

            // For Windows batch files, capture and log output for debugging
            if (process.platform === 'win32' && (ext === '.bat' || ext === '.cmd')) {
                if (child.stdout) {
                    child.stdout.on('data', (data) => {
                        log.info(`Hook ${hookType} stdout: ${data.toString().trim()}`);
                    });
                }
                if (child.stderr) {
                    child.stderr.on('data', (data) => {
                        log.warn(`Hook ${hookType} stderr: ${data.toString().trim()}`);
                    });
                }
            }

            // Unref the child process so it doesn't keep the parent process alive
            child.unref();

            // Add timeout for hook execution (optional)
            const timeout = setTimeout(() => {
                if (!child.killed) {
                    log.warn(`Hook ${hookType} execution timeout, terminating...`);
                    child.kill();
                }
            }, 30000); // 30 second timeout

            child.on('spawn', () => {
                log.info(`Hook ${hookType} spawned successfully (PID: ${child.pid})`);
                clearTimeout(timeout);
            });

            child.on('error', (error) => {
                log.error(`Hook ${hookType} spawn error:`, error);
                clearTimeout(timeout);
            });

            child.on('exit', (code, signal) => {
                clearTimeout(timeout);
                if (code !== null) {
                    log.info(`Hook ${hookType} exited with code: ${code}`);
                } else if (signal) {
                    log.info(`Hook ${hookType} terminated by signal: ${signal}`);
                }
            });
        } catch (error) {
            log.error(`Failed to spawn hook ${hookType}:`, error);
        }
    }

    /**
     * Parse command line arguments string into array
     */
    private static parseArguments(argsString: string): string[] {
        if (!argsString.trim()) {
            return [];
        }

        // Simple argument parsing - splits on spaces but respects quoted strings
        const args: string[] = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';

        for (let i = 0; i < argsString.length; i++) {
            const char = argsString[i];

            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = '';
            } else if (char === ' ' && !inQuotes) {
                if (current.trim()) {
                    args.push(current.trim());
                    current = '';
                }
            } else {
                current += char;
            }
        }

        if (current.trim()) {
            args.push(current.trim());
        }

        return args;
    }

    /**
     * Capitalize first letter
     */
    private static capitalizeFirst(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Test hook execution (for debugging)
     */
    public static async testHook(hookType: HookType): Promise<boolean> {
        try {
            log.info(`Testing hook: ${hookType}`);
            const hookConfig = await this.getHookConfig(hookType);
            if (!hookConfig.executable) {
                log.info(`No executable configured for hook: ${hookType}`);
                return false;
            }

            if (!fs.existsSync(hookConfig.executable)) {
                log.error(`Hook executable not found: ${hookConfig.executable}`);
                return false;
            }

            log.info(`Hook ${hookType} configuration is valid: ${hookConfig.executable}`);
            log.info(`Hook ${hookType} arguments: ${hookConfig.args}`);

            // Test actual execution
            await this.executeHook(hookType, { test: 'true', source: 'manual_test' });

            return true;
        } catch (error) {
            log.error(`Error testing hook ${hookType}:`, error);
            return false;
        }
    }

    /**
     * Manual test execution for debugging - executes hook immediately
     */
    public static async debugExecuteHook(hookType: HookType): Promise<void> {
        log.info(`=== DEBUG EXECUTION START for ${hookType} ===`);

        try {
            const hookConfig = await this.getHookConfig(hookType);
            log.info(`Hook config retrieved:`, hookConfig);

            if (!hookConfig.executable) {
                log.warn(`No executable configured for hook: ${hookType}`);
                return;
            }

            const exists = fs.existsSync(hookConfig.executable);
            log.info(`Executable exists: ${exists} - Path: ${hookConfig.executable}`);

            if (!exists) {
                log.error(`Hook executable not found: ${hookConfig.executable}`);
                return;
            }

            await this.runHook(hookType, hookConfig, { debug: 'true', timestamp: Date.now() });
            log.info(`=== DEBUG EXECUTION COMPLETED for ${hookType} ===`);
        } catch (error) {
            log.error(`=== DEBUG EXECUTION ERROR for ${hookType} ===`, error);
        }
    }
}

export { HookManager };
