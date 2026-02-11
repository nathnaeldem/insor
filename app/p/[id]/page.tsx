'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MapPin, Heart, X, Sparkles, Navigation, Mail, AlertCircle, HeartCrack, Loader2, Gem, CheckCircle2, Play } from 'lucide-react';

interface ProposalData {
    id: string;
    location_lat: number;
    location_lng: number;
    location_name: string;
    hint: string;
    question: string;
    yes_message: string;
    no_message: string;
    response: 'yes' | 'no' | null;
    is_paid: boolean;
    video_url?: string | null;
}

type Stage = 'loading' | 'not_paid' | 'hint' | 'distance' | 'question' | 'response' | 'already_answered' | 'error';

export default function ProposalPage() {
    const params = useParams();
    const proposalId = params.id as string;

    const [stage, setStage] = useState<Stage>('loading');
    const [proposal, setProposal] = useState<ProposalData | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [response, setResponse] = useState<'yes' | 'no' | null>(null);
    const [error, setError] = useState('');
    const [watchingLocation, setWatchingLocation] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Load proposal data
    useEffect(() => {
        const loadProposal = async () => {
            try {
                const { data, error: dbError } = await supabase
                    .from('proposals')
                    .select('*')
                    .eq('id', proposalId)
                    .single();

                if (dbError) throw dbError;

                if (!data.is_paid) {
                    setProposal(data);
                    setStage('not_paid');
                    return;
                }

                if (data.response) {
                    setProposal(data);
                    setResponse(data.response);
                    setStage('already_answered');
                    return;
                }

                setProposal(data);
                setStage('hint');
            } catch (err) {
                console.error('Error loading proposal:', err);
                setError('This proposal could not be found.');
                setStage('error');
            }
        };

        loadProposal();
    }, [proposalId]);

    // Calculate distance between two points
    const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }, []);

    // Watch user's location
    const startLocationWatch = useCallback(() => {
        if (!proposal) return;

        setWatchingLocation(true);
        setStage('distance');

        if (!navigator.geolocation) {
            setStage('question');
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const dist = calculateDistance(
                    userLat, userLng,
                    proposal.location_lat, proposal.location_lng
                );

                setDistance(dist);

                if (dist <= 50) {
                    navigator.geolocation.clearWatch(watchId);
                    setWatchingLocation(false);
                    setStage('question');
                }
            },
            (err) => {
                console.error('Geolocation error:', err);
                setStage('question');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [proposal, calculateDistance]);

    // Handle response
    const handleResponse = async (answer: 'yes' | 'no') => {
        setIsSaving(true);
        try {
            await supabase
                .from('proposals')
                .update({
                    response: answer,
                    responded_at: new Date().toISOString()
                })
                .eq('id', proposalId);

            // Fire email notification
            fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proposalId, answer })
            }).catch(err => console.error('Notification error:', err));

            setResponse(answer);
            setStage('response');
        } catch (err) {
            console.error('Error saving response:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const formatDistance = (meters: number): string => {
        if (meters < 1000) return `${Math.round(meters)} meters`;
        return `${(meters / 1000).toFixed(1)} km`;
    };

    const skipToQuestion = () => setStage('question');
    const confirmArrival = () => {
        setWatchingLocation(false);
        setStage('question');
    };

    return (
        <div className="app-container">
            <div className="main-content pb-safe">
                {/* Loading */}
                {stage === 'loading' && (
                    <div className="fade-in" style={{ textAlign: 'center' }}>
                        <Loader2 className="animate-spin text-rose-400" size={48} style={{ margin: '0 auto 20px' }} />
                        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading something special...</p>
                    </div>
                )}

                {/* Error */}
                {stage === 'error' && (
                    <div className="glass-card fade-in" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
                        <AlertCircle className="text-rose-400" size={64} style={{ margin: '0 auto 20px' }} />
                        <h2 className="romantic-title" style={{ fontSize: '24px', marginBottom: '12px' }}>
                            Oops!
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)' }}>{error}</p>
                    </div>
                )}

                {/* Not Paid */}
                {stage === 'not_paid' && (
                    <div className="glass-card fade-in" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
                        <h2 className="text-gradient-rose" style={{ fontSize: '24px', marginBottom: '16px' }}>
                            Waiting for Activation
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>
                            This special proposal hasn&apos;t been activated yet. Please contact the person who sent this to you.
                        </p>
                    </div>
                )}

                {/* Hint Stage */}
                {stage === 'hint' && proposal && (
                    <>
                        <div className="glass-card fade-in" style={{ padding: '32px', textAlign: 'center', maxWidth: '400px' }}>
                            <Mail className="text-rose-400" size={64} style={{ margin: '0 auto 16px' }} />
                            <h2 className="text-gradient-rose" style={{ fontSize: '28px', marginBottom: '8px' }}>
                                A Surprise Awaits
                            </h2>
                            <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>
                                Go to the magical spot to unlock the message...
                            </p>

                            <div style={{
                                background: 'rgba(244, 63, 108, 0.1)',
                                border: '1px solid rgba(244, 63, 108, 0.3)',
                                borderRadius: '16px',
                                padding: '20px',
                                marginBottom: '24px'
                            }}>
                                <p style={{
                                    fontSize: '16px',
                                    lineHeight: 1.6,
                                    fontStyle: 'italic',
                                    color: 'var(--rose-200)'
                                }}>
                                    &ldquo;{proposal.hint}&rdquo;
                                </p>
                            </div>

                            {proposal.location_name && (
                                <div className="location-preview" style={{ marginBottom: '24px' }}>
                                    <div className="location-icon"><MapPin size={24} className="text-rose-400" /></div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: 500 }}>{proposal.location_name}</div>
                                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                                            Go to this special place
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="sticky-action-bar" style={{ flexDirection: 'column' }}>
                            <button
                                className="btn-primary"
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                onClick={startLocationWatch}
                            >
                                <MapPin size={20} /> I&apos;m on my way!
                            </button>
                            <button
                                style={{
                                    marginTop: '4px',
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255,255,255,0.4)',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                                onClick={skipToQuestion}
                            >
                                I&apos;m already there
                            </button>
                        </div>
                    </>
                )}

                {/* Distance Stage */}
                {stage === 'distance' && proposal && (
                    <>
                        <div className="glass-card fade-in" style={{ padding: '32px', textAlign: 'center', maxWidth: '400px' }}>
                            <Navigation className="text-rose-400 pulse" size={64} style={{ margin: '0 auto 16px' }} />
                            <h2 className="text-gradient-purple" style={{ fontSize: '24px', marginBottom: '16px' }}>
                                You&apos;re Getting Closer
                            </h2>

                            {distance !== null ? (
                                <>
                                    <div className="distance-badge" style={{ marginBottom: '20px' }}>
                                        <MapPin size={16} />
                                        <span>{formatDistance(distance)} away</span>
                                    </div>

                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        marginBottom: '20px'
                                    }}>
                                        <div style={{
                                            width: `${Math.max(0, Math.min(100, (1 - distance / 1000) * 100))}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, var(--rose-500), var(--rose-400))',
                                            borderRadius: '4px',
                                            transition: 'width 0.5s ease'
                                        }} />
                                    </div>

                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                                        {distance > 500
                                            ? "Keep going! You're getting warmer 💕"
                                            : distance > 100
                                                ? "Almost there! So close! 💗"
                                                : "You're right there! Just a few more steps! 💖"
                                        }
                                    </p>
                                </>
                            ) : (
                                <>
                                    <Loader2 className="animate-spin text-rose-400" size={32} style={{ margin: '0 auto 20px' }} />
                                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>
                                        Locating you...
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="sticky-action-bar" style={{ flexDirection: 'column', gap: '8px' }}>
                            <button
                                className="btn-primary"
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                                onClick={confirmArrival}
                            >
                                <CheckCircle2 size={18} /> I&apos;m Here! Show Me
                            </button>
                            <button
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(255,255,255,0.4)',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    padding: '4px'
                                }}
                                onClick={skipToQuestion}
                            >
                                Skip location check
                            </button>
                        </div>
                    </>
                )}

                {/* Question Stage — Text or Video */}
                {stage === 'question' && proposal && (
                    <>
                        <div className="glass-card celebrate" style={{
                            padding: proposal.video_url ? '20px' : '40px',
                            textAlign: 'center',
                            maxWidth: '420px',
                            border: '2px solid rgba(244, 63, 108, 0.5)'
                        }}>
                            {/* Video Proposal */}
                            {proposal.video_url ? (
                                <>
                                    <p style={{
                                        fontSize: '14px',
                                        color: 'var(--rose-300)',
                                        marginBottom: '12px',
                                        fontWeight: 500
                                    }}>
                                        💌 A special message for you...
                                    </p>
                                    <div style={{
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        marginBottom: '4px',
                                        border: '2px solid rgba(244, 63, 108, 0.3)'
                                    }}>
                                        <video
                                            src={proposal.video_url}
                                            controls
                                            playsInline
                                            autoPlay
                                            style={{
                                                width: '100%',
                                                aspectRatio: '1/1',
                                                objectFit: 'cover',
                                                display: 'block',
                                                background: '#000'
                                            }}
                                        />
                                    </div>
                                </>
                            ) : (
                                /* Text Proposal */
                                <>
                                    <Gem className="text-rose-300" size={80} style={{
                                        margin: '0 auto 20px',
                                        filter: 'drop-shadow(0 0 10px rgba(244,63,108,0.5))'
                                    }} />
                                    <h2 className="text-gradient-gold" style={{
                                        fontSize: '32px',
                                        marginBottom: '24px',
                                        lineHeight: 1.3
                                    }}>
                                        {proposal.question}
                                    </h2>
                                </>
                            )}
                        </div>

                        {/* Yes / No Buttons — always below the content */}
                        <div className="sticky-action-bar">
                            <button
                                className="btn-yes"
                                onClick={() => handleResponse('yes')}
                                disabled={isSaving}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: 1 }}
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Heart fill="currentColor" size={24} />} Yes!
                            </button>
                            <button
                                className="btn-no"
                                onClick={() => handleResponse('no')}
                                disabled={isSaving}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: 1 }}
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <X size={24} />} No
                            </button>
                        </div>
                    </>
                )}

                {/* Response Stage */}
                {stage === 'response' && proposal && (
                    <div
                        className={`glass-card ${response === 'yes' ? 'celebrate' : 'sad-shake'}`}
                        style={{ padding: '40px', textAlign: 'center', maxWidth: '420px' }}
                    >
                        {response === 'yes' ? (
                            <>
                                <Sparkles className="text-yellow-400" size={100} style={{ margin: '0 auto 20px' }} />
                                <h2 className="romantic-title" style={{ fontSize: '36px', marginBottom: '20px' }}>
                                    YES!!!
                                </h2>
                                <p style={{
                                    fontSize: '18px',
                                    color: 'var(--rose-200)',
                                    lineHeight: 1.6
                                }}>
                                    {proposal.yes_message}
                                </p>
                                <div style={{
                                    marginTop: '30px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '16px'
                                }}>
                                    <Heart fill="currentColor" className="text-rose-500" size={32} />
                                    <Gem className="text-rose-300" size={40} />
                                    <Heart fill="currentColor" className="text-rose-500" size={32} />
                                </div>
                            </>
                        ) : (
                            <>
                                <HeartCrack className="text-gray-400" size={80} style={{ margin: '0 auto 20px' }} />
                                <h2 className="romantic-title" style={{ fontSize: '28px', marginBottom: '20px' }}>
                                    Thank you for being honest
                                </h2>
                                <p style={{
                                    fontSize: '16px',
                                    color: 'rgba(255,255,255,0.7)',
                                    lineHeight: 1.6
                                }}>
                                    {proposal.no_message}
                                </p>
                            </>
                        )}
                    </div>
                )}

                {/* Already Answered */}
                {stage === 'already_answered' && proposal && (
                    <div className="glass-card fade-in" style={{ padding: '40px', textAlign: 'center', maxWidth: '420px' }}>
                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                            {response === 'yes' ? <Gem className="text-rose-300" size={64} /> : <HeartCrack className="text-gray-400" size={64} />}
                        </div>
                        <h2 className="romantic-title" style={{ fontSize: '24px', marginBottom: '16px' }}>
                            This Question Has Been Answered
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                            {response === 'yes'
                                ? "They said YES! 🎉 Love wins!"
                                : "The journey continues..."}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{
                padding: '16px',
                textAlign: 'center',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.3)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px'
            }}>
                Made with <Heart size={10} fill="currentColor" /> Insory
            </div>
        </div>
    );
}
