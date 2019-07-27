
export class Provider<T> {

    private consumer: T;

    use(consumer: any) {
        this.consumer = new consumer;
    }

}