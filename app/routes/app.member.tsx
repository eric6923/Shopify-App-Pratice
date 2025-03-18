import {
  json,
  LoaderFunction,
  ActionFunction,
  redirect,
} from "@remix-run/node";
import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import {
  Page,
  Card,
  DataTable,
  Button,
  Text,
  Popover,
  ActionList,
  Badge,
  Modal,
} from "@shopify/polaris";
import prisma from "../db.server";
import { EditIcon, MenuHorizontalIcon, DeleteIcon } from "@shopify/polaris-icons";
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
  const action = formData.get("action")?.toString();
  const memberId = formData.get("memberId")?.toString();

  if (!memberId) {
    return json({ error: "Missing member ID" }, { status: 400 });
  }

  if (action === "updateStatus") {
    const status = formData.get("status")?.toString();
    
    if (!status) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    await prisma.member.update({
      where: { id: parseInt(memberId) },
      data: { status },
    });

    return json({ success: true, message: "Status updated successfully" });
  } 
  else if (action === "deleteMember") {
    try {
      await prisma.member.delete({
        where: { id: parseInt(memberId) },
      });
      return json({ success: true, message: "Member deleted successfully" });
    } catch (error) {
      return json({ error: "Failed to delete member" }, { status: 500 });
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
};

export default function MembersPage() {
  const members = useLoaderData<typeof loader>() ?? [];
  const fetcher = useFetcher();

  const [activePopoverId, setActivePopoverId] = useState<number | null>(null);
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);

  const togglePopover = useCallback(
    (id: number) => {
      setActivePopoverId(activePopoverId === id ? null : id);
    },
    [activePopoverId],
  );

  const handleStatusChange = useCallback(
    (memberId: number, status: string) => {
      const formData = new FormData();
      formData.append("action", "updateStatus");
      formData.append("memberId", memberId.toString());
      formData.append("status", status);

      fetcher.submit(formData, { method: "post" });
      setActivePopoverId(null);
    },
    [fetcher],
  );

  const handleDeleteClick = useCallback((memberId: number) => {
    setMemberToDelete(memberId);
    setDeleteModalActive(true);
    setActivePopoverId(null);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (memberToDelete) {
      const formData = new FormData();
      formData.append("action", "deleteMember");
      formData.append("memberId", memberToDelete.toString());

      fetcher.submit(formData, { method: "post" });
      setDeleteModalActive(false);
      setMemberToDelete(null);
    }
  }, [memberToDelete, fetcher]);

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

  const rows = members.map(
    (member: {
      referralCode: any;
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
      const storeUrl = "cart424.myshopify.com";
      return [
        member.id,
        member.firstName || "-",
        member.lastName || "-",
        member.email || "-",
        member.phoneNumber || "-",
        <a
          href={`https://${storeUrl}/?referralCode=${member.referralCode}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {`${storeUrl}/${member.referralCode}`}
        </a>,

        renderStatusBadge(member.status || "PENDING"),
        <div style={{ display: "flex", gap: "4px" }}>
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
                  content: "Approve",
                  onAction: () => handleStatusChange(member.id, "APPROVED"),
                },
                {
                  content: "Pending",
                  onAction: () => handleStatusChange(member.id, "PENDING"),
                },
                {
                  content: "Reject",
                  onAction: () => handleStatusChange(member.id, "REJECT"),
                },
                {
                  content: "Disable",
                  onAction: () => handleStatusChange(member.id, "DISABLE"),
                },
              ]}
            />
          </Popover>
          <Link to={`/app/editmember/${member.id}`}>
            <Button icon={EditIcon} size="slim" />
          </Link>
          <Button 
            icon={DeleteIcon} 
            size="slim" 
            onClick={() => handleDeleteClick(member.id)} 
          />
        </div>,
      ];
    },
  );

  return (
    <Page title="Member Management">
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "8px",
        }}
      >
        <Link to="/app/create">
          <Button variant="primary">Create Member</Button>
        </Link>
      </div>
      <Card>
        <Text as="p" variant="headingMd">
          Referral Members
        </Text>
        <DataTable
          columnContentTypes={[
            "numeric",
            "text",
            "text",
            "text",
            "text",
            "text",
            "text",
            "text",
          ]}
          headings={[
            "ID",
            "First Name",
            "Last Name",
            "Email",
            "Phone",
            "Referral Link",
            "Status",
            "Actions",
          ]}
          rows={rows}
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalActive}
        onClose={() => setDeleteModalActive(false)}
        title="Delete Member"
        primaryAction={{
          content: "Delete",
          destructive: true,
          onAction: handleDeleteConfirm,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setDeleteModalActive(false),
          },
        ]}
      >
        <Modal.Section>
          <Text as="p">Are you sure you want to delete this member? This action cannot be undone.</Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}