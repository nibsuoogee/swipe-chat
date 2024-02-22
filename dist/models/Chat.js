import { Schema, model } from 'mongoose';
const chatSchema = new Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    participant_ids: [String],
    messages: [
        {
            text: String,
            sender_id: String,
            date: Date,
        }
    ],
    last_edited: Date
});
export default model('Chat', chatSchema);
