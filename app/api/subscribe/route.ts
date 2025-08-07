import db from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const emailDomain = email.split("@")[1];
    if (!validProviders.includes(emailDomain)) {
      return NextResponse.json(
        {
          error:
            "We only support Gmail, Outlook, Apple, or Yahoo addresses right now for deliverability reasons",
        },
        { status: 400 }
      );
    }

    const isSubsciberExist = await db.subscriber.findUnique({
      where: {
        email,
      },
    });

    if (isSubsciberExist) {
      return NextResponse.json(
        { error: "You are already subscribed 🩷"},
        { status: 409 }
      );
    }

    const subsciber = await db.subscriber.create({
      data: {
        email,
      },
    });

    sendVerificationEmail(email, subsciber.verificationToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("SUBSCRIPTION_ERROR:", error);
    return NextResponse.json({error: "Something went wrong, please try later."}, {status: 500})
  }
}

const validProviders = ["gmail.com", "outlook.com", "yahoo.com", "icloud.com"];
