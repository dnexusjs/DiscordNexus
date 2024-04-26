import readline from "readline";

export class ConsoleReader {

    stdin;

    constructor() {
        this.initStdin();
    }

    initStdin() {
        this.stdin = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.stdin.on('line', (input) => {
        });
    }
}