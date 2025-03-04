import { json, LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { Page, Card, DataTable, TextField, Button, Text } from "@shopify/polaris";
import prisma from '../db.server'
import { nanoid } from "nanoid";
import { useState } from "react";



export const loader: LoaderFunction = async () => {
  const members = await prisma.member.findMany();
  const storeUrl = "cart424.myshopify.com";

  const membersWithReferrals = members.map((member: { referralCode: any; }) => ({
    ...member,
    referralUrl: `${storeUrl}/${member.referralCode}`,
  }));

  return json(membersWithReferrals);
};


export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  console.log("Recieved FormData:", Object.fromEntries(formData))

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phoneNumber = formData.get("phoneNumber") as string;

  if (!email || !phoneNumber) {
    return json({ error: "Email and phone number are required" }, { status: 400 });
  }

  const referralCode = nanoid(10); 

  await prisma.member.create({
    data: { firstName, lastName, email, phoneNumber, referralCode },
  });

  return redirect("/member");
};

export default function MembersPage() {
  const members = useLoaderData<typeof loader>();
  const actionData = useActionData();
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const rows = members.map((member: { id: any; firstName: any; lastName: any; email: any; phoneNumber: any; referralUrl: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined; }) => [
    member.id,
    member.firstName || "-",
    member.lastName || "-",
    member.email,
    member.phoneNumber,
    <a href={member.referralUrl} target="_blank" rel="noopener noreferrer">
      {member.referralUrl}
    </a>,
  ]);
  

  return (
    <Page title="Member Creation Page">
      <Card sectioned>
        <div style={{marginBottom:"10px"}}>
        <Text as="p" variant="headingMd">Create Member</Text>
        </div>
        {actionData?.error && <Text color="critical">{actionData.error}</Text>}
        <Form method="post">
          <TextField label="First Name" name="firstName" value={formValues.firstName} onChange={(v) => handleChange("firstName", v)} autoComplete="given-name" />
          <TextField label="Last Name" name="lastName" value={formValues.lastName} onChange={(v) => handleChange("lastName", v)} autoComplete="family-name" />
          <TextField label="Email" type="email" name="email" value={formValues.email} onChange={(v) => handleChange("email", v)}  autoComplete="email" />
          <TextField label="Phone Number" name="phoneNumber" value={formValues.phoneNumber} onChange={(v) => handleChange("phoneNumber", v)} autoComplete="tel" />
          <div style={{marginTop:"16px"}}>
          <Button submit variant="primary">Create Member</Button>
          </div>
        </Form>
      </Card>
      <Card>
        <Text as="p" variant="headingMd">Referral Members</Text>
        <DataTable
          columnContentTypes={["numeric", "text", "text", "text", "text", "text"]}
          headings={["ID", "First Name", "Last Name", "Email", "Phone", "Referral Link"]}
          rows={rows}
        />
      </Card>
    </Page>
  );
}