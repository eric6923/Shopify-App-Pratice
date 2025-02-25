import { json } from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import prisma from "../db.server";
import { RewardType } from "@prisma/client";
import {
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Frame,
  Toast,
  Page,
  Icon,
} from "@shopify/polaris";
import { useState, useEffect } from "react";
import { ChevronLeftIcon } from "@shopify/polaris-icons";

export const action = async ({ request }) => {
  const formData = await request.formData();

  const title = formData.get("title")?.toString() ?? "";
  const discount = parseFloat(formData.get("discount")?.toString() ?? "0");
  const discountType = formData.get("discountType")?.toString() ?? "percentage";
  const minOrderAmount = parseFloat(formData.get("minOrderAmount")?.toString() ?? "0");
  const minOrderQuantity = parseFloat(formData.get("minOrderQuantity")?.toString() ?? "0");
  const rewardTypeValue = "FRIEND";

  if (!title || isNaN(discount) || isNaN(minOrderAmount) || isNaN(minOrderQuantity)) {
    return json({ error: "All fields are required" }, { status: 400 });
  }

  try {
    await prisma.reward.create({
      data: { title, discount, discountType, minOrderAmount, minOrderQuantity, rewardType: rewardTypeValue },
    });

    return json({ success: "Reward created successfully" });
  } catch (error) {
    return json({ error: "Database error: " + error.message }, { status: 500 });
  }
};

export default function RewardForm() {
  const actionData = useActionData();
  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [minOrderQuantity, setMinOrderQuantity] = useState("");
  const [toastActive, setToastActive] = useState(false);

  useEffect(() => {
    if (actionData?.success) setToastActive(true);
  }, [actionData]);

  const navigate = useNavigate();

  return (
    <Frame>
      <Page title="Create a Reward">
        <button onClick={() => navigate("/app/referral")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <Icon source={ChevronLeftIcon} tone="base" />
        </button>

        {toastActive && <Toast content="Reward created successfully!" onDismiss={() => setToastActive(false)} />}

        <Card>
          <Form method="post">
            <FormLayout>
              <TextField label="Title" value={title} onChange={setTitle} name="title" autoComplete="off" />

              <FormLayout.Group>
                <TextField 
                  label="Discount Value" 
                  value={discount} 
                  onChange={setDiscount} 
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
                  onChange={setDiscountType}
                  name="discountType"
                />
              </FormLayout.Group>

              <TextField 
                label="Minimum Order Amount" 
                value={minOrderAmount} 
                onChange={setMinOrderAmount} 
                type="number" 
                name="minOrderAmount" 
                autoComplete="off" 
              />

              <TextField 
                label="Minimum Order Quantity" 
                value={minOrderQuantity} 
                onChange={setMinOrderQuantity} 
                type="number" 
                name="minOrderQuantity" 
                autoComplete="off" 
              />

              <Button variant="primary" submit>
                Create Reward
              </Button>
            </FormLayout>
          </Form>
        </Card>
      </Page>
    </Frame>
  );
}
