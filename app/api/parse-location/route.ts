import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Use OpenRouter with Gemini to parse the location
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://insory.com',
                'X-Title': 'Insory App'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-exp:free',
                messages: [
                    {
                        role: 'system',
                        content: `You are a location extraction expert. Extract latitude, longitude, and place name from URLs.
            
Return ONLY a valid JSON object in this exact format:
{"lat": number, "lng": number, "name": "string"}

If you cannot extract coordinates, return:
{"lat": null, "lng": null, "name": null}

Do not include any other text, just the JSON.`
                    },
                    {
                        role: 'user',
                        content: `Extract the location from this URL: ${url}`
                    }
                ],
                temperature: 0.1,
                max_tokens: 200
            })
        });

        if (!response.ok) {
            throw new Error('AI service error');
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        // Try to parse the JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return NextResponse.json(parsed);
        }

        return NextResponse.json({ lat: null, lng: null, name: null });
    } catch (error) {
        console.error('Error parsing location:', error);
        return NextResponse.json(
            { error: 'Failed to parse location' },
            { status: 500 }
        );
    }
}
