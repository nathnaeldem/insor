# 💕 Insory - QR-Based Love Proposal App

Create magical, location-based proposals with beautiful QR codes. Make your special moment unforgettable!

## ✨ Features

- **3-Step Simple Form**: Location → Message → Generate QR
- **Location-Based Magic**: The question only reveals when your special person reaches the location
- **Beautiful Printable QR Cards**: Premium design ready to print and share
- **GPS Tracking**: Real-time distance tracking as they get closer
- **Yes/No Responses**: Sweet messages for both outcomes
- **Premium UI**: Glassmorphism, animations, and romantic theme

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (free tier works!)

### Setup

1. **Clone and Install**
   ```bash
   cd babyluck
   npm install
   ```

2. **Set up Supabase Database**
   
   Go to your Supabase project dashboard → SQL Editor → Run the following:
   
   ```sql
   -- Copy contents from supabase_setup.sql here, or run directly:
   ```
   
   Or run the `supabase_setup.sql` file in the SQL Editor.

3. **Configure Environment**
   
   Create `.env.local` (already created):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## 📱 How It Works

### For the Proposer:

1. **Step 1 - Location**: Paste a Google Maps link or coordinates of your special place
2. **Step 2 - Message**: Add a romantic hint and your question
3. **Step 3 - QR Code**: Get a beautiful QR code to print or share

### For the Recipient:

1. **Scan QR Code**: Opens in their browser
2. **See the Hint**: A clue to guide them to the special place
3. **Location Check**: GPS tracks their location (50m radius)
4. **The Big Moment**: Question reveals when they arrive!
5. **Answer**: They tap Yes or No

## 🎨 Design Philosophy

- **Premium Feel**: Dark romantic theme with purple/rose gradients
- **App-Like Experience**: Single screen, no scrolling
- **Glassmorphism**: Modern glass card effects
- **Micro-Animations**: Floating hearts, pulses, smooth transitions
- **Mobile First**: Perfect on phones (where QR scans happen!)

## 📂 Project Structure

```
babyluck/
├── app/
│   ├── api/
│   │   └── parse-location/     # AI location parsing
│   ├── components/
│   │   └── QRCodeDisplay.tsx   # QR code component
│   ├── p/[id]/                 # Proposal page (recipient)
│   │   └── page.tsx
│   ├── print/[id]/             # Printable QR card
│   │   └── page.tsx
│   ├── globals.css             # Premium styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main form
├── lib/
│   └── supabase.ts             # Supabase client
├── supabase_setup.sql          # Database schema
└── .env.local                  # Environment variables
```

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **QR Generation**: qrcode.react
- **AI for Location Parsing**: Gemini 2.0 Flash (via OpenRouter)
- **Styling**: Vanilla CSS with CSS Variables

## 💡 Tips

- **Print the QR**: Use nice paper and add a ribbon for that extra touch!
- **Test the Location**: Make sure GPS works at your chosen spot
- **Keep it Simple**: The hint should be memorable but not too obvious

## 🔒 Privacy

- Proposals are stored with UUIDs (hard to guess)
- No personal data collected
- Location only used client-side

## 📄 License

Made with 💕 for lovers everywhere

---

**Ready to create your magical moment?** Start at http://localhost:3000!
