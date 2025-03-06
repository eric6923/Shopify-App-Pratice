import { useState } from "react";
import { Page, Tabs, Card } from "@shopify/polaris";
import MembersPage from './app.member'; // Import your Members component
import EditMemberPage from "./app.editmember.$id"; // Import your Edit Member component

export default function MainPage() {
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    { id: "members", content: "Members" },
    { id: "editMember", content: "" },
  ];

  return (
    <Page title="Member Management">
      <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
        <Card>
          {selectedTab === 0 && <MembersPage />}
          {selectedTab === 1 && <EditMemberPage />}
        </Card>
      </Tabs>
    </Page>
  );
}
