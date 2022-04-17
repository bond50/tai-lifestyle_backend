import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            max: 32,
        },
        companyRole: {
            type: String,
        },
        twitter: {
            type: String,
        },
        address: {
            type: String,
        }, facebook: {
            type: String,
        },
        username: {
            type: String
        },
        linkedIn: {
            type: String
        },
        email: {
            type: String,
            trim: true,
            unique: false,
            lowercase: true,
        },

        instagram: {
            type: String,
        },
        photo: {
            data: Buffer,
            contentType: String,

        },
        photoDimensions: {
            type: Object
        },
        about: {
            type: String,
            required: true,
        }
    },
    {timestamps: true}
)

export default mongoose.model('Team', teamSchema);
