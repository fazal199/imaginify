import React from "react";
import Header from "../../../../../components/shared/Header";
import { transformationTypes } from "../../../../../../constants";
import { SearchParamProps, TransformationTypeK } from "../../../../../types";
import TransformationForm from "../../../../../components/shared/TransformationForm";
import { getUserById } from "../../../../../lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";

const AddTransformationPage = async ({
  params: { type },
}: SearchParamProps) => {
  //this is the clerk id not the database one
  const { userId } = auth();
  // console.log(userId);

  let user;
  if (userId) user = await getUserById(userId);

  const newTitle = transformationTypes[type].title;
  const newSubTitle = transformationTypes[type].subTitle;
  const transformation = transformationTypes[type];

  return (
    <>
      <Header title={newTitle} subtitle={newSubTitle} />
      <section className="mt-10">
        <TransformationForm
          action="Add"
          userId={user._id}
          type={transformation.type as TransformationTypeK}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  );
};

export default AddTransformationPage;
