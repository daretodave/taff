
export interface Store {

    set(key: string, value: string): Promise<boolean>

}