import express from "express";
import cors from "cors";
import bodyParser from 'body-parser'
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import {} from 'dotenv/config'
import serviceRoutes from "./routes/services.js";
import serviceCategoryRoutes from "./routes/serviceCategory.js";
import authRoutes from "./routes/auth.js";
import valueRoutes from "./routes/value.js";
import userRoutes from "./routes/user.js";
import teamRoutes from "./routes/team.js";
import blogRoutes from "./routes/blog.js";
import categoryRoutes from "./routes/category.js";
import tagRoutes from "./routes/tag.js";
import contactRoutes from "./routes/form.js";
import ip from "ip";

import uploadRoute from "./routes/fileUpload.js";

import galleryTagRoutes from "./routes/gallery-tag.js";

import documentTagRoutes from "./routes/document-tag.js";

import { resolve } from 'path';


const app = express()

//db

const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,

}
mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        console.log('database connection established')
    })
    .catch((error) => console.log(error))


//middleware
app.use(morgan('tiny'))
app.use(cookieParser())


app.use(express.json({limit: '200mb'}));
app.use(bodyParser.urlencoded({limit: "200mb", extended: true}));


//cors


// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*')
//     res.header(
//         'Access-Control-Allow-Headers',
//         'Origin,X-Requested-With,Content-Type,Accept,Authorization')
//
//     if (req.method === 'OPTIONS') {
//         res.header('Access-Control-Allow-Methods', 'PUT,PATCH,POST,DELETE,GET')
//         return res.status(200).json({})
//     }
//     next()
// })


const allowedOrigins = ['http://localhost:3000','http://141.95.42.124','https://141.95.42.124', 'https://tailifestyle.com', 'https://www.tailifestyle.com'];
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
        'Access-Control-Allow-Headers',
        'Origin,X-Requested-With,Content-Type,Accept,Authorization')

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT,PATCH,POST,OPTIONS,DELETE,GET')
        return res.status(200).json({})
    }
    next()
})


// port
const port = process.env.PORT || 8000

// route middleware
//  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
 app.use('/uploads',express.static(resolve( 'uploads')));
app.use('/api', serviceRoutes);
app.use('/api', authRoutes);
app.use('/api', serviceCategoryRoutes);
app.use('/api', valueRoutes);
app.use('/api', userRoutes);
app.use('/api', teamRoutes);
app.use('/api', blogRoutes);
app.use('/api', tagRoutes);
app.use('/api', categoryRoutes);
app.use('/api', contactRoutes);
app.use('/api', uploadRoute);
app.use('/api', galleryTagRoutes);
app.use('/api', documentTagRoutes);


process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
    throw err;
});

app.listen(port, `0.0.0.0`, () => {

    setTimeout(() => {
        console.log(`Your backend REST api endpoint is at
           Local:            http://localhost:${port}/api
           On Your Network:  http://${ip.address()}:${port}/api
        `
        )
    }, 1000);


});