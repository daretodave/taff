import {debug} from 'debug';

type Logger = (...args: any[]) => any;

export class Debugger {

    private baseLogger;
    private loggers = new Map<string, Logger>();

    constructor(public prefix: string) {
    }

    logger(...label: string[]) {
        const list = label;
        const self = this;
        const path = [this.prefix, ...list].join(":");

        if (!this.loggers.has(path)) {
            this.loggers.set(path, debug(path));
        }

        const logger: Logger = this.loggers.get(path);

        return {
            log(...message: string[]) {
                logger(...message);
                return this;
            },
            logger(...label: string[]) {
                return self.logger(...list, ...label);
            }
        };
    }

    log(label: string, ...message:string[]) {
        return this.logger(label).log(...message);
    }

    print(...message) {
        if (!this.baseLogger) {
            this.baseLogger = debug(this.prefix);
        }
        this.baseLogger(...message);

        return this;
    }

}