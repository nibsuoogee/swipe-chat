import { Schema, Document, model, Types } from 'mongoose';

export interface IMessage {
  text: string;
  sender_id: string;
  date: Date;
}

export interface IChat {
  id: string;
  participant_ids: String[];
  messages: IMessage[];
  last_edited: Date;
}

const chatSchema = new Schema<IChat>({
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
})

export default model<IChat>('Chat', chatSchema);