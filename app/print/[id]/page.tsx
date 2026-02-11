'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';

export default function PrintPage() {
    const params = useParams();
    const proposalId = params.id as string;
    const [url, setUrl] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setUrl(`${window.location.origin}/p/${proposalId}`);
        setMounted(true);
    }, [proposalId]);

    return (
        <>
            {/* Hide all global background elements when printing */}
            <style jsx global>{`
                @media print {
                    body, html {
                        background: white !important;
                        background-image: none !important;
                    }
                    body::before, body::after {
                        display: none !important;
                    }
                    .floating-hearts {
                        display: none !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                /* Hide floating hearts on this page even when not printing */
                .floating-hearts {
                    display: none !important;
                }
                
                body {
                    background: white !important;
                    background-image: none !important;
                }
            `}</style>

            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff',
                padding: '40px',
                fontFamily: 'Georgia, serif'
            }}>
                {/* Decorative border */}
                <div style={{
                    border: '3px double #f43f6c',
                    borderRadius: '20px',
                    padding: '40px',
                    textAlign: 'center',
                    maxWidth: '400px'
                }}>
                    {/* Heart decoration */}
                    <div style={{ fontSize: '40px', marginBottom: '20px', color: '#f43f6c' }}>
                        💕
                    </div>

                    {/* Title */}
                    <h1 style={{
                        fontSize: '28px',
                        color: '#333',
                        marginBottom: '8px',
                        fontWeight: 500
                    }}>
                        You Have a Special Message
                    </h1>

                    <p style={{
                        color: '#666',
                        fontSize: '14px',
                        marginBottom: '30px'
                    }}>
                        Scan to discover what awaits you
                    </p>

                    {/* QR Code */}
                    {mounted && url && (
                        <div style={{
                            background: '#fff',
                            padding: '20px',
                            borderRadius: '16px',
                            display: 'inline-block',
                            marginBottom: '30px',
                            boxShadow: '0 4px 20px rgba(244, 63, 108, 0.15)'
                        }}>
                            <QRCodeCanvas
                                value={url}
                                size={180}
                                level="H"
                                marginSize={2}
                                imageSettings={{
                                    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23f43f6c'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E",
                                    height: 28,
                                    width: 28,
                                    excavate: true,
                                }}
                            />
                        </div>
                    )}

                    {/* Instructions */}
                    <div style={{
                        background: '#fef7f8',
                        border: '1px solid #fdc5d0',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '20px'
                    }}>
                        <p style={{
                            fontSize: '14px',
                            color: '#be1249',
                            margin: 0,
                            lineHeight: 1.5
                        }}>
                            📱 Scan this QR code with your phone camera
                            <br />
                            <span style={{ color: '#666', fontSize: '12px' }}>
                                Open the link in your browser
                            </span>
                        </p>
                    </div>

                    {/* Footer decoration */}
                    <div style={{
                        fontSize: '20px',
                        color: '#f43f6c',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        ✨ 💝 ✨
                    </div>
                </div>

                {/* Print button (hidden when printing) */}
                <button
                    onClick={() => window.print()}
                    style={{
                        marginTop: '30px',
                        padding: '12px 24px',
                        background: '#f43f6c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(244, 63, 108, 0.3)',
                        transition: 'all 0.2s'
                    }}
                    className="no-print"
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(244, 63, 108, 0.4)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(244, 63, 108, 0.3)';
                    }}
                >
                    🖨️ Print This Card
                </button>
            </div>
        </>
    );
}
