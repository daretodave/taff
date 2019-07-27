import {HttpError} from "routing-controllers";

export class ModelValidationError extends HttpError {
    public args: any[];

    constructor(public model: string, public errors: [], args: any[] = []) {
        super(500);

        Object.setPrototypeOf(this, ModelValidationError.prototype);

        this.errors = errors;
        this.args = args; // can be used for internal logging
    }

    toJSON() {
        return {
            response: null,
            status: this.httpCode,
            error: {
                model: this.model,
                type: "HTTP.MODEL-VALIDATION",
                context: this.errors
            }
        }
    }
}