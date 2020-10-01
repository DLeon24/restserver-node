process.env.PORT = process.env.PORT || 3000;
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
let databaseConnection = process.env.NODE_ENV === 'dev' ?
    'mongodb://root:123@localhost:27017/cafe?authSource=admin' :
    process.env.MONGO_URI;
process.env.URL_DB = databaseConnection;
process.env.EXPIRATION_TOKEN = 60 * 60 * 24 * 30;
process.env.SEED = process.env.SEED || 'este-es-el-sed-desarrollo';