import mongoose from "mongoose";

const valueSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true,
            maxlength: 32
        },
        content: {
            type: String,
        }
    },
    {timestamps: true}
);
export default mongoose.model('CoreValues', valueSchema);