"use client";
import React, { useEffect, useState, useTransition } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { Input } from "../ui/input";
import {
  aspectRatioOptions,
  creditFee,
  defaultValues,
  transformationTypes,
} from "../../../constants";
import { TransformationFormProps, Transformations } from "../../types";
import { CustomField } from "./CustomField";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { AspectRatioKey, debounce, deepMergeObjects } from "../../lib/utils";
import { Button } from "../ui/button";
import { updateCredits } from "../../lib/actions/user.action";

import MediaUploader from "./MediaUploader";
import TransformedImage from "./TransformedImage";
import { getCldImageUrl } from "next-cloudinary";
import { addImage, updateImage } from "../../lib/actions/image.action";
import { useRouter } from "next/navigation";
import { InsufficientCreditsModal } from "./InsufficentModal";

export const formSchema = z.object({
  title: z.string().optional(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
});

const TransformationForm = ({
  data = null,
  action,
  type,
  config = null,
  userId,
  creditBalance
}: TransformationFormProps) => {
  //initial values of the form based on the action
  const initialValues =
    data && action === "Update"
      ? {
          title: data?.title,
          aspectRatio: data?.aspectRatio,
          color: data?.color,
          prompt: data?.prompt,
          publicId: data?.publicId,
        }
      : defaultValues;

  //main form object with zod resolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const router = useRouter();

  //states
  const transformationType = transformationTypes[type];
  const [image, setImage] = useState(data);


  //newTransformation: it tracks what the user wants to change and also the boolean part like fillBackground:true, removeBackgrouond:true etc.
  const [newTransformation, setNewTransformation] =
    useState<Transformations | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isTransforming, setIsTransforming] = useState<boolean>(false);

  //it is being used to trigger the transformations
  const [transformationConfig, setTransformationConfig] = useState(config);
  const [isPending, startTransition] = useTransition();

  //hanlde the aspect ratio change for only generative fill
  const onSelectFieldHandler = (
    value: string,
    onChangeField: (value: string) => void
  ) => {

    const imageSize = aspectRatioOptions[value as AspectRatioKey];

    setImage((prevState: any) => ({
      ...prevState,
      aspectRatio: imageSize.aspectRatio,
      width: imageSize.width,
      height: imageSize.height,
    }));

    //{fillBackground: true}
    setNewTransformation(transformationType.config);

    return onChangeField(value);
  };

  //handling the both input fields
  const onInputChangeHandler = (
    fieldName: string,
    value: string,
    type: string,
    onChangeField: (value: string) => void
  ) => {
    debounce(() => {
      setNewTransformation((prevState: any) => ({
        ...prevState,
        [type]: {
          ...prevState?.[type],
          [fieldName === 'prompt' ? 'prompt' : 'to' ]: value 
        }
      }))
    }, 1000)();
      

    return onChangeField(value);
  };

  //handling the transformation process
  const onTransformHandler = async () => {
    setIsTransforming(true);

    const newObject = deepMergeObjects(newTransformation, transformationConfig);
    
    setTransformationConfig(newObject);

    setNewTransformation(null);

    startTransition(async () => {
      await updateCredits(userId, creditFee);
    });
  };

  //function to handle the submit
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (data || image) {
      setIsSubmitting(true);
      const transformationUrl = getCldImageUrl({
        width: image?.width,
        height: image?.height,
        src: image?.publicId,
        ...transformationConfig,
      });


      const imageData = {
        title: values?.title,
        publicId: image?.publicId,
        transformationType: type,
        width: image?.width,
        height: image?.height,
        config: transformationConfig,
        secureUrl: image?.secureURL,
        transformationURL: transformationUrl,
        aspectRatio: values?.aspectRatio,
        prompt: values?.prompt,
        color: values?.color,
      };

      if (action == "Add") {
        try {
          const newImage = await addImage({
            image: imageData,
            userId,
            path: "/",
          });

          if (newImage) {
            form.reset();
            setImage(data);
            router.push(`/transformations/${newImage._id}`);
          }
        } catch (error) {
          console.log("Something went wrong while adding the image");
          console.log(error.message);
        }
      }

      if (action == "Update") {
        try {
          const updatedImage = await updateImage({
            image: {
              ...imageData,
              _id: data._id,
            },
            userId,
            path: `/transformations/${data._id}`,
          });

          if (updatedImage) {
            router.push(`/transformations/${updatedImage._id}`);
          }
        } catch (error) {
          console.log("Something went wrong while adding the image");
          console.log(error.message);
        }
      }
    }

    setIsSubmitting(false);
  }

  useEffect(() => {

    if(type == "restore" || type == "removeBackground"){
      setNewTransformation(transformationType.config);
    }
  
    
  }, [image,type,transformationType.config]);
  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {
           creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal/>
        }
        <CustomField
          control={form.control}
          name="title"
          formLabel="Image Title"
          className="w-full"
          render={({ field }) => <Input {...field} className="input-field" />}
        />

        {type == "fill" && (
          <CustomField
            render={({ field }) => (
              <Select
                onValueChange={(value) =>
                  onSelectFieldHandler(value, field.onChange)
                }
                value={field.value}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.keys(aspectRatioOptions).map((key) => (
                      <SelectItem key={key} className="select-item" value={key}>
                        {aspectRatioOptions[key as AspectRatioKey].label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            control={form.control}
            name="aspectRatio"
            formLabel="Aspect Ratio"
            className="w-full"
          />
        )}

        {(type == "remove" || type == "recolor") && (
          <div className="prompt-field">
            <CustomField
              control={form.control}
              name="prompt"
              formLabel={
                type == "remove" ? "Object to Remove" : "Object to Recolor"
              }
              render={({ field }) => (
                <Input
                  value={field.value}
                  onChange={(e) =>
                    onInputChangeHandler(
                      "prompt",
                      e.target.value,
                      type,
                      field.onChange
                    )
                  }
                />
              )}
            />

            {type === "recolor" && (
              <CustomField
                control={form.control}
                name="color"
                formLabel={"Replacement Color"}
                render={({ field }) => (
                  <Input
                    value={field.value}
                    onChange={(e) =>
                      onInputChangeHandler(
                        "color",
                        e.target.value,
                        "recolor",
                        field.onChange
                      )
                    }
                  />
                )}
              />
            )}
          </div>
        )}


       <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-3">
          <CustomField
            control={form.control}
            name="publicId"
            className="flex size-full flex-col"
            render={({ field }) => (
              <MediaUploader
                onValueChange={field.onChange}
                setImage={setImage}
                publicId={field.value}
                image={image}
                type={type}
              />
            )}
          />
  
          <TransformedImage
            image={image}
            type={type}
            title={form.getValues().title}
            isTransforming={isTransforming}
            setIsTransforming={setIsTransforming}
            transformationConfig={transformationConfig}
          />
       </div>

        <div className="flex flex-col gap-4">
          <Button
            className="submit-button capitalize"
            type="button"
            disabled={isTransforming || !newTransformation}
            onClick={onTransformHandler}
          >
            {isTransforming ? "Transforming..." : "Apply Transformation"}
          </Button>
        </div>
        <Button
          className="submit-button capitalize"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Save Image"}
        </Button>
      </form>
    </Form>
  );
};

export default TransformationForm;
