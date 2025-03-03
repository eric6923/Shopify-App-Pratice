import { json } from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import prisma from "../db.server";
import { RewardType } from "@prisma/client";
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
import { useState, useEffect } from "react";
import { ChevronLeftIcon, SearchIcon } from "@shopify/polaris-icons";
import { useAppBridge } from "./AppBridgeContext";
import { ResourcePicker } from "@shopify/app-bridge/actions";

export const action = async ({ request }) => {
  const formData = await request.formData();

  const title = formData.get("title")?.toString() ?? "";
  const discount = parseFloat(formData.get("discount")?.toString() ?? "0");
  const discountType = formData.get("discountType")?.toString() ?? "percentage";
  const minOrderAmount = parseFloat(formData.get("minOrderAmount")?.toString() ?? "0");
  const minOrderQuantity = parseFloat(formData.get("minOrderQuantity")?.toString() ?? "0");
  const rewardTypeValue = "FRIEND";

  if (!title || isNaN(discount) || isNaN(minOrderAmount) || isNaN(minOrderQuantity)) {
    return json({ error: "All fields are required" }, { status: 400 });
  }

  try {
    await prisma.reward.create({
      data: { title, discount, discountType, minOrderAmount, minOrderQuantity, rewardType: rewardTypeValue },
    });

    return json({ success: "Reward created successfully" });
  } catch (error) {
    return json({ error: "Database error: " + error.message }, { status: 500 });
  }
};

export default function RewardForm() {
  const actionData = useActionData();
  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [minOrderQuantity, setMinOrderQuantity] = useState("");
  const [toastActive, setToastActive] = useState(false);
  const [appliesto,setAppliesto] = useState('collections');
  const [search,setsearch] = useState('');
  const [selectedItems,setSelectedItems] = useState<{name:string;id:string;title:string}[]>([]);

  useEffect(() => {
    if (actionData?.success) setToastActive(true);
  }, [actionData]);

  const navigate = useNavigate();

  const appBridge = useAppBridge();

  const openResourcePicker = (query:string) =>{
    const resourceType = appliesto === 'products'
    ? ResourcePicker.ResourceType.Product
    : ResourcePicker.ResourceType.Collection;

    const picker = ResourcePicker.create(appBridge,{
      resourceType,
      showHidden: false,
      initialQuery: query
    })

    picker.subscribe(ResourcePicker.Action.SELECT,(payload)=>{
      const selection = payload.selection.map((item:{id:string;title:string})=>({
        id:item.id,
        title:item.title,
      }))
      console.log("Selected products:",selection);
      setSelectedItems(selection);
      selection.forEach((product:{id:any; title:any; variants:any;})=>{
        console.log("Id",product.id);
        console.log("Title",product.title)
      })
    })
    picker.dispatch(ResourcePicker.Action.OPEN);
  }

  const handleSearchChange = (value:any) =>{
    setsearch(value);
    if(value.length>0){
      openResourcePicker(value)
    }
  }

  const getSearchPlaceholder=()=>{
    return appliesto == 'products' ? 'Search products' : 'Search collections'
  }

  return (
    <Frame>
      <Page title="Create a Reward">
        <button onClick={() => navigate("/app/referral")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <Icon source={ChevronLeftIcon} tone="base" />
        </button>

        {toastActive && <Toast content="Reward created successfully!" onDismiss={() => setToastActive(false)} />}

        <Card>
          <Form method="post">
            <FormLayout>
              <TextField label="Title" value={title} onChange={setTitle} name="title" autoComplete="off" />

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
                      {label:"Specific Collections",value:"collections"},
                      {label:"Specific Products",value:"products"}
                    ]}
                    value={appliesto}
                    onChange={setAppliesto}
                    name="appliesto"
                  />
                  
                  <TextField
                    type="search"
                    label={appliesto === "products"?"Search Products":"Search Collections"}
                    placeholder={getSearchPlaceholder()}
                    autoComplete="off"
                    value={search}
                    onChange={handleSearchChange}
                    prefix={<Icon source={SearchIcon} tone="base"/>}
                  />

              </FormLayout.Group>

              <Button onClick={()=>openResourcePicker(search)}>
                Browse {appliesto === 'products'?'Products':'Collections'}
              </Button>

              {selectedItems.length>0 && (
                <div style={{marginBottom:'16px'}}>
                  <p style={{fontWeight:'bold',marginBottom:'8px'}}>
                    Selected {appliesto} ({selectedItems.length});
                  </p>

                  <ul style={{listStyle:'none',padding:0}}>
                    {selectedItems.map((item)=>(
                      <li key={item.id} style={{display:'flex', alignItems:"center",gap:"4px"}}>• {item.title || item.name}
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
function setSelectedItems(selection: any) {
  throw new Error("Function not implemented.");
}

