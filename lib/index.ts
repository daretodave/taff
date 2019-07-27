import {Service} from "./service";
import {InMemoryStore} from "./core/store/in-memory";

export const Taff = {};

const service = new Service();

service.store.use(InMemoryStore);

