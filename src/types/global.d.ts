export {};

declare global {
    interface Window {
        platformAPI: {
            getPlatform: () => string;
        };
    }
}
