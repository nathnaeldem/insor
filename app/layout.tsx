import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Insory 💕 | Create Your Special Proposal",
  description: "Create a magical, location-based proposal experience with QR codes. Make your special moment unforgettable.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#1a0a1a" />
      </head>
      <body>
        <FloatingHearts />
        {children}
      </body>
    </html>
  );
}

function FloatingHearts() {
  const hearts = ['💕', '💖', '💗', '💝', '❤️', '💘'];
  return (
    <div className="floating-hearts">
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="heart"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
            fontSize: `${14 + Math.random() * 16}px`,
          }}
        >
          {hearts[i % hearts.length]}
        </span>
      ))}
    </div>
  );
}
