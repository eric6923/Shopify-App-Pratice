import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Text,
  BlockStack,
  InlineStack,
  RadioButton,
  Icon,
  Card,
  Page,
} from "@shopify/polaris";
import { EditIcon, DeleteIcon } from "@shopify/polaris-icons";
import { PersonIcon } from "@shopify/polaris-icons";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import prisma from "../db.server";
import "../styles/ToggleSwitch.css";

export const loader = async () => {
  const rewards = await prisma.reward.findMany();
  return json({ rewards });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const id = Number(formData.get("id"));
  const method = formData.get("_method");

  if (!id) {
    return json({ error: "Missing reward ID" }, { status: 400 });
  }

  if (method === "DELETE") {
    await prisma.reward.delete({
      where: { id },
    });
  } else if (method === "PATCH") {
    const status = formData.get("status") === "true";

    await prisma.reward.update({
      where: { id },
      data: { status },
    });
  }

  return json({ success: true });
};

const RewardPage = () => {
  const { rewards: initialRewards } = useLoaderData<typeof loader>();
  const [rewards, setRewards] = useState(initialRewards);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const navigate = useNavigate();
  const fetcher = useFetcher();

  useEffect(() => {}, []);

  const handleChange = (value: string) => {
    setSelected(value);
  };

  const handleCreateProgram = () => {
    if (selected === "friend") {
      navigate("/app/friend");
    } else if (selected === "referrer") {
      navigate("/app/ref");
    }
    setIsOpen(false);
  };

  const handleEdit = (id: number) => {
    console.log("Edit reward with ID:", id);
    navigate(`/app/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reward",
    );
    if (!confirmed) return;

    try {
      const formData = new FormData();
      formData.append("id", id.toString());
      formData.append("_method", "DELETE");
      setRewards(rewards.filter((reward) => reward.id !== id));
      fetcher.submit(formData, { method: "post" });
    } catch (error) {
      console.error("error deleting reward", error);
    }
  };

  const handleStatusChange = async (id: number, currentStatus: boolean) => {
    try {
      const rewardToUpdate = rewards.find((reward) => reward.id === id);
      if (!rewardToUpdate) return;

      const updatedRewards = rewards.map((reward) =>
        reward.id === id ? { ...reward, status: !currentStatus } : reward,
      );

      setRewards(updatedRewards);

      const formData = new FormData();
      formData.append("id", id.toString());
      formData.append("status", (!currentStatus).toString());
      formData.append("_method", "PATCH");

      fetcher.submit(formData, { method: "post" });
    } catch (error) {
      console.error("Error updating reward status", error);
    }
  };

  return (
    <Page title="Rewards">
      <div style={{ display: "flex", justifyContent: "end" }}>
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          Create a Reward
        </Button>
      </div>

      <BlockStack gap="400">
        <Text as="p" variant="headingMd">
          Existing Rewards
        </Text>
        <div style={{ height: "calc(100vh - 200px)", overflowY: "auto" }}>
          {rewards.length > 0 ? (
            <BlockStack gap="400">
              {rewards.map((reward) => (
                <Card key={reward.id}>
                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text as="p" variant="headingSm">
                        {reward.title}
                      </Text>
                      <InlineStack gap="300" align="center">
                        <Text as="p" variant="headingSm">
                          <span
                            style={{
                              color:
                                reward.rewardType === "REFERRER"
                                  ? "green"
                                  : "red",
                              fontWeight: "bold",
                              padding: "4px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            {reward.rewardType}
                          </span>
                        </Text>
                        <div className="toggle-container">
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={reward.status || false}
                              onChange={() =>
                                handleStatusChange(
                                  reward.id,
                                  reward.status || false,
                                )
                              }
                            />
                            <span className="slider"></span>
                          </label>
                          <div className="status-text">
                            <Text
                              as="span"
                              variant="bodySm"
                              tone={reward.status ? "success" : "subdued"}
                            >
                              {reward.status ? "Active" : "Draft"}
                            </Text>
                          </div>
                        </div>
                      </InlineStack>

                      <InlineStack gap="200">
                        <Button
                          icon={EditIcon}
                          onClick={() => handleEdit(reward.id)}
                          accessibilityLabel="edit"
                        />
                        <Button
                          icon={DeleteIcon}
                          onClick={() => handleDelete(reward.id)}
                        />
                      </InlineStack>
                    </InlineStack>

                    <Text as="p">
                      Discount: {reward.discount}{" "}
                      {reward.discountType === "percentage" ? "%" : "$"}
                    </Text>
                  </BlockStack>
                </Card>
              ))}
            </BlockStack>
          ) : (
            <Text as="p">No rewards available.</Text>
          )}
        </div>
      </BlockStack>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Choose who gets this reward"
        primaryAction={{
          content: "Create Program",
          onAction: handleCreateProgram,
          disabled: !selected,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setIsOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <InlineStack gap="200" align="start">
              <BlockStack gap="100">
                <RadioButton
                  label="Referrer"
                  checked={selected === "referrer"}
                  id="referrer"
                  name="reward"
                  onChange={() => handleChange("referrer")}
                />
                <Text as="span" variant="bodyMd" tone="subdued">
                  Referrer earns this reward for a successful referral.
                </Text>
              </BlockStack>
            </InlineStack>

            <InlineStack gap="200" align="start">
              <BlockStack gap="100">
                <RadioButton
                  label="Friend"
                  checked={selected === "friend"}
                  id="friend"
                  name="reward"
                  onChange={() => handleChange("friend")}
                />
                <Text as="span" variant="bodyMd" tone="subdued">
                  Friend is the referred person. You can choose to provide a
                  reward for the friend - the referred person.
                </Text>
              </BlockStack>
            </InlineStack>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
};

export default RewardPage;
