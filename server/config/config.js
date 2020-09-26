process.env.PORT = process.env.PORT || 3000;

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

let databaseConnection = process.env.NODE_ENV === 'dev' ?
    'mongodb://root:123@localhost:27017/cafe?authSource=admin' :
    'mongodb+srv://leon:dQAwCzJCRIJsBuGK@cluster0.yiujd.azure.mongodb.net/cafe';

process.env.URL_DB = databaseConnection;