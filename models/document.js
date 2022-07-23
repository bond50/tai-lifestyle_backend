
import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema;

const document = new mongoose.Schema(
        {
            title: {
                type: String,
                required: true
            },
            filePath: {
                type: String,
                required: true
            },
            cloudinaryFolder: {
                type: String,
                required: true
            },
            tags: [{type: ObjectId, ref: 'DocumentTag', required: true}],


            publicId: {
                type: String,
                required: true
            },
            fileName: {
                type: String,
                required: true
            },

            fileType: {
                type: String,
                required: true
            },
            fileSize: {
                type: String,
                required: true
            },
            uploadedBy: {
                type: ObjectId,
                ref: 'User'
            },
        },
        {timestamps: true}
    )
;

export default mongoose.model('Document', document);

