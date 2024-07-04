import mongoose,{ model,Schema } from "mongoose";

export interface ImageSchema extends Document {
    _id? : string,
    title: string;
    transformationType: string;
    publicId: string;
    secureUrl: string;
    width?: number;
    height?: number;
    config?: Record<string, any>;
    transformationUrl: Record<string, any>;
    aspectRatio?: string;
    color?: string;
    prompt?: string;
    author?: {
        _id : string,
        firstName : string,
        lastName : string
    }; 
    createdAt?: Date; // For timestamps
    updatedAt?: Date; // For timestamps
  }
  

const imageSchema:Schema<ImageSchema> = new Schema({
   title : {type : String,require: true},
   transformationType : {type : String,require: true},
   publicId : {type : String,require: true},
   secureUrl : {type : String,require: true},
   width : {type : Number},
   height : {type : Number},
   config : {type : Object},
   transformationUrl : {type : String,require:true},
   aspectRatio : {type : String},
   color : {type : String},
   prompt : {type : String},
   author : {type :Schema.Types.ObjectId,ref : "User"},

},{
    timestamps : true
});


export const Image = mongoose.models?.images || model("images",imageSchema)

