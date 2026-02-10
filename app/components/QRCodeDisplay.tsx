'use client';

import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Printer, Copy, Check, Sparkles } from 'lucide-react';

interface QRCodeDisplayProps {
    proposalId: string;
    question: string;
}

export default function QRCodeDisplay({ proposalId, question }: QRCodeDisplayProps) {
    const [copied, setCopied] = useState(false);

    const proposalUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/p/${proposalId}`
        : `https://yoursite.com/p/${proposalId}`;

    const printPageUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/print/${proposalId}`
        : `https://yoursite.com/print/${proposalId}`;

    const handlePrint = () => {
        window.open(printPageUrl, '_blank');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(proposalUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="glass-card fade-in" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Sparkles className="text-yellow-400" size={32} style={{ marginBottom: '8px' }} />
                <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
                    Your Proposal is Ready!
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                    Print this QR code and give it to your special person
                </p>
            </div>

            {/* QR Code Container */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}
            >
                <div className="qr-container pulse">
                    <QRCodeCanvas
                        value={proposalUrl}
                        size={200}
                        level="H"
                        marginSize={2}
                        imageSettings={{
                            src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23f43f6c'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E",
                            height: 30,
                            width: 30,
                            excavate: true,
                        }}
                    />
                </div>

                <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    maxWidth: '280px'
                }}>
                    <p style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#fff',
                        marginBottom: '8px'
                    }}>
                        💝 Scan me with your phone camera
                    </p>
                    <p style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.5)',
                        lineHeight: 1.5
                    }}>
                        Open the link in your browser to begin the magical journey
                    </p>
                </div>
            </div>

            {/* Question Preview */}
            <div style={{
                padding: '12px 16px',
                background: 'rgba(244, 63, 108, 0.15)',
                borderRadius: '12px',
                marginBottom: '20px'
            }}>
                <p style={{ fontSize: '14px', color: 'var(--rose-300)' }}>
                    <strong>Question:</strong> {question}
                </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                    className="btn-primary"
                    onClick={handlePrint}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Printer size={16} /> Print
                </button>
                <button
                    className="btn-secondary"
                    onClick={handleCopyLink}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        ...(copied ? { background: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981' } : {})
                    }}
                >
                    {copied ? <><Check size={16} className="text-green-400" /> Copied!</> : <><Copy size={16} /> Copy Link</>}
                </button>
            </div>

            <p className="info-text" style={{ marginTop: '16px' }}>
                Pro tip: Print on nice paper and add a ribbon! 🎀
            </p>

            {/* Print-only version */}
            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          
          .print-content, .print-content * {
            visibility: visible !important;
          }
          
          .print-content {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
          }
          
          .qr-container {
            animation: none !important;
          }
        }
      `}</style>
        </div>
    );
}
