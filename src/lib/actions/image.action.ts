"use server";

import { revalidatePath } from "next/cache";
import { AddImageParams } from "../../types";
import { connectDb } from "../database/dbConfig";
import { handleError } from "../utils";
import { User } from "../database/models/user.model";
import { Image } from "../database/models/image.model";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";

const populateUser = (query: any) =>
  query.populate({
    path: "author",
    model: User,
    select: "_id firstName lastName clerkId",
  });

//Add Image
export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    await connectDb();

    console.log(image);
    
    const author = await User.findById(userId);

    if (!author) throw new Error("User not found");

    const newImage = await Image.create({
      ...image,
      author: author._id,
    });
    revalidatePath(path);

    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    handleError(error);
  }
}

//Update Image

export async function updateImage({ image, userId, path }: AddImageParams) {
  try {
    await connectDb();
    console.log(image);
    
    const imageToUpdate = await Image.findById(image.publicId);

    if (!imageToUpdate) throw new Error("Image was not found!");

    const updatedImage = await Image.findByIdAndUpdate(
      imageToUpdate._id,
      image,
      { new: true }
    );
    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    handleError(error);
  }
}

//Delete Image
export async function deleteImage(imageId: string) {
  try {
    await connectDb();
    const ImageExist = await Image.findById({ _id: imageId });

    if (!ImageExist) throw new Error("Image Doesn't Exist!");

    const deletedImage = await Image.findByIdAndDelete(ImageExist._id);

    return JSON.parse(JSON.stringify(deleteImage));
  } catch (error) {
    handleError(error);
  } finally {
    redirect("/");
  }
}

//get a single image
export async function getImageById(imageId: string) {
  try {
    await connectDb();
    const image = await populateUser(Image.findById(imageId));

    if (!image) throw new Error("Image not Found");

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error);
  }
}
export async function getAllImages({ limit = 9, page = 1, searchQuery = '' }: {
  limit?: number;
  page: number;
  searchQuery?: string;
}) {
  try {
    await connectDb();

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })

    let expression = 'folder=imaginify';

    if (searchQuery) {
      expression += ` AND ${searchQuery}`
    }

    const { resources } = await cloudinary.search
      .expression(expression)
      .execute();

      
    const resourceIds = resources.map((resource: any) => resource.public_id);
    
    
    let query = {};

    //resouces id aarahi hai search karne par but database se data nhi aarah hai

    if(searchQuery) {
      query = {
        publicId: {
          $in: resourceIds
        }
      }
    }

    const skipAmount = (Number(page) -1) * limit;

    const images = await populateUser(Image.find(query))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find(query).countDocuments();
    const savedImages = await Image.find().countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    }
  } catch (error) {
    handleError(error)
  }
}

export async function getUserImages({
  limit = 9,
  page = 1,
  userId,
}: {
  limit?: number;
  page: number;
  userId: string;
}) {
  try {
    await connectDb();

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find({ author: userId }))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find({ author: userId }).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

