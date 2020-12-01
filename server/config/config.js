process.env.PORT = process.env.PORT || 3000;
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
let databaseConnection = process.env.NODE_ENV === 'dev' ?
    'mongodb://root:123@localhost:27017/cafe?authSource=admin' :
    process.env.MONGO_URI;
process.env.URL_DB = 'mongodb+srv://leon:dQAwCzJCRIJsBuGK@cluster0.yiujd.azure.mongodb.net/cafe';
process.env.EXPIRATION_TOKEN = '48h';
process.env.SEED = process.env.SEED || 'este-es-el-sed-desarrollo';
process.env.CLIENT_ID = process.env.CLIENT_ID || '651498225112-h9krfp4igsfmah9sju8mbf60llbrccbu.apps.googleusercontent.com';