import {Provider} from "../core/provider";
import {Store} from "./model/store";

export class Service {

    public store: Provider<Store> = new Provider<Store>();


}