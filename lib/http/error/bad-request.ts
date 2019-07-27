import {HttpError} from "routing-controllers";

export class BadRequestError extends HttpError {
    public args: any[];

    constructor(public error, public status: number = 400, args: any[] = []) {
        super(status);

        Object.setPrototypeOf(this, BadRequestError.prototype);

        this.args = args; // can be used for internal logging
    }

    toJSON() {
        return {
            response: null,
            status: this.httpCode,
            error: {
                type: "HTTP.BAD-REQUEST",
                context: this.error
            }
        }
    }
}