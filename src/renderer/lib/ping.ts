export const ping = async () => {
    try {
        const started = window.performance.now();
        const http = new XMLHttpRequest();
        await http.open('GET', 'http://cp.cloudflare.com', true);
        http.onreadystatechange = function () {};
        http.onloadend = function (e) {
            const milliseconds = Math.round(window.performance.now() - started);
            console.log(milliseconds);
        };
        http.send();
    } catch (error) {
        return false;
    }
};
