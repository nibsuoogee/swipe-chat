import { Schema, model, Types } from 'mongoose';
const chatSchema = new Schema({
    participant_ids: [Types.ObjectId],
    messages: [
        {
            text: String,
            sender_id: Types.ObjectId,
            date: Date,
        }
    ],
    last_edited: Date
});
export default model('Chat', chatSchema);
