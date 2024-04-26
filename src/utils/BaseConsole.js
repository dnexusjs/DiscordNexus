export class BaseConsole {

    info(text) {
        this.log("INFO", text);
    }

    error(text) {
        this.log("ERROR", text);
    }

    log(type, text) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        console.log(`[${hours}:${minutes}:${seconds}] [${type}]: ${text}`);
    }
}