
import { ActionFunction, json } from '@remix-run/node';
import { Form, useActionData, useSubmit } from '@remix-run/react';
import { Button, Card, Page, TextField } from '@shopify/polaris';
import { authenticate } from 'app/shopify.server';
import { useState } from 'react';


export const action : ActionFunction = async({request})=>{

    const {admin} = await authenticate.admin(request)
    const formData = await request.formData();

    const title = formData.get('title')
    console.log(title)

    try{
        const endsAt = "2025-12-31T23:59:59Z";
        const startsAt = "2025-01-01T00:00:00Z";
        const minimumRequirementSubtotal = 200;
        const discountAmount = 0.3;
      const response =   await admin.graphql(`
  mutation CreateDiscountCode($basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeBasic {
            title
            startsAt
            endsAt
            customerSelection {
              ... on DiscountCustomers {
                customers {
                  id
                }
              }
            }
            customerGets {
              value {
                ... on DiscountPercentage {
                  percentage
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }`,
  {
    variables: {
        basicCodeDiscount: {  
          title:title,  
          code: "30FORYOU", 
          startsAt,
          endsAt,
          customerSelection: {
            all:true
          },
          customerGets: {
            items:{all:true},
            value: {
              percentage: discountAmount
            }
          },
          minimumRequirement: {
            subtotal: {
              greaterThanOrEqualToSubtotal: minimumRequirementSubtotal
            }
          },
          usageLimit: 100,
          appliesOncePerCustomer: true
        }
      }
      
  },
);

if(response.ok){
    const responseJson = await response.json();
console.log("Full Response:", responseJson);

    return json({
        discount:responseJson
    })
}
return null


    } catch(err){
        console.log(err)
    }
}



export default function Discounts() {
    const submit = useSubmit();
    const actionData = useActionData<typeof action>();
    console.log(actionData,'actionData');
    const generateDiscount = ()=> submit({},{replace:true, method:'POST'})

    const [title,settitle] = useState('');

  return (
    <div>
      <Page>
        <Card>
            <Form onSubmit={generateDiscount} method='post'>
                <TextField
                    id="title"
                    name="title"
                    label="Title"
                    autoComplete='off'
                    value={title}
                    onChange={(value)=>settitle(value)}
                />
            <Button submit>Create Discount</Button>
            </Form>
        </Card>
      </Page>
    </div>
  )
}
