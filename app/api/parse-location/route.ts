import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        let { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Expand shortened URLs (goo.gl, maps.app.goo.gl, Apple Maps short links) by following redirects
        if (url.includes('goo.gl') || url.includes('maps.app') || url.includes('apple.co') || url.match(/maps\.apple\.com.*[?&]auid=/)) {
            try {
                console.log('🔗 Expanding shortened URL:', url);
                // Use GET with redirect: 'manual' to capture the Location header
                // Some short URL services don't respond to HEAD
                const expandResponse = await fetch(url, {
                    method: 'GET',
                    redirect: 'follow',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; Insory/1.0)'
                    }
                });
                const expandedUrl = expandResponse.url;
                if (expandedUrl && expandedUrl !== url) {
                    console.log('✅ Expanded to:', expandedUrl);
                    url = expandedUrl;
                }
            } catch (expandError) {
                console.warn('⚠️  Failed to expand shortened URL, trying original:', expandError);
            }
        }

        // Try to extract coordinates from URL with regex before calling AI
        let lat: number | null = null;
        let lng: number | null = null;
        let name: string | null = null;

        // Google Maps: @lat,lng
        const gmapCoord = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (gmapCoord) {
            lat = parseFloat(gmapCoord[1]);
            lng = parseFloat(gmapCoord[2]);
        }

        // Google Maps: ?q=lat,lng
        const gmapQuery = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (!lat && gmapQuery) {
            lat = parseFloat(gmapQuery[1]);
            lng = parseFloat(gmapQuery[2]);
        }

        // Apple Maps: ?ll=lat,lng
        const appleLl = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (!lat && appleLl) {
            lat = parseFloat(appleLl[1]);
            lng = parseFloat(appleLl[2]);
        }

        // Apple Maps: ?q=lat,lng or ?sll=lat,lng
        const appleSll = url.match(/[?&](?:sll|q)=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (!lat && appleSll) {
            lat = parseFloat(appleSll[1]);
            lng = parseFloat(appleSll[2]);
        }

        // Apple Maps: /place?address=...
        const applePlace = url.match(/maps\.apple\.com.*[?&](?:q|address)=([^&]+)/);
        if (applePlace && !lat) {
            name = decodeURIComponent(applePlace[1].replace(/\+/g, ' '));
        }

        // Google Maps: /place/Name/
        const gPlace = url.match(/\/place\/([^/@]+)/);
        if (gPlace) {
            name = decodeURIComponent(gPlace[1].replace(/\+/g, ' '));
        }

        // If regex found coords, return immediately -- no AI call needed
        if (lat && lng) {
            console.log('📍 Regex extracted coords:', lat, lng, name);
            return NextResponse.json({ lat, lng, name: name || null });
        }

        // Check if API key exists
        if (!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
            console.warn('⚠️  NEXT_PUBLIC_OPENROUTER_API_KEY not set — AI parsing disabled');
            return NextResponse.json({ lat: null, lng: null, name: null });
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
                model: 'google/gemini-2.0-flash-001',
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
            const errorText = await response.text();
            console.error('OpenRouter API error:', response.status, errorText);
            return NextResponse.json({ lat: null, lng: null, name: null });
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return NextResponse.json(parsed);
        }

        return NextResponse.json({ lat: null, lng: null, name: null });
    } catch (error) {
        console.error('Error parsing location:', error);
        return NextResponse.json({ lat: null, lng: null, name: null });
    }
}
