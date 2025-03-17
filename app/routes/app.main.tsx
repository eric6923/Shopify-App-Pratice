import { json } from "@remix-run/node";
import { ActionFunction, LoaderFunction } from "@remix-run/node";
import prisma from "../db.server";
import { authenticate } from "app/shopify.server";

// Loader function - handles GET requests to validate referral code
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const referralCode = url.searchParams.get("referralCode");

  if (!referralCode) {
    return json({ success: false, message: "No referral code provided" });
  }

  const member = await prisma.member.findUnique({
    where: { referralCode },
  });

  return json({
    success: !!member,
    message: member ? "Valid referral code" : "Invalid referral code",
  });
};

// Action function - handles POST requests to process referrals and create discount codes
export const action: ActionFunction = async ({ request }) => {
  console.log("Inside Action block");
  try {
    console.log("Inside try block");
    
    // Get the body data
    const body = await request.json();
    const { referralCode, email } = body;

    if (!referralCode || !email) {
      return json({ success: false, message: "Missing referral code or email" }, { status: 400 });
    }

    // Find member with this referral code
    const member = await prisma.member.findUnique({
      where: { referralCode },
    });

    if (!member) {
      return json({ success: false, message: "Invalid referral code" }, { status: 404 });
    }

    // Get the active friend reward
    const friendReward = await prisma.reward.findFirst({
      where: { rewardType: "FRIEND", status: true },
      select: {
        title: true,
        discount: true,
        discountType: true,
        minOrderAmount: true,
      },
    });

    if (!friendReward) {
      console.error("No active FRIEND reward found");
      return json({ success: false, message: "No active reward found" }, { status: 400 });
    }

    // Get session data - just get the first session or most recent one
    const session = await prisma.session.findFirst({
      select: { 
        accessToken: true, 
        shop: true 
      }
    });

    if (!session || !session.accessToken) {
      console.error("No valid session found");
      return json({ success: false, message: "No valid session found" }, { status: 500 });
    }

    const accessToken = session.accessToken;
    const shop = session.shop;

    // Create discount code
    const { title, discount, discountType, minOrderAmount } = friendReward;
    const discountCode = `FRIEND${Math.floor(Math.random() * 10000)}`;
    const today = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(today.getMonth() + 1);
    const startsAt = today.toISOString();
    const endsAt = oneMonthLater.toISOString();

    // GraphQL mutation for creating discount - FIXED QUERY
    const graphqlQuery = `
      mutation CreateDiscountCode($basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
                title
                startsAt
                endsAt
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // Format discount value based on type
    let discountValue;
    if (discountType === "percentage") {
      discountValue = {
        percentage: discount / 100
      };
    } else if (discountType === "fixed") {
      discountValue = {
        discountAmount: {
          amount: parseFloat(discount.toFixed(2)),
          appliesOnEachItem: false
        }
      };
    } else {
      return json({ success: false, message: "Invalid discount type" }, { status: 400 });
    }

    // Fix the variables structure - it had an extra 'variables' nesting which was incorrect
    const variables = {
      basicCodeDiscount: {
        title,
        code: discountCode,
        startsAt,
        endsAt,
        customerSelection: { all: true },
        customerGets: {
          value: discountValue,
          items: {
            all: true
          }
        },
        minimumRequirement: {
          subtotal: { greaterThanOrEqualToSubtotal: minOrderAmount || 200 },
        },
        usageLimit: 100,
        appliesOncePerCustomer: true,
      }
    };

    // Use fetch to directly call the Shopify GraphQL API (similar to curl)
    const apiUrl = `https://${shop}/admin/api/2025-01/graphql.json`;
    
    console.log("Making API request to:", apiUrl);
    console.log("Using access token:", accessToken);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: variables
      })
    });

    const responseJson = await response.json();
    console.log("API Response:", JSON.stringify(responseJson, null, 2));

    if (responseJson.errors || (responseJson.data && responseJson.data.discountCodeBasicCreate.userErrors.length > 0)) {
      console.error("Shopify API Error:", responseJson.errors || responseJson.data.discountCodeBasicCreate.userErrors);
      return json({ 
        success: false, 
        message: "Failed to create discount code" 
      }, { status: 500 });
    }

    // Return a single success response with the discount code
    return json({ 
      success: true, 
      message: "Referral Applied Successfully", 
      discountCode,
      discountValue: discount,
      discountType 
    });

  } catch (error) {
    console.error("Error:", error);
    return json({ success: false, message: "Server error" }, { status: 500 });
  }
};