import { Schema, model } from 'mongoose';
const userSchema = new Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
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
    images: [{ type: String }],
    likes: [{ type: String, ref: 'User' }],
    friends: [{ type: String, ref: 'User' }],
    chat_ids: [{ type: String, ref: 'Chat' }]
});
export default model('User', userSchema);
