const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const chatSchema = new mongoose.Schema({
    participant_ids: [ObjectId],
    messages: [
        {
            text: String,
            sender_id: ObjectId,
            date: Date,
        }
    ],
    last_edited: Date
})

module.exports = mongoose.model('Chat', chatSchema);