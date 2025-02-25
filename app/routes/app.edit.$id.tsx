import { useLoaderData, useNavigate, Form } from "@remix-run/react";
import { json, LoaderFunctionArgs, ActionFunctionArgs, redirect } from "@remix-run/node";
import prisma from "../db.server";
import { Page, TextField, Button, BlockStack, Autocomplete, Select, InlineStack, FormLayout } from "@shopify/polaris";
import { useEffect, useState } from "react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  if (!params.id) throw new Response("ID is required", { status: 400 });

  const reward = await prisma.reward.findUnique({
    where: { id: Number(params.id) },
  });

  if (!reward) throw new Response("Not Found", { status: 404 });

  return json({ reward });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  if (!params.id) return json({ error: "Missing ID" }, { status: 400 });

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const discount = Number(formData.get("discount"));
  const discountType = formData.get("discountType") as string;
  const minimumOrderAmount = Number(formData.get("minimumOrderAmount"));
  const minimumOrderQuantity = Number(formData.get("minimumOrderQuantity"));
  await prisma.reward.update({
    where: { id: Number(params.id) },
    data: { title, discount,discountType,minOrderQuantity:minimumOrderQuantity,minOrderAmount:minimumOrderAmount},
  });

  return redirect("/app/referral");
};

const EditRewardPage = () => {
  const { reward } = useLoaderData<typeof loader>();
  const[editvalue,seteditvalue] = useState(reward?.title);
  const [discount,setdiscount] = useState(reward?.discount);
  const [minorder,setminorder] = useState(reward?.minOrderAmount)
  const [minorderquantity, setminorderquantity] = useState(reward?.minOrderQuantity);
  const [select,setselect] = useState(reward.rewardType)
  const [discountType,setDiscountType] = useState(reward?.discountType||"fixed")

  const navigate = useNavigate();

  useEffect(() => {
    seteditvalue(reward?.title || "");
    setdiscount(reward?.discount || 0);
    setminorder(reward?.minOrderAmount || 0);
    setminorderquantity(reward?.minOrderQuantity || 0);
    setselect(reward?.rewardType || "FRIEND");
    setDiscountType(reward?.discountType || "fixed");
  }, [reward]); 


  return (
    <Page title="Edit Reward">
      <Form method="post">
      <input type="hidden" name="discountType" value={discountType} />
        <BlockStack gap="400">
          <TextField label="Title" name="title" value={editvalue} onChange={(editvalue)=>seteditvalue(editvalue)} autoComplete="off" />
          <FormLayout.Group>
                          <TextField 
                            label="Discount Value" 
                            value={discount} 
                            onChange={setdiscount} 
                            type="number" 
                            name="discount" 
                            autoComplete="off" 
                          />
                          <Select
  label="Discount Type"
  options={[
    { label: "Percentage (%)", value: "percentage" },
    { label: "Fixed Value ($)", value: "fixed" },
  ]}
  value={discountType}
  onChange={(value) => setDiscountType(value)} // Ensure the function receives and updates the state correctly
  name="discountType"
/>

                        </FormLayout.Group>
          <TextField label="Minimum Order Amount" name="minimumOrderAmount" value={minorder} onChange={(minorder)=>setminorder(Number(minorder))} autoComplete="off"/>
          <TextField label="Minimun Order Quantity" name="minimumOrderQuantity" value={minorderquantity} onChange={(minorderquantity)=>setminorderquantity(Number(minorderquantity))} autoComplete="off"/>
          <Select label="Reward Type" options={[
            {label:"Friend",value:"FRIEND"},
            {label:"Referrer",value:"REFERRER"}
        ]} value={select}
           onChange={(select)=>setselect(select)} 
        />
       
       <InlineStack gap="400">
  <Button variant="primary" submit>
    Save
  </Button>
  <Button variant="secondary" onClick={() => navigate("/app/referral")}>
    Cancel
  </Button>
</InlineStack>
         
        </BlockStack>
      </Form>
    </Page>
  );
};

export default EditRewardPage;
