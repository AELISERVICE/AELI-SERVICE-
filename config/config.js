require('dotenv').config();

const useSsl = process.env.DB_SSL !== 'false';

const shared = {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    seederStorage: 'sequelize',
    migrationStorageTableName: 'SequelizeMeta'
};

module.exports = {
    development: {
        ...shared
    },
    test: {
        ...shared,
        database: process.env.DB_NAME_TEST || `${process.env.DB_NAME}_test`
    },
    production: {
        ...shared,
        dialectOptions: useSsl
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {}
    }
};
