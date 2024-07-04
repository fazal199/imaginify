import mongoose, { Schema, model } from "mongoose";

export interface UserSchema extends Document {
  _id: string;
  clerkId : string,
  email : string,
  username : string,
  photo : string,
  planId : string,
  firstName: string,
  lastName: string,
  creditBalance: number
}

const userSchema:Schema<UserSchema> = new Schema({
  clerkId: { type: String, require: true, unique: true },
  email: {
    type: String,
    require: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    require: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  photo: { type: String, require: true },
  planId: { type: String, require: true },

  firstName: {
    type: String,
  },
  lastName: { type: String },
  creditBalance: { type: Number, default: 10 },
},{
  timestamps: true
});

export const User = mongoose.models?.users || model("users", userSchema);
