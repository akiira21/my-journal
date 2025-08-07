import { NextResponse } from "next/server";
import db from "@/lib/db";


export async function GET(req: Request){
    try {
        
        const {searchParams} = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({error: "Token is required"}, {status: 400});
        }

        const subsciber = await db.subscriber.findUnique({
            where: {
                unsubscribeToken: token
            }
        });

        if (!subsciber) {
            return NextResponse.json({error: "Invalid or expired token"}, {status: 404})
        }

        await db.subscriber.delete({
            where: {
                email: subsciber.email
            }
        })

        return NextResponse.json({success: true});

    } catch (error) {
        console.log("UNSUBSCRIPTION_ERROR:", error)
        return NextResponse.json({error: "Something went wrong, please try later."}, {status: 500})
    }
}