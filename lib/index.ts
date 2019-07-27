import "reflect-metadata";
import {Service} from "./service";

export class Taff {

    static service(name?: string) {
        return new Service(name);
    }

}

export * from './service';
export * from './debugger';
export * from './config';
export * from './store';

