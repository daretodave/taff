import {Controller, Get} from "routing-controllers";

@Controller("/")
export class RootController {

    @Get("/")
    index() {
        return {};
    }

}