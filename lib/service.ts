import {Server} from "net";
import {Debugger} from "./debugger";
import {createStore} from "./store";
import {join} from "path";
import {createKoaServer} from "routing-controllers";
import {HOST, PORT} from "./config";
import {out} from "./logger";
import {ModelValidationError} from "./http/error/model-validation";
import {validate} from "class-validator";

const {path} = require('app-root-path');

export class Service {

    private providers = new Map<Provider, Array<any>>();
    private debug: Debugger;
    private app: Server;

    constructor(public name?: string) {
        this.debug = new Debugger(name ? `taff:${name}` : 'taff:service');

        this.provide(Provider.ROUTING_CONTROLLER, findLocal("control"), find("control"));
        this.provide(Provider.ROUTING_MIDDLEWARE, findLocal("middleware"), find("middleware"));
        this.provide(Provider.ROUTING_INTERCEPTOR, findLocal("interceptor"), find("interceptor"));
    }

    provide(key: Provider, ...value) {
        if (!this.providers.has(key)) {
            this.providers.set(key, []);
        }

        this.providers.get(key).push(...value);

        return this;
    }

    enableLogger() {
        process.env.DEBUG = process.env.DEBUG + ",taff*" || "taff*";

        return this;
    }

    remove(key: Provider) {
        this.providers.set(key, []);

        return this;
    }

    private get(key: Provider, provideElse = null) {
        if (!this.providers.has(key)) {
            return provideElse || [];
        }

        return this.providers.get(key);
    }

    run() {
        this.start().catch(error => {
            out("ERROR service::run", error);
        });

        return this;
    }

    async start(port: number = PORT, host: string = HOST) {
        const {log} = this.debug.logger("service::run");

        log();
        log("store loading");

        await createStore(this.get(Provider.STORE_MODEL));

        log("store loaded");

        const [authorizationChecker] = this.get(Provider.AUTH_GUARD);
        const [currentUserChecker] = this.get(Provider.AUTH_USER);

        const middlewares = this.get(Provider.ROUTING_MIDDLEWARE);
        const controllers = this.get(Provider.ROUTING_CONTROLLER);
        const interceptors = this.get(Provider.ROUTING_INTERCEPTOR);

        log("server loading");

        log(`server host = ${host}`);
        log(`server port = ${port}`);

        log(`server router.middlewares.length  = ${middlewares.length}`);
        log(`server router.controllers.length  = ${controllers.length}`);
        log(`server router.interceptors.length = ${interceptors.length}`);

        const routerLog = (key, list) => log(`server router.${key}: \n\t${list.join("\n\t-")}`);

        routerLog("middlewares", middlewares);
        routerLog("controllers", controllers);
        routerLog("interceptors", interceptors);

        this.app = createKoaServer({
            defaultErrorHandler: false,
            controllers,
            middlewares,
            interceptors,
            authorizationChecker,
            currentUserChecker
        });

        log("server loaded");

        await onFinish(callback => this.app.listen(port, host, callback));

        log(`server @ ${host} listening on port ${port}`);
    }

    static async verify(model) {
        const errors: any = await validate(model);
        if (errors && errors.length) {
            throw new ModelValidationError(
                model.constructor.name,
                errors
            );
        }
    };

    static reply(value, status = 200, error = null) {
        return {
            response: value,
            status,
            error
        }
    };

    static error(message, status = 400) {
        return {
            response: null,
            status,
            error: message
        }
    };

}

export enum Provider {
    STORE_MODEL,
    AUTH_GUARD,
    AUTH_USER,
    ROUTING_CONTROLLER,
    ROUTING_MIDDLEWARE,
    ROUTING_INTERCEPTOR
}

export function find(folder, parts: string[] = ["**", "*.js"]) {
    return join(path, "out", folder, ...parts);
}

function findLocal(folder, parts: string[] = ["**", "*.js"]) {
    return join(__dirname, folder, ...parts);
}

function onFinish(action) {
    return new Promise((resolve, reject) => {
        try {
            action((error, ...args) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(args);
            });
        } catch (e) {
            reject(e);
        }
    });

}