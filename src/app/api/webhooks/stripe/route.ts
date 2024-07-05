/* eslint-disable camelcase */
import { createTransaction } from "../../../../lib/actions/transaction.action";
import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { Readable } from 'stream';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });

function buffer(readable: Readable) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    readable.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}

export async function POST(request: NextRequest) {
  let rawBody: Buffer;

  try {
    rawBody = await buffer(request.body as Readable);
  } catch (err) {
    return NextResponse.json({
      message: "Error reading raw body",
      error: (err as Error).message,
    }, { status: 400 });
  }

  const sig = request.headers.get("stripe-signature") as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    return NextResponse.json({
      message: "Webhook error",
      error: (err as Error).message,
      endpointSecret,
      sig,
      body: rawBody.toString(), // Ensure this is logged as a string for readability
    }, { status: 400 });
  }

  const eventType = event.type;

  if (eventType === "checkout.session.completed") {
    const { id, amount_total, metadata } = event.data.object;

    const transaction = {
      stripeId: id,
      amount: amount_total ? amount_total / 100 : 0,
      plan: metadata?.plan || "",
      credits: Number(metadata?.credits) || 0,
      buyerId: metadata?.buyerId || "",
      createdAt: new Date(),
    };

    const newTransaction = await createTransaction(transaction);

    return NextResponse.json({ message: "OK", transaction: newTransaction });
  }

  return new Response("", { status: 200 });
}
