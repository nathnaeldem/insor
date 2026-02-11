import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { proposalId, answer } = await request.json();

        if (!proposalId || !answer) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Fetch proposal to get email
        const { data: proposal, error: dbError } = await supabaseAdmin
            .from('proposals')
            .select('email, question, location_name')
            .eq('id', proposalId)
            .single();

        if (dbError || !proposal?.email) {
            console.error('No proposal or email found:', dbError);
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        }

        // Use Supabase Edge Function or a simple email via an external service
        // For now, we'll use the Supabase built-in email (auth.admin)
        // In production, you'd integrate with Resend, SendGrid, etc.

        // Log the notification for now — you can wire up a real email service later
        const emoji = answer === 'yes' ? '💍🎉' : '💔';
        const subject = answer === 'yes'
            ? `${emoji} They said YES! — Insory`
            : `${emoji} Response received — Insory`;
        const body = answer === 'yes'
            ? `Amazing news! Your proposal "${proposal.question}" at ${proposal.location_name || 'your special place'} was answered with YES! 🎉💕`
            : `Your proposal "${proposal.question}" at ${proposal.location_name || 'your special place'} received a response.`;

        console.log(`📧 Email notification to ${proposal.email}:`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Body: ${body}`);

        // Try sending via Resend if API key is available (optional integration)
        if (process.env.RESEND_API_KEY) {
            try {
                await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from: 'Insory <notifications@insory.com>',
                        to: proposal.email,
                        subject,
                        html: `
                            <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; text-align: center;">
                                <div style="font-size: 48px; margin-bottom: 16px;">${answer === 'yes' ? '💍' : '💔'}</div>
                                <h1 style="color: #1a0a1a; font-size: 28px; margin-bottom: 12px;">
                                    ${answer === 'yes' ? 'They Said YES!' : 'Response Received'}
                                </h1>
                                <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                                    ${body}
                                </p>
                                <div style="padding: 16px; background: #f8f0f4; border-radius: 12px; margin-bottom: 24px;">
                                    <p style="color: #888; font-size: 14px; margin-bottom: 4px;">Your question:</p>
                                    <p style="color: #1a0a1a; font-size: 18px; font-weight: 600;">${proposal.question}</p>
                                </div>
                                <a href="https://insory.com/create" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #f43f6c, #e11d55); color: white; text-decoration: none; border-radius: 50px; font-weight: 600;">
                                    View on Insory
                                </a>
                                <p style="color: #aaa; font-size: 12px; margin-top: 32px;">
                                    Made with ❤️ by Insory — insory.com
                                </p>
                            </div>
                        `,
                    }),
                });
                console.log('✅ Email sent via Resend');
            } catch (emailErr) {
                console.error('Failed to send email via Resend:', emailErr);
            }
        }

        return NextResponse.json({ success: true, subject, to: proposal.email });
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
}
