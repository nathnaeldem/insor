'use client';

import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Printer, Copy, Check, Lock, CreditCard, ExternalLink, RefreshCcw, Loader2, CheckCircle } from 'lucide-react';

interface QRCodeDisplayProps {
    proposalId: string;
    question: string;
    isPaid: boolean;
    isCheckingPayment: boolean;
    email: string;
    onCheckPayment: () => void;
}

export default function QRCodeDisplay({
    proposalId,
    question,
    isPaid,
    isCheckingPayment,
    email,
    onCheckPayment
}: QRCodeDisplayProps) {
    const [copied, setCopied] = useState(false);

    const proposalUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/p/${proposalId}`
        : `https://insory.com/p/${proposalId}`;

    const printPageUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/print/${proposalId}`
        : `https://insory.com/print/${proposalId}`;

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

            {/* Status Banner — right at the top, unmissable */}
            {!isPaid ? (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: 'rgba(244, 63, 108, 0.12)',
                    border: '1px solid rgba(244, 63, 108, 0.25)',
                    borderRadius: '12px',
                    marginBottom: '20px'
                }}>
                    <Lock size={14} className="text-rose-400" />
                    <span style={{ color: 'var(--rose-300)', fontSize: '13px', fontWeight: 600 }}>
                        Your proposal is not live yet
                    </span>
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: 'rgba(52, 211, 153, 0.1)',
                    border: '1px solid rgba(52, 211, 153, 0.25)',
                    borderRadius: '12px',
                    marginBottom: '20px'
                }}>
                    <CheckCircle size={14} style={{ color: '#34d399' }} />
                    <span style={{ color: '#34d399', fontSize: '13px', fontWeight: 600 }}>
                        Your proposal is live! 🎉
                    </span>
                </div>
            )}

            {/* QR Code */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '16px'
            }}>
                <div className="qr-container pulse" style={{
                    opacity: isPaid ? 1 : 0.5,
                    filter: isPaid ? 'none' : 'blur(1px)',
                    position: 'relative'
                }}>
                    <QRCodeCanvas
                        value={proposalUrl}
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
                    {!isPaid && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '16px'
                        }}>
                            <Lock size={32} style={{ color: 'rgba(255,255,255,0.8)' }} />
                        </div>
                    )}
                </div>
            </div>

            {/* Question Preview */}
            <div style={{
                padding: '10px 16px',
                background: 'rgba(244, 63, 108, 0.1)',
                borderRadius: '10px',
                marginBottom: '16px'
            }}>
                <p style={{ fontSize: '13px', color: 'var(--rose-300)' }}>
                    <strong>Question:</strong> {question}
                </p>
            </div>

            {/* Make It Live CTA or Action Buttons */}
            {!isPaid ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <a
                        href={`https://carenote.gumroad.com/l/uizjdd?email=${encodeURIComponent(email)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '14px',
                            background: 'linear-gradient(135deg, var(--rose-500), var(--rose-600))',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '15px',
                            boxShadow: '0 4px 20px rgba(244, 63, 108, 0.35)'
                        }}
                    >
                        <CreditCard size={18} /> Make It Live — $28 <ExternalLink size={14} />
                    </a>
                    <button
                        onClick={onCheckPayment}
                        disabled={isCheckingPayment}
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: 'rgba(255,255,255,0.6)',
                            padding: '10px',
                            borderRadius: '50px',
                            cursor: isCheckingPayment ? 'wait' : 'pointer',
                            fontSize: '13px',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isCheckingPayment ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <RefreshCcw size={14} />
                        )}
                        {isCheckingPayment ? 'Checking...' : 'I Paid, Refresh Status'}
                    </button>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '12px' }}>
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
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                        Print on nice paper and add a ribbon! 🎀
                    </p>
                </>
            )}

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-content, .print-content * { visibility: visible !important; }
                    .print-content {
                        position: absolute;
                        left: 50%; top: 50%;
                        transform: translate(-50%, -50%);
                        text-align: center;
                    }
                    .qr-container { animation: none !important; }
                }
            `}</style>
        </div>
    );
}
