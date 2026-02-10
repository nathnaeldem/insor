
// Import Supabase Client from Deno modules
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define request handler
Deno.serve(async (req) => {
    // Only allow POST requests (Gumroad webhook sends POST)
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 })
    }

    try {
        // 1. Parse the incoming form data from Gumroad
        const formData = await req.formData()
        const email = formData.get('email')
        const price = formData.get('price') // Optional verification, e.g. check if price === 2800 (cents)

        // Gumroad sends 'email' field in the body
        if (!email) {
            console.error('Missing email in webhook payload')
            return new Response(JSON.stringify({ error: 'Missing email' }), { status: 400 })
        }

        console.log(`Processing payment for email: ${email}`)

        // 2. Initialize Supabase Admin Client
        // We use Deno.env to access environment variables set in Supabase Dashboard
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 3. Mark the most recent unpaid proposal for this email as PAID
        const { data, error } = await supabaseAdmin
            .from('proposals')
            .update({ is_paid: true })
            .eq('email', email)
            .eq('is_paid', false) // Only update if not already paid
            .order('created_at', { ascending: false }) // Prioritize the latest one
            .limit(1)
            .select()

        if (error) {
            console.error('Supabase update error:', error)
            return new Response(JSON.stringify({ error: 'Database update failed' }), { status: 500 })
        }

        if (!data || data.length === 0) {
            console.warn(`No unpaid proposal found for email: ${email}`)
            // Return 200 OK anyway so Gumroad doesn't retry indefinitely
            return new Response(JSON.stringify({ message: 'No matching proposal found, but webhook received' }), { status: 200 })
        }

        console.log(`Successfully activated proposal ID: ${data[0].id}`)

        // 4. Return success response to Gumroad
        return new Response(JSON.stringify({ success: true, updated_proposal: data[0].id }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (err) {
        console.error('Webhook processing error:', err)
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
    }
})
