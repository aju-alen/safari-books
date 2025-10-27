import express from 'express';
import bodyParser from 'body-parser';
import authRoute from './routes/auth-route.js';
import s3Route from './routes/s3-route.js';
import publisherRoute from './routes/publisher-route.js';
import adminRoute from './routes/admin-route.js';
import listenerRoute from './routes/listener-route.js';
import libraryRoute from './routes/library-route.js';
import cors from 'cors';
import { startNotificationCron } from './utils/cronJob.js';

const app = express();
app.use(cors({
    origin: [
        "exp://10.65.1.122:8081",
        "http://localhost:8081",
        "http://localhost:19000",
        "http://10.65.1.122:19006",
        "http://localhost:5173",
    ],
})); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



app.use('/api/auth', authRoute);
app.use('/api/s3',s3Route);
app.use('/api/publisher',publisherRoute);
app.use('/api/admin',adminRoute);
app.use('/api/listeners',listenerRoute)
app.use('/api/library',libraryRoute)

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    startNotificationCron();
});