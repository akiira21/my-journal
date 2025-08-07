import {SESClient, SendEmailCommand} from '@aws-sdk/client-ses';

const ses = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
})


export async function sendVerificationEmail(to: string, token: string) {
    const verificationLink = `https://blog.arun.space/api/verify?token=${token}`

    const htmlBody = `
    <div style="font-family: 'Segoe UI', sans-serif; padding: 24px; background-color: #f9f9fb; border-radius: 12px; max-width: 600px; margin: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.05); color: #333;">
        <div style="text-align: center;">
        <img src="https://undraw.co/api/illustrations/fresh_email.svg" alt="Newsletter" width="120" style="margin-bottom: 20px;" />
        </div>
        <h2 style="color: #4a4aef; text-align: center;">You're Almost There!</h2>
        <p style="font-size: 16px; line-height: 1.6;">
        Hello! Thanks for subscribing to our newsletter. We're excited to keep you updated with our latest content.
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
        Please confirm your email by clicking the button below:
        </p>
        <div style="text-align: center; margin: 24px 0;">
        <a href="${verificationLink}" style="background-color: #4a4aef; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Confirm Subscription
        </a>
        </div>
        <p style="font-size: 12px; color: #888; text-align: center;">
        If you didn't request this, you can safely ignore it.
        </p>
    </div>
    `;


    const command = new SendEmailCommand({
        Source: "newsletter@arun.space",
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Subject: {
                Data: "Please verify your subscription",
            },
            Body: {
                Html: {
                    Data: htmlBody,
                    Charset: "UTF-8", 
                }
            }
        }
    })

    return await ses.send(command); 
}

