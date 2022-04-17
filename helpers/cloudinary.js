import cloudinary from "cloudinary";

require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.cloudinaryUpload = (file, folder) => {
    return new Promise(resolve => {
        cloudinary.uploader.upload(file, (result) => {
            console.log(result)

            resolve({
                filePath: result.secure_url,
                cloudinary_id: result.public_id,
                tags: result.tags,
                publicId: result.public_id,
                createdAt: result.created_at,
                width: result.width,
                height: result.height,
            })
        }, {
            resource_type: "auto",
            folder: folder,
        })
    })
}


exports.cloudinaryRetrieve = (folder) => cloudinary.v2.search
    .expression(`folder:${folder}`)
    .sort_by('public_id', 'desc')
    .with_field('tags')
    .execute()