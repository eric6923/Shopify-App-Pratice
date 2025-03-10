import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError, useNavigate, useLocation } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import { Page, Tabs, Card } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import styles from '../styles/tabs.css?url';

import TabLayout from "./tablayout";

export const links = () => [
  { rel: "stylesheet", href: polarisStyles },
  { rel: "stylesheet", href: styles }
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const location = useLocation();

  // const tabs = [
  //   { id: "members", content: "Members", path: "/app/member" },
  //   { id: "referral", content: "Referral", path: "/app/referral" },
  // ];

  // const selectedTab = tabs.findIndex((tab) => location.pathname.startsWith(tab.path));

  // const handleTabChange = (selectedTabIndex: number) => {
  //   navigate(tabs[selectedTabIndex].path);
  // };

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">Home</Link>
        {/* <Link to="/app/referral">Programs</Link>
        <Link to="/app/member">Member</Link>
        <Link to="/app/products">Products</Link> */}
        <Link to="/app/main">Main Page</Link>
      </NavMenu>

      {/* <Page title="">
        <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange} />
         */}
        {/* <Card> */}
          <TabLayout>
            <Outlet />
          </TabLayout>
        {/* </Card> */}
      {/* </Page> */}
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
