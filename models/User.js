const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new mongoose.Schema({
    is_admin: Boolean,
    user_name: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    images: [
        {
            data: Buffer,
            contentType: String
        }
    ],
    chat_ids: [ObjectId]
})

module.exports = mongoose.model('User', userSchema);