import {Middleware, ExpressErrorMiddlewareInterface, KoaMiddlewareInterface} from "routing-controllers";
import {logger} from "../logger";
import {Context} from "koa";

const HttpStatus = require('http-status-codes');

@Middleware({type: "before"})
export class RootErrorHandler implements KoaMiddlewareInterface {

    async use(context: Context, next: (err?: any) => Promise<any>): Promise<any> {
        let status = 200;

        try {
            await next();

            status = context.response.status;
        } catch (e) {
            logger.error(e);

            status = 500;

            if (e.hasOwnProperty("status")) {
                status = Number(e["status"]);
            }
            if (e.hasOwnProperty("httpCode")) {
                status = Number(e["httpCode"]);
            }

            if (e.hasOwnProperty("error")) {
                context.response.body = e;
            } else {
                context.response.body = {
                    error: e.message || e,
                    status
                };
            }

        }

        const error = status < 400 ? null : HttpStatus.getStatusText(status);
        const response = status >= 400 ? null : HttpStatus.getStatusText(status);

        if (!context.response.body) {
            context.response.body = {
                status,
                error,
                response
            }

        } else {
            if (!context.response.body.hasOwnProperty("error")) {
                context.response.body.error = error;
            }
            if (!context.response.body.hasOwnProperty("response")) {
                context.response.body.response = response;
            }
            if (!context.response.body.hasOwnProperty("status")) {
                context.response.body.status = status;
            }
        }

        context.response.status = status;
    }

}
