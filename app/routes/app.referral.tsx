import { useState } from "react";
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
import { useLoaderData, useNavigate } from "@remix-run/react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import prisma from "../db.server";

export const loader = async () => {
  const rewards = await prisma.reward.findMany();
  return json({ rewards });
};

export const action = async ({request}:ActionFunctionArgs)=>{
  const formData = await request.formData();
  const id = Number(formData.get("id"));

  if(!id){
    return json({error:"Missing reward ID"},{status:400});
  }

  await prisma.reward.delete({
    where:{id},
  });

  return json({success:true})
}


const RewardPage = () => {
  const { rewards } = useLoaderData<typeof loader>();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const navigate = useNavigate();

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
    const confirmed = window.confirm("Are you sure you want to delete this reward");
    if(!confirmed)return;

    try{
      const formData = new FormData();
      formData.append("id",id.toString())
      const response = await fetch(`/app/referral`,{
        method:"DELETE",
        body:formData,
      });

      if(!response.ok){
        throw new Error("Failed to delete");
      }
      window.location.reload();
    }
    catch(error){
      console.error("error deleting reward",error);
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
        {rewards.length > 0 ? (
          rewards.map((reward) => (
            <Card key={reward.id}>
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="p" variant="headingSm">
                    {reward.title}
                   
                  </Text>
                  <Text as="p" variant="headingSm">
                  <span
                    style={{
                      color: reward.rewardType === "REFERRER" ? "green" : "red",
                      fontWeight: "bold",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                  {reward.rewardType}
                </span>
              </Text>


                  <InlineStack gap="200">
                    <Button variant="plain"icon={EditIcon} onClick={() => handleEdit(reward.id)} accessibilityLabel="edit">
                      
                    </Button>         
                    <Button variant="plain" icon={DeleteIcon} onClick={() => handleDelete(reward.id)}>
                  
                    </Button>
                  </InlineStack>
                </InlineStack>

                <Text as="p">
                  Discount: {reward.discount} {reward.discountType === "percentage" ? "%" : "$"}
                </Text>

              </BlockStack>
            </Card>
          ))
        ) : (
          <Text as="p">No rewards available.</Text>
        )}
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
              {/* <div className="p-2 bg-sky-50 rounded-lg">
                <Icon source={PersonIcon} />
              </div> */}
              <BlockStack gap="100">
                <RadioButton
                  label="Friend"
                  checked={selected === "friend"}
                  id="friend"
                  name="reward"
                  onChange={() => handleChange("friend")}
                />
                <Text as="span" variant="bodyMd" tone="subdued">
                  Friend is the referred person. You can choose to provide a reward for the friend - the referred person.
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
