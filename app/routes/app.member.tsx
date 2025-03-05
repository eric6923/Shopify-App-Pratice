import { json, LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Page, Card, DataTable, Button, Text } from "@shopify/polaris";
import prisma from '../db.server';
import { nanoid } from "nanoid";

export const loader: LoaderFunction = async () => {
  const members = await prisma.member.findMany();
  const storeUrl = "cart424.myshopify.com";

  const membersWithReferrals = members.map((member) => ({
    ...member,
    referralUrl: `${storeUrl}/${member.referralCode}`,
  }));

  return json(membersWithReferrals);
};

export default function MembersPage() {
  const members = useLoaderData<typeof loader>();

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
    <Page title="Member Management">
      <div style={{display:"flex", justifyContent:"flex-end",marginBottom:"8px"}}>
      <Link to="/app/create">
        <Button variant="primary">Create Member</Button>
      </Link>
      </div>
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
