import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node"
import prisma from '../db.server'
import { Form, Link, useLoaderData, useParams } from "@remix-run/react";
import { Button, Card, Page, TextField } from "@shopify/polaris";
import { useState } from "react";

export const loader:LoaderFunction = async ({params})=>{
    const member = await prisma.member.findUnique({
        where: {id: Number(params.id)}
    });

    if(!member){
        throw new Response("Member not found",{status:404});
    }

    return json(member)
};

export const action: ActionFunction = async ({request,params})=>{
    const formData = await request.formData();

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const referralCode = formData.get("referralCode") as string;

    await prisma.member.update({
        where: {id: Number(params.id)},
        data: {firstName,lastName,email,phoneNumber,referralCode}
    })

    return redirect('/app/member')
}

export default function EditMember(){

    const member = useLoaderData<typeof loader>();
    const {id} = useParams();
    const storeUrl = "cart424.myshopify.com"
    const referralUrl = `${storeUrl}/${member.referralCode}`;

    const [first,setfirst] = useState(member?.firstName)
    const [last,setlast] = useState(member?.lastName)
    const [email,setemail] = useState(member?.email)
    const [phone,setphone] = useState(member?.phoneNumber)
    const [referral,setreferral] = useState(member?.referralCode);

    return(
        <Page title="Edit Member">
            <Card>
                <Form method="post">
                    <TextField label="First Name" name="firstName" value= {first} onChange={(value)=>(setfirst(value))} autoComplete="given-name"  />
                    <TextField label="Last Name" name="lastName" value={last} onChange={(value)=>setlast(value)} autoComplete="family-name"/>
                    <TextField label="Email" name="email" value={email} onChange={(value)=>setemail(value)} autoComplete="email"/>
                    <TextField label="Phone Number" name="phoneNumber" value={phone} onChange={(value)=>setphone(value)} autoComplete="tel"  />
                    <TextField label="Referral Code" name="referralCode" value={referral} onChange={(value)=>setreferral(value)} autoComplete="off"/>

                    <div style={{marginTop:"14px",display:"flex",gap:"10px"}}>
                        <Button submit variant="primary">Update</Button>
                        <Link to="/app/member">
                        <Button variant="secondary">Cancel</Button>
                        </Link>
                    </div>
                </Form>
            </Card>
        </Page>
    )
}

