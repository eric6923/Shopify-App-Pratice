import { LoaderFunction } from "@remix-run/node";
import { Card, Layout, List, Page } from "@shopify/polaris";
import { apiVersion, authenticate } from "app/shopify.server";

import { useLoaderData } from "@remix-run/react";

export const query = `{
    products(first: 5) {
      edges {
        node {
          id
          title
          totalInventory
        }
      }
    }
  }`;

export const loader: LoaderFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop, accessToken } = session;

  try {
    const response = await fetch(
      `https://${shop}/admin/api/${apiVersion}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken!,
        },
        body: JSON.stringify({ query }),
      },
    );

    if (response.ok) {
      const data = await response.json();

      const {
        data: {
          products: { edges },
        },
      } = data;
      return edges;
    }

    return null;
  } catch (err) {
    console.log(err);
  }
};

export default function collection() {
  const products: any = useLoaderData();
  console.log(products, "products");
  return (
    <div>
      <Page>
        <Layout>
          <Layout.Section>
            <Card>
              <h1>Hello World</h1>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <List type="bullet" gap="loose">
                {products?.map((product: any, index: number) => (
                  <List.Item key={product.node.id}>
                    {index + 1}. {product.node.title} (Inventory:{" "}
                    {product.node.totalInventory})
                  </List.Item>
                ))}
              </List>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </div>
  );
}
