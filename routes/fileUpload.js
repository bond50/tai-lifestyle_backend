import {
    fileRetrieveFromCloud, galleryCreate,
    getAllMultipleFiles,
    getDownloads,
    getGallery,
    multipleFileUpload
} from "../controllers/fileUpload.js";

import express from "express";

import {adminMiddleware, authMiddleware, requireSignin} from "../controllers/auth.js";

import {multipleFilesUploadCtrl, multipleImagesUploadCtrl} from "../helpers/multer.js";


const router = express.Router();

router.post('/files-upload', requireSignin, adminMiddleware, multipleFilesUploadCtrl, multipleFileUpload);
router.post('/gallery-create', requireSignin, adminMiddleware, multipleImagesUploadCtrl, galleryCreate);
router.post('/files-retrieve-from-cloud', fileRetrieveFromCloud);
router.post('/get-all-multiple-files', getAllMultipleFiles);
router.get('/get-downloads', getDownloads);
router.get('/get-gallery', getGallery);

//user routes
router.post('/user/files-upload', requireSignin, authMiddleware, multipleFilesUploadCtrl, multipleFileUpload);
router.post('/user/gallery-create', requireSignin, authMiddleware, multipleImagesUploadCtrl, galleryCreate);


export default router;
