import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Your Proposal',
    description:
        'Design your magical, location-locked proposal in 3 simple steps. Choose a special place, write your question, and get a beautiful QR code to share.',
    openGraph: {
        title: 'Create Your Proposal | Insory',
        description:
            'Design a magical, location-locked QR code proposal in just 3 steps. Choose a place, write a question, share the magic.',
    },
};

export default function CreateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
