import { Button } from "@shopify/polaris";
import { useAppBridge } from "./AppBridgeContext";
import { ResourcePicker } from "@shopify/app-bridge/actions";

export default function Dashboard() {
  const appBridge = useAppBridge();

  const openResourcePicker = () => {
    const picker = ResourcePicker.create(appBridge, {
      resourceType: ResourcePicker.ResourceType.Product,
      options: {
        selectMultiple: true, // Allow multiple product selection
      },
    });

    picker.subscribe(ResourcePicker.Action.SELECT, (payload) => {
      // The selection data is in payload.selection
      const selection = payload.selection;
      
      // Log the full selection object
      console.log("Selected products:", selection);
      
      // If you want to extract just the product details:
      selection.forEach((product: { id: any; title: any; variants: any; }) => {
        console.log("Product ID:", product.id);
        console.log("Product Title:", product.title);
        console.log("Product Variants:", product.variants);
      });
    });

    picker.dispatch(ResourcePicker.Action.OPEN);
  };

  return (
    <div>
      <h1>Shopify App Dashboard</h1>
      <Button onClick={openResourcePicker}>Select Products</Button>
    </div>
  );
}