import Document from "../models/document.js";

import Gallery from "../models/gallery.js";

import fs from "fs";

import {cloudinaryRetrieve, cloudinaryUpload} from "../helpers/cloudinary.js";

import {errorHandler} from "../helpers/dbErrorHandler.js";

import {fileSizeFormatter} from "../helpers/fileSizeFormatter.js";


export const multipleFileUpload = async (req, res) => {
    const files = req.files;
    const {title} = req.body;
    const {folder} = req.body
    const {tags} = req.body

    if (!title || !title.length) {
        return res.status(400).json({
            error: "File name/title is required",
        });
    }

    if (!folder || !folder.length) {
        return res.status(400).json({
            error: "Folder must be provided",
        });
    }

    if (files.length <= 0) {
        return res.status(400).json({
            error: "Select at least one file",
        });
    }
    if (!tags || tags.length === 0) {
        return res.status(400).json({
            error: 'At least one tag is required'
        });
    }

    let arrayOfTags = tags && tags.split(',');
    files.map(async file => {
        const {path, originalname, mimetype, size} = file;
        const result = await cloudinaryUpload(path, folder);
        let doc = new Document()
        doc.filePath = result.filePath
        doc.title = title
        doc.cloudinaryFolder = folder
        doc.publicId = result.publicId
        doc.fileName = originalname
        doc.fileType = mimetype
        doc.fileSize = fileSizeFormatter(size, 2)
        doc.createdAt = result.createdAt
        doc.uploadedBy = req.auth._id
        await doc.save(async (err, doc) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            await Document.findByIdAndUpdate(doc._id, {$push: {tags: arrayOfTags}}, {new: true}).exec(
                (err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });

                    } else
                        res.json({
                            data: result,
                            message: `Files Uploaded to ${folder} directory in cloudinary servers`,
                        });
                }
            );

        })
        await fs.rm('uploads', {recursive: true});
    })
}


export const getAllMultipleFiles = async (req, res) => {

    try {
        const files = await Gallery.find();
        res.status(200).send({data: files});

    } catch (error) {
        res.status(400).send(error.message);
    }
}

export const getDownloads = async (req, res) => {

    try {
        const files = await Document
            .find({cloudinaryFolder: 'documents'})
            .sort({createdAt: -1});
        res.status(200).send(files);

    } catch (error) {
        res.status(400).send(error.message);
    }
}

export const getGallery = async (req, res) => {
    Gallery.find({})
        .sort({createdAt: -1})
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }

            res.json(data);
        });
}


export const fileRetrieveFromCloud = async (req, res) => {
    let folder = 'gallery'
    if (req.body.folder) {
        folder = req.body.folder
    }

    try {
        const {resources} = await cloudinaryRetrieve(folder);
        res.send(resources);
    } catch (e) {
        return res.status(422).send({message: e.message});
    }
};


export const galleryCreate = async (req, res,) => {
    const files = req.files;
    const {title} = req.body;
    const {folder} = req.body
    const {tags} = req.body

    if (!title || !title.length) {
        return res.status(400).json({
            error: "File name/title is required",
        });
    }

    if (!folder || !folder.length) {
        return res.status(400).json({
            error: "Folder must be provided",
        });
    }

    if (files.length <= 0) {
        return res.status(400).json({
            error: "Select at least one file",
        });
    }
    if (!tags || tags.length === 0) {
        return res.status(400).json({
            error: 'At least one tag is required'
        });
    }


    let arrayOfTags = tags && tags.split(',');
    files.map(async file => {
        const {path, originalname, mimetype, size} = file;
        const result = await cloudinaryUpload(path, folder);
        let gallery = new Gallery()
        gallery.filePath = result.filePath
        gallery.title = title
        gallery.cloudinaryFolder = folder
        gallery.publicId = result.publicId
        gallery.fileName = originalname
        gallery.width = result.width
        gallery.height = result.height
        gallery.fileType = mimetype
        gallery.fileSize = fileSizeFormatter(size, 2)
        gallery.createdAt = result.createdAt
        gallery.uploadedBy = req.auth._id
        await gallery.save(async (err, doc) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            await Gallery.findByIdAndUpdate(doc._id, {$push: {tags: arrayOfTags}}, {new: true}).exec(
                (err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });

                    } else
                        res.json({
                            data: result,
                            message: `Files Uploaded to ${folder} directory in cloudinary servers`,
                        });
                }
            );

        })

    })

}