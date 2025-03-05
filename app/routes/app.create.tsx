import { ActionFunction, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import { Page, Card, TextField, Button, Text } from "@shopify/polaris";
import { useState } from "react";
import prisma from '../db.server';
import { nanoid } from "nanoid";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  console.log("Received FormData:", Object.fromEntries(formData));

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phoneNumber = formData.get("phoneNumber") as string;

  if (!email || !phoneNumber) {
    return { error: "Email and phone number are required" };
  }

  const referralCode = nanoid(10);

  await prisma.member.create({
    data: { firstName, lastName, email, phoneNumber, referralCode },
  });

  return redirect("/app/member");
};

export default function NewMemberPage() {
  const actionData = useActionData();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Page title="Create Member">
      <Card sectioned>
        <Text as="p" variant="headingMd">New Member Form</Text>
        {actionData?.error && <Text color="critical">{actionData.error}</Text>}
        <Form method="post">
          <TextField label="First Name" name="firstName" value={formValues.firstName} onChange={(v) => handleChange("firstName", v)} autoComplete="given-name" />
          <TextField label="Last Name" name="lastName" value={formValues.lastName} onChange={(v) => handleChange("lastName", v)} autoComplete="family-name" />
          <TextField label="Email" type="email" name="email" value={formValues.email} onChange={(v) => handleChange("email", v)} autoComplete="email" />
          <TextField label="Phone Number" name="phoneNumber" value={formValues.phoneNumber} onChange={(v) => handleChange("phoneNumber", v)} autoComplete="tel" />
          <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
            <Button submit variant="primary">Create</Button>
            <Button onClick={() => navigate("/app/member")} variant="secondary">Cancel</Button>
          </div>
        </Form>
      </Card>
    </Page>
  );
}
