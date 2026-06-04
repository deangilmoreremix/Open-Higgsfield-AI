import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const body = await req.text();
  const sig = headers().get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    const userId = session.metadata.userId;
    const creditsToAdd = parseInt(session.metadata.credits);

    if (userId && creditsToAdd) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            credits: {
              increment: creditsToAdd
            }
          }
        });
        console.log(`Successfully added ${creditsToAdd} credits to user ${userId}`);
      } catch (error) {
        console.error(`Error updating user credits: ${error.message}`);
        return new NextResponse("Error updating user", { status: 500 });
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}
