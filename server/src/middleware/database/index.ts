import mongoose from 'mongoose';

import { PARAM_DATABASE_URL } from '../../parameters';
import { LogMe } from '../../serverLibrary';


export default async function ConnectDB() {
    const dbconnectionoptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 60000,
        keepAlive: true, 
        keepAliveInitialDelay: 300000 
    };
    
    mongoose.set('strictQuery', false);


    let connectioninit = mongoose.connection;
    if(!PARAM_DATABASE_URL) return LogMe("Please provide a mongoDB URL in PARAM_DATABASE_URL parameter of parameters.ts");
    await mongoose.connect(PARAM_DATABASE_URL, dbconnectionoptions);
}
