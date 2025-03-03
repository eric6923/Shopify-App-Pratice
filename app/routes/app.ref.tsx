import { json } from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import prisma from "../db.server"; 
import { reward, RewardType } from "@prisma/client"; 
import {
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Frame,
  Toast,
  Page,
  Icon,
} from "@shopify/polaris";
import { ChevronLeftIcon, SearchIcon } from '@shopify/polaris-icons';
import { useState, useEffect } from "react";
import { useAppBridge } from "./AppBridgeContext";
import { ResourcePicker } from "@shopify/app-bridge/actions";

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();

  const title = formData.get("title")?.toString() ?? "";
  const discount = parseFloat(formData.get("discount")?.toString() ?? "0");
  const discountType = formData.get("discountType")?.toString() ?? "percentage";

  const minOrderAmount = parseFloat(formData.get("minOrderAmount")?.toString() ?? "0");
  const minOrderQuantity = parseFloat(formData.get("minOrderQuantity")?.toString() ?? "0");

  const appliesTo = formData.get("appliesTo")?.toString() ?? "collections"
  const purchaseType = formData.get("purchaseType")?.toString() ?? "one-time purchase"
  const rewardTypeValue: RewardType = "REFERRER";

  const selectedItems = formData.get("selectedItems")?.toString();
  const parsedItems = selectedItems? JSON.parse(selectedItems):[];

  if (!rewardTypeValue || !Object.values(RewardType).includes(rewardTypeValue as RewardType)) {
    return json({ error: "Invalid reward type" }, { status: 400 });
  }

  const rewardType = rewardTypeValue as RewardType;

  if (!title || isNaN(discount) || isNaN(minOrderAmount) || isNaN(minOrderQuantity) || !rewardType) {
    return json({ error: "All fields are required" }, { status: 400 });
  }

  try {
    await prisma.reward.create({
      data: { title, discount, discountType, minOrderAmount, minOrderQuantity, rewardType, purchaseType, appliesTo,
        products:appliesTo === "products"? parsedItems:null,
        collections:appliesTo === "collections"? parsedItems:null,
       },
    });

    return json({ success: "Reward created successfully" });
  } catch (error) {
    return json({ error: "Database error: " + (error as Error).message }, { status: 500 });
  }
};

export default function RewardForm() {
  const actionData = useActionData();
  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState();
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [minOrderQuantity, setMinOrderQuantity] = useState("");
  const [rewardType, setRewardType] = useState("REFERRER");
  const [toastActive, setToastActive] = useState(false);
  const [discountType, setDiscountType] = useState("percentage");
  const [appliesto, setAppliesto] = useState('collections');
  const [purchasetype, setPurchasetype] = useState('one-time purchase');
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<{
    name: string; id: string;title: string 
}[]>([]);

  useEffect(() => {
    if (actionData?.success) setToastActive(true);
  }, [actionData]); 

  useEffect(() => {
    setSearch('');
    setSelectedItems([]);
  }, [appliesto]);

  const navigate = useNavigate();
  const appBridge = useAppBridge();
  
  const openResourcePicker = (query:string) => {
    const resourceType = appliesto === 'products' 
      ? ResourcePicker.ResourceType.Product 
      : ResourcePicker.ResourceType.Collection;
    
    const picker = ResourcePicker.create(appBridge, {
      resourceType,
      showHidden: false,
      initialQuery: query
    });
    
    picker.subscribe(ResourcePicker.Action.SELECT, (payload) => {
      const selection = payload.selection.map((item:{id:string;title:string})=>({
        id:item.id,
        title:item.title,
      }))
      console.log("Selected products:", selection);
      setSelectedItems(selection);
      selection.forEach((product: { id: any; title: any; variants: any; }) => {
        console.log("Product ID:", product.id);
        console.log("Product Title:", product.title);
        console.log("Product Variants:", product.variants);
      });
    });

    picker.dispatch(ResourcePicker.Action.OPEN);
  };

  const handleSearchChange = (value:any) => {
    setSearch(value);

    if (value.length > 0) {
      openResourcePicker(value);
    }
  };

  const getSearchPlaceholder = () => {
    return appliesto === 'products' ? 'Search products' : 'Search collections';
  };

  return (
    <Frame>
      <Page title="Create a Reward">
        <button 
          onClick={() => navigate("/app/referral")} 
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <Icon source={ChevronLeftIcon} tone="base" />
        </button>
        
        {toastActive && (
          <Toast 
            content="Reward created successfully!" 
            onDismiss={() => setToastActive(false)} 
          />
        )}
        
        <Card>
          <Form method="post">
            <FormLayout>
              <TextField 
                label="Title" 
                value={title} 
                onChange={setTitle} 
                name="title" 
                autoComplete="off" 
              />
              
              <FormLayout.Group>
                <TextField 
                  label="Discount Value" 
                  value={discount} 
                  onChange={setDiscount} 
                  type="number" 
                  name="discount" 
                  autoComplete="off" 
                />
                <Select
                  label="Discount Type"
                  options={[
                    { label: "Percentage (%)", value: "percentage" },
                    { label: "Fixed Value ($)", value: "fixed" },
                  ]}
                  value={discountType}
                  onChange={setDiscountType}
                  name="discountType"
                />
              </FormLayout.Group>

              <FormLayout.Group>
                <Select
                  label="Applies to"
                  options={[
                    { label: "Specific Collections", value: "collections" },
                    { label: "Specific Products", value: "products" }
                  ]}
                  value={appliesto}
                  onChange={setAppliesto}
                  name="appliesTo"
                />
                <TextField 
                
                  type="search" 
                  label={appliesto === 'products' ? 'Search products' : 'Search collections'}
                  placeholder={getSearchPlaceholder()}
                  autoComplete="off" 
                  value={search} 
                  onChange={handleSearchChange}
                  prefix={<Icon source={SearchIcon} tone="base" />} 
                />
              </FormLayout.Group>

                
                <Button onClick={()=>openResourcePicker(search)}>
                  Browse {appliesto === 'products' ? 'Products' : 'Collections'}
                </Button>
          

              {selectedItems.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    Selected {appliesto} ({selectedItems.length}):
                  </p>

                  <ul style={{listStyle:'none',padding:0}}>
                    {selectedItems.map((item)=>(
                      <li key={item.id} style={{display:"flex",alignItems:"center",gap:"4px"}}>• {item.title || item.name}
                      <button onClick={()=>setSelectedItems(selectedItems.filter((i)=>i.id != item.id))} 
                        style={{
                          background:"none",
                          border:"none",
                          cursor:"pointer",
                          color:"red",
                          fontSize:"14px",
                          marginLeft:"4px",
                          padding:"2px"
                        }}
                        >✖</button>
                      </li>
                    ))}


                  </ul>
                </div>
              )}

              <TextField 
                label="Minimum Order Amount" 
                value={minOrderAmount} 
                onChange={setMinOrderAmount} 
                type="number" 
                name="minOrderAmount" 
                autoComplete="off" 
              />
              
              <TextField 
                label="Minimum Order Quantity" 
                value={minOrderQuantity} 
                onChange={setMinOrderQuantity} 
                type="number" 
                name="minOrderQuantity" 
                autoComplete="off" 
              />
              
              <input type="hidden"
              name="selectedItems"
              value={JSON.stringify(selectedItems)}
              />

              <Button variant="primary" submit>
                Create Reward
              </Button>
            </FormLayout>
          </Form>
        </Card>
      </Page>
    </Frame>
  );
}