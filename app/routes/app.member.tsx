import { json, LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import { Page, Card, DataTable, Button, Text, Popover, ActionList, Badge } from "@shopify/polaris";
import prisma from '../db.server';
import { EditIcon, MenuHorizontalIcon} from "@shopify/polaris-icons";
import { useState, useCallback } from "react";

export const loader: LoaderFunction = async () => {
  const members = await prisma.member.findMany();
  const storeUrl = "cart424.myshopify.com";

  const membersWithReferrals = members.map((member) => ({
    ...member,
    referralUrl: `${storeUrl}/${member.referralCode}`,
  }));

  return json(membersWithReferrals);
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const memberId = formData.get("memberId")?.toString();
  const status = formData.get("status")?.toString();

  if (!memberId || !status) {
    return json({ error: "Missing required fields" }, { status: 400 });
  }

  await prisma.member.update({
    where: { id: parseInt(memberId) },
    data: { status },
  });

  return json({ success: true });
};

export default function MembersPage() {
  const members = useLoaderData<typeof loader>() ?? [];
  const fetcher = useFetcher();
  
  const [activePopoverId, setActivePopoverId] = useState<number | null>(null);

  const togglePopover = useCallback((id: number) => {
    setActivePopoverId(activePopoverId === id ? null : id);
  }, [activePopoverId]);

  const handleStatusChange = useCallback((memberId: number, status: string) => {
    const formData = new FormData();
    formData.append("memberId", memberId.toString());
    formData.append("status", status);
    
    fetcher.submit(formData, { method: "post" });
    setActivePopoverId(null);
  }, [fetcher]);

  const renderStatusBadge = (status: string) => {
    let color = "new";
    
    switch (status) {
      case "APPROVED":
        color = "success";
        break;
      case "PENDING":
        color = "warning";
        break;
      case "REJECT":
        color = "critical";
        break;
      case "DISABLE":
        color = "subdued";
        break;
    }
    
    return <Badge status={color}>{status}</Badge>;
  };

  const rows = members.map((member: { 
    id: number; 
    firstName: string | null; 
    lastName: string | null; 
    email: string | null; 
    phoneNumber: string | null; 
    status: string | null;
    referralUrl: string;
  }) => {
    
    const activator = (
      <Button 
        icon={MenuHorizontalIcon} 
        onClick={() => togglePopover(member.id)} 
        size="slim"
      />
    );

    return [
      member.id,
      member.firstName || "-",
      member.lastName || "-",
      member.email || "-",
      member.phoneNumber || "-",
      <a href={member.referralUrl} target="_blank" rel="noopener noreferrer">
        {member.referralUrl}
      </a>,
      renderStatusBadge(member.status || "PENDING"),
      <div style={{ display: "flex", gap: "4px" }}>
        <Link to={`/app/editmember/${member.id}`}>
          <Button icon={EditIcon} size="slim"/>
        </Link>
        <Popover
          active={activePopoverId === member.id}
          activator={activator}
          autofocusTarget="first-node"
          onClose={() => setActivePopoverId(null)}
        >
          <ActionList
            actionRole="menuitem"
            items={[
              {
                content: 'Approve',
                onAction: () => handleStatusChange(member.id, "APPROVED")
              }, 
              {
                content: 'Pending',
                onAction: () => handleStatusChange(member.id, "PENDING")
              },
              {
                content: 'Reject',
                onAction: () => handleStatusChange(member.id, "REJECT")
              },
              {
                content: 'Disable',
                onAction: () => handleStatusChange(member.id, "DISABLE")
              }
            ]}
          />
        </Popover>
      </div>
    ];
  });

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
          columnContentTypes={["numeric", "text", "text", "text", "text", "text", "text", "text"]}
          headings={["ID", "First Name", "Last Name", "Email", "Phone", "Referral Link", "Status", "Actions"]}
          rows={rows}
        />
      </Card>
    </Page>
  );
}