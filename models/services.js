import mongoose from "mongoose";

const {ObjectId} = mongoose.Schema;

const serviceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            min: 3,
            max: 160,
            required: true
        },
        featured: {
            type: Boolean,
            default: false,
        },
        accepted: {
            type: Boolean,
            default: true,
        },
        slug: {
            type: String,
            unique: true,
            index: true
        },


        body: {
            type: {},
            required: true,
            min: 200,
            max: 2000000
        },
        excerpt: {
            type: String,
            max: 1000
        },
        metaTitle: {
            type: String
        },
        metaDesc: {
            type: String
        },
        photo: {
            data: Buffer,
            contentType: String
        },
        categories: [{type: ObjectId, ref: 'ServiceCategory', required: true}],
        postedBy: {
            type: ObjectId,
            ref: 'User'
        }
    },

    {timestamps: true}
);

export default mongoose.model('Services', serviceSchema);