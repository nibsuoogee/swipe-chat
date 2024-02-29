import { Schema, Document, model, Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  is_admin: boolean;
  user_name: string;
  email: string;
  password: string;
  images: String[];
  likes: Types.ObjectId[];
  friends: Types.ObjectId[];
  chat_ids: Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
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
})

export default model<IUser>('User', userSchema);