import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response) {
    try {
        const {searchParams} = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({error: "Token is required"}, {status: 400});
        }

        const subsciber = await db.subscriber.findUnique({
            where: {
                verificationToken: token
            }
        });

        if (!subsciber) {
            return NextResponse.json({error: "Invalid or expired token"}, {status: 404});
        }

        await db.subscriber.update({
            where: { email: subsciber.email},
            data: {verified: true}
        })

        return NextResponse.json({success: true})

    } catch (error) {
        console.log("VERIFICATION_ERROR:", error)
        return NextResponse.json({error: "Something went wrong, please try later.", status: 500})
    }
}