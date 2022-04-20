import multer from "multer";

import path from "path";

import fs from "fs";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const path = `uploads`
        fs.mkdirSync(path, {recursive: true})
        cb(null, path);
    },
    filename: (req, file, cb) => {


        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});


const IMAGEFORMATS = [
    'image/jpeg',
    'image/png',
    'image/jpg',
]

const docFormats = [
    'application/pdf',
];

let FILE_FORMATS = [...new Set(docFormats)];


const maxSize = 2 * 1024 * 1024; // for 2MB

const imageFeFilter = function (req, file, cb) {
    if (IMAGEFORMATS.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Not supported file type!'), false);
    }
}
const docFilter = function (req, file, cb) {
    if (FILE_FORMATS.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Not supported file type!'), false);
    }
}


const uploadImages = multer({storage, fileFilter: imageFeFilter, limits: {fileSize: maxSize}})
const uploadFiles = multer({storage, docFilter, limits: {fileSize: maxSize}})


export const multipleImagesUploadCtrl = uploadImages.array('files');

export const multipleFilesUploadCtrl = uploadFiles.array('files');

// exports.singleUploadCtrl = upload.single('file');





