import {Sequelize} from 'sequelize-typescript';
import {
    DB_DIALECT,
    DB_HOST, DB_LOGGING,
    DB_NAME,
    DB_PASS,
    DB_POOL,
    DB_POOL_ACQUIRE,
    DB_POOL_IDLE,
    DB_POOL_MAX,
    DB_POOL_MIN,
    DB_PORT,
    DB_STORAGE, DB_SYNC,
    DB_USER
} from "./config";

const configuration = {
    dialect: <any>DB_DIALECT,
    database: DB_NAME,
    username: DB_USER,
    host: DB_HOST,
    port: DB_PORT,
    storage: DB_STORAGE,
};

export async function createStore(models: any[]) {
    const store = new Sequelize({
        ...configuration,
        password: DB_PASS,
        logging: DB_LOGGING,
        models,
        pool: DB_POOL ? {
            max: DB_POOL_MAX,
            min: DB_POOL_MIN,
            idle: DB_POOL_IDLE,
            acquire: DB_POOL_ACQUIRE
        } : undefined
    });

    await store.sync({ force: DB_SYNC });
}

