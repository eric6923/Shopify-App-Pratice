import { Tabs } from '@shopify/polaris';
import { useLocation, useNavigate } from "@remix-run/react";
import type { ReactNode } from "react";
import { useCallback, useMemo } from 'react';

interface TabLayoutProps {
  children: ReactNode;
}

export default function TabLayout({ children }: TabLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine which tab is active based on the current URL
  const selectedTabIndex = useMemo(() => {
    const isMembersActive = location.pathname.includes("/member") || 
                           location.pathname.includes("/create") || 
                           location.pathname.includes("/editmember");
    return isMembersActive ? 1 : 0;
  }, [location.pathname]);

  // Handle tab change
  const handleTabChange = useCallback(
    (selectedTabIndex: number) => {
      if (selectedTabIndex === 0) {
        navigate('/app/referral');
      } else {
        navigate('/app/member');
      }
    },
    [navigate],
  );

  // Define the tabs
  const tabs = [
    {
      id: 'referral-tab',
      content: 'Referral',
      accessibilityLabel: 'Referral tab',
      panelID: 'referral-content',
    },
    {
      id: 'members-tab',
      content: 'Members',
      accessibilityLabel: 'Members tab',
      panelID: 'members-content',
    },
  ];

  return (
    <div className="dashboard-container">
      <Tabs tabs={tabs} selected={selectedTabIndex} onSelect={handleTabChange} />
      <div className="tab-content">
        {children}
      </div>
    </div>
  );
}