import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cors from 'cors';

import router from './router/router.js';
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

mongoose.set({ strictQuery: true });
mongoose
    .connect(process.env.MONGO_DB)
    .then(() => console.log('Mongoose DB connected...'))
    .catch((err) => console.log('DB Error:', err))

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', router);
app.use('/api/upload', express.static('uploads'));
app.use(errorHandler);

const PORT = process.env.PORT || 4001;
app.listen(PORT, (err) => {
    if (err) {
        return console.log(err)
    }
    console.log(`Server has been started on port ${PORT}...`)
});