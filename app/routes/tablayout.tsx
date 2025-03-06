import { Link, useLocation } from "@remix-run/react";
import type { ReactNode } from "react";

interface TabLayoutProps {
  children: ReactNode;
}

export default function TabLayout({ children }: TabLayoutProps) {
  const location = useLocation();
  const isMembersActive = location.pathname.includes("/member");
  const isReferralActive = location.pathname.includes("/referral") || (!isMembersActive);

  return (
    <div className="dashboard-container">
      
      <div className="tabs-header">
        
        <Link 
          to="/app/referral"
          className={`tab ${isReferralActive ? "active" : ""}`}
          prefetch="intent"
        >
          Referral
        </Link>
        <Link 
          to="/app/member"
          className={`tab ${isMembersActive ? "active" : ""}`}
          prefetch="intent"
        >
          Members
        </Link>
      </div>
      
      <div className="tab-content">
        {children}
      </div>
    </div>
  );
}