import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

// Load .env explicitly for standalone usage/utils
dotenv.config();

/**
 * Configure Nodemailer with Gmail OAuth2
 * This bypasses SMTP blocks and doesn't require "Less Secure Apps"
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
} as any);

export async function sendProfileCompletionEmail(to: string, token: string) {
    const websiteUrl = process.env.WEBSITE_URL || "https://iap-system.vercel.app";
    const profileLink = `${websiteUrl}/complete-profile?token=${token}`;

    const mailOptions = {
        from: `"IAP System" <${process.env.GMAIL_USER}>`,
        to: to,
        subject: "Complete Your Profile - IAP System",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #0070f3;">Welcome to IAP System</h2>
                <p>Hello,</p>
                <p>Your account has been created. Please complete your profile by clicking the button below:</p>
                <div style="margin: 30px 0;">
                    <a href="${profileLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Complete Profile</a>
                </div>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p>${profileLink}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
                <p style="font-size: 12px; color: #888;">This is an automated message, please do not reply.</p>
            </div>
        `,
    };

    try {
        console.log(`GMAIL API: Attempting to send profile completion email to ${to}`);
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully via Gmail API:", info.messageId);
        return info;
    } catch (error: any) {
        console.error("CRITICAL: Gmail API Error (Profile):", error);
        throw new Error(`Email Service Error: ${error.message || "Unknown error"}`);
    }
}

export async function sendResetPasswordEmail(to: string, token: string) {
    const websiteUrl = process.env.WEBSITE_URL || "https://iap-system.vercel.app";
    const resetLink = `${websiteUrl}/reset-password?token=${token}`;

    const mailOptions = {
        from: `"IAP System" <${process.env.GMAIL_USER}>`,
        to: to,
        subject: "Password Reset Request - IAP System",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #0070f3;">Password Reset</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password. Click the button below to set a new one:</p>
                <div style="margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </div>
                <p>If you did not request this, you can safely ignore this email.</p>
                <p>If the button doesn't work, copy and paste this link:</p>
                <p>${resetLink}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
                <p style="font-size: 12px; color: #888;">This is an automated message, please do not reply.</p>
            </div>
        `,
    };

    try {
        console.log(`GMAIL API: Attempting to send password reset email to ${to}`);
        const info = await transporter.sendMail(mailOptions);
        console.log("Reset email sent successfully via Gmail API:", info.messageId);
        return info;
    } catch (error: any) {
        console.error("CRITICAL: Gmail API Error (Reset):", error);
        throw new Error(`Email Service Error: ${error.message || "Unknown error"}`);
    }
}
