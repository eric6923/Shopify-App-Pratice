import { json } from "@remix-run/node";
import { ActionFunction } from "@remix-run/node";
import prisma from "../db.server"; 

export const loader = async ({ request }) => {
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

export const action: ActionFunction = async ({ request }) => {
  try {
    const body = await request.json();
    const { referralCode, email } = body;

    if (!referralCode || !email) {
      return json({ success: false, message: "Missing referral code or email" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { referralCode },
    });

    if (!member) {
      return json({ success: false, message: "Invalid referral code" }, { status: 404 });
    }

    return json({ success: true, message: "Referral Applied Successfully" });

  } catch (error) {
    console.error("Error:", error);
    return json({ success: false, message: "Server error" }, { status: 500 });
  }
};

