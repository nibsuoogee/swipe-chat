import { Schema, Document, model, Types } from 'mongoose';

export interface IMessage {
  text: string;
  sender_id: Types.ObjectId;
  date: Date;
}

export interface IChat {
  _id: Types.ObjectId;
  participant_ids: Types.ObjectId[];
  messages: IMessage[];
  last_edited: Date;
}

const chatSchema = new Schema<IChat>({
  participant_ids: [Types.ObjectId],
  messages: [
    {
      text: String,
      sender_id: Types.ObjectId,
      date: Date,
    }
  ],
  last_edited: Date
})

export default model<IChat>('Chat', chatSchema);