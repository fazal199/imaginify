import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import Header from "../../../../../components/shared/Header";
import TransformationForm from "../../../../../components/shared/TransformationForm";
import { transformationTypes } from "./../../../../../../constants/index";
import { getUserById } from "../../../../../lib/actions/user.action";
import { getImageById } from "../../../../../lib/actions/image.action";
import { SearchParamProps, TransformationTypeK } from "../../../../../types";

const TransformationUpdatePage = async ({ params: { id } }: SearchParamProps) => {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
  const image = await getImageById(id);

  const transformation =
    transformationTypes[image.transformationType as TransformationTypeK];

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subTitle} />

      <section className="mt-10">
        <TransformationForm
          action="Update"
          userId={user._id}
          type={image.transformationType as TransformationTypeK}
          creditBalance={user.creditBalance}
          config={image.config}
          data={image}
        />
      </section>
    </>
  );
};

export default TransformationUpdatePage;