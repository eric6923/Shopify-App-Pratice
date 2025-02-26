import { Button } from "@shopify/polaris";
import { useAppBridge } from "./AppBridgeContext";
import { ResourcePicker } from "@shopify/app-bridge/actions";


export default function Dashboard() {
  const appBridge = useAppBridge();

  const openResourcePicker = () => {
    const picker = ResourcePicker.create(appBridge, {
      resourceType: ResourcePicker.ResourceType.Product,
    });

    picker.subscribe("selection", (selection: any) => {
      console.log("Selected products:", selection);
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
