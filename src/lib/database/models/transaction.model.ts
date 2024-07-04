import { Schema, model, models } from "mongoose";

import { Types } from 'mongoose';

export interface Transaction extends Document {
  stripeId: string;
  amount: number;
  plan?: string;
  credits?: number;
  buyer?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

 const TransactionSchema:Schema<Transaction> = new Schema({

  stripeId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  plan: {
    type: String,
  },
  credits: {
    type: Number,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
},{timestamps:true});

export const Transaction = models?.transactions || model("transactions", TransactionSchema);
