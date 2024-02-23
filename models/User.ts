import { Schema, Document, model, Types } from 'mongoose';

export interface IUser {
  id: string;
  is_admin: boolean;
  user_name: string;
  email: string;
  password: string;
  images: String[];
  likes: String[];
  friends: String[];
  chat_ids: String[];
}

const userSchema = new Schema<IUser>({
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
})

export default model<IUser>('User', userSchema);