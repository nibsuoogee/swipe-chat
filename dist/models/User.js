import { Schema, model, Types } from 'mongoose';
const userSchema = new Schema({
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
    likes: [{ type: Types.ObjectId }],
    friends: [{ type: Types.ObjectId }],
    chat_ids: [{ type: Types.ObjectId }]
});
export default model('User', userSchema);
