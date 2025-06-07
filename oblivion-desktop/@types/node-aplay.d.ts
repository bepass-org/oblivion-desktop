declare module 'node-aplay' {
    export default class Aplay {
        constructor(file: string);

        play(): void;

        pause(): void;

        resume(): void;

        stop(): void;

        on(event: 'complete' | 'error', listener: (...args: any[]) => void): this;
    }
}
