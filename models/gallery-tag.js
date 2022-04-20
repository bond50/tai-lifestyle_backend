import mongoose from "mongoose";

const galSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32

        },
        slug: {
            type: String,
            unique: true,
            index: true
        }
    },
    {timestamps: true}
);


export default mongoose.model('GalleryTag', galSchema);

