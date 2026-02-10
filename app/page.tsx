'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  MapPin,
  ArrowRight,
  ArrowLeft,
  QrCode,
  RefreshCcw,
  Heart,
  HeartCrack,
  Mail,
  type LucideIcon,
  Loader2
} from 'lucide-react';
import QRCodeDisplay from './components/QRCodeDisplay';

interface ProposalData {
  locationLat: number;
  locationLng: number;
  locationName: string;
  hint: string;
  question: string;
  yesMessage: string;
  noMessage: string;
  email: string;
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'right' | 'left'>('right');

  const [formData, setFormData] = useState<ProposalData>({
    locationLat: 0,
    locationLng: 0,
    locationName: '',
    hint: '',
    question: 'Will you marry me?',
    yesMessage: "You've made me the happiest person alive! 💍❤️",
    noMessage: "I understand. Thank you for being honest with me. 💔",
    email: ''
  });

  // Check local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lastProposal');
      if (saved) {
        const { id, email } = JSON.parse(saved);
        if (id) {
          setProposalId(id);
          // Fetch payment status
          supabase
            .from('proposals')
            .select('is_paid, question')
            .eq('id', id)
            .single()
            .then(({ data }) => {
              if (data) {
                setIsPaid(data.is_paid || false);
                setFormData(prev => ({ ...prev, question: data.question, email: email || '' }));
                setStep(3);
              }
            });
        }
      }
    }
  }, []);

  const handleInputChange = (field: keyof ProposalData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const parseLocationUrl = useCallback(async (url: string) => {
    setLoading(true);
    setError('');

    try {
      // Try to extract coordinates from various Google Maps URL formats
      let lat: number | null = null;
      let lng: number | null = null;
      let locationName = '';

      // Format: @lat,lng or /place/lat,lng
      const coordMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (coordMatch) {
        lat = parseFloat(coordMatch[1]);
        lng = parseFloat(coordMatch[2]);
      }

      // Format: ?q=lat,lng or query=lat,lng
      const queryMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (!lat && queryMatch) {
        lat = parseFloat(queryMatch[1]);
        lng = parseFloat(queryMatch[2]);
      }

      // Format: /maps/place/Name/@lat,lng
      const placeMatch = url.match(/\/place\/([^/@]+)/);
      if (placeMatch) {
        locationName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      }

      // If we still don't have coordinates, try using AI to parse
      if (!lat || !lng) {
        const response = await fetch('/api/parse-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });

        if (response.ok) {
          const data = await response.json();
          lat = data.lat;
          lng = data.lng;
          locationName = data.name || locationName;
        }
      }

      if (lat && lng) {
        setFormData(prev => ({
          ...prev,
          locationLat: lat!,
          locationLng: lng!,
          locationName: locationName || `${lat!.toFixed(4)}, ${lng!.toFixed(4)}`
        }));
      } else {
        setError('Could not extract location. Please try pasting coordinates directly (e.g., 40.7128, -74.0060)');
      }
    } catch {
      setError('Failed to parse location. Try entering coordinates manually.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLocationPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');

    if (pastedText.includes('google.com/maps') || pastedText.includes('goo.gl') || pastedText.includes('maps.app')) {
      e.preventDefault();
      await parseLocationUrl(pastedText);
    } else if (pastedText.match(/-?\d+\.?\d*,\s*-?\d+\.?\d*/)) {
      // Direct coordinates like "40.7128, -74.0060"
      e.preventDefault();
      const coords = pastedText.split(',').map(c => parseFloat(c.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        setFormData(prev => ({
          ...prev,
          locationLat: coords[0],
          locationLng: coords[1],
          locationName: `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`
        }));
      }
    }
  };

  const goToStep = (newStep: number) => {
    setAnimationDirection(newStep > step ? 'right' : 'left');
    setStep(newStep);
  };

  const validateStep1 = () => {
    if (!formData.locationLat || !formData.locationLng) {
      setError('Please set the special location');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.hint.trim()) {
      setError('Please add a hint for your special person');
      return false;
    }
    if (!formData.question.trim()) {
      setError('Please enter your question');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const generateProposal = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    setError('');

    try {
      const { data, error: dbError } = await supabase
        .from('proposals')
        .insert({
          location_lat: formData.locationLat,
          location_lng: formData.locationLng,
          location_name: formData.locationName,
          hint: formData.hint,
          question: formData.question,
          yes_message: formData.yesMessage,
          no_message: formData.noMessage,
          email: formData.email,
          is_paid: false
        })
        .select('id')
        .single();

      if (dbError) throw dbError;

      setProposalId(data.id);
      localStorage.setItem('lastProposal', JSON.stringify({ id: data.id, email: formData.email }));
      setIsPaid(false); // New proposals are unpaid by default
      goToStep(3);
    } catch (err) {
      console.error('Error creating proposal:', err);
      setError('Failed to create proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const questionTemplates = [
    'Will you marry me?',
    'Will you be my Valentine?',
    'Will you be my girlfriend?',
    'Will you be my boyfriend?',
    'Will you spend forever with me?'
  ];

  return (
    <div className="app-container">
      <div className="main-content">
        {/* Logo */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <h1 className="romantic-title text-gradient-rose" style={{ fontSize: '32px' }}>Love Lock</h1>
          <p className="romantic-subtitle text-vibrant" style={{ opacity: 0.9 }}>Create your magical proposal</p>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator" style={{ marginBottom: '16px' }}>
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`step-dot ${step === s ? 'active' : ''} ${step > s ? 'completed' : ''}`}
            />
          ))}
        </div>

        {/* Step 1: Location */}
        {step === 1 && (
          <div className={`form-content ${animationDirection === 'right' ? 'slide-in-right' : 'slide-in-left'}`}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <MapPin className="text-rose-400" size={24} />
                <h2 className="text-gradient-purple" style={{ fontSize: '20px' }}>
                  Choose The Place
                </h2>
              </div>

              <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
                Where is the special place?
              </p>

              <div style={{ marginBottom: '12px' }}>
                <label className="form-label">Location Name (optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., The coffee shop where we first met"
                  value={formData.locationName}
                  onChange={(e) => handleInputChange('locationName', e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label className="form-label">Paste Google Maps Link or Coordinates</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Paste a Google Maps link or coordinates..."
                  onPaste={handleLocationPaste}
                  onChange={(e) => {
                    // Handle manual coordinate input
                    const val = e.target.value;
                    const coords = val.split(',').map(c => parseFloat(c.trim()));
                    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                      setFormData(prev => ({
                        ...prev,
                        locationLat: coords[0],
                        locationLng: coords[1],
                        locationName: prev.locationName || `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`
                      }));
                    }
                  }}
                />
              </div>

              {formData.locationLat !== 0 && formData.locationLng !== 0 && (
                <div className="location-preview fade-in">
                  <div className="location-icon"><MapPin size={20} /></div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{formData.locationName || 'Location Set'}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                      {formData.locationLat.toFixed(6)}, {formData.locationLng.toFixed(6)}
                    </div>
                  </div>
                </div>
              )}

              {error && <div className="error-message" style={{ marginTop: '12px' }}>{error}</div>}
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={() => validateStep1() && goToStep(2)}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Continue <ArrowRight size={18} /></>}
            </button>
          </div>
        )}

        {/* Step 2: Question & Hint */}
        {step === 2 && (
          <div className={`form-content ${animationDirection === 'right' ? 'slide-in-right' : 'slide-in-left'}`}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <Mail className="text-rose-400" size={24} />
                <h2 className="text-gradient-gold" style={{ fontSize: '20px' }}>
                  The Question
                </h2>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label className="form-label">Your Email (to save your proposal)</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label className="form-label">Give them a hint</label>
                <textarea
                  className="textarea-field"
                  placeholder="e.g., Remember that rainy evening when we shared our first umbrella? Go there..."
                  value={formData.hint}
                  onChange={(e) => handleInputChange('hint', e.target.value)}
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label className="form-label">Your Question</label>
                <div
                  className="horizontal-scroll-container"
                  style={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: '8px',
                    paddingBottom: '8px',
                    width: '100%',
                    maxWidth: '100%',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                >
                  {questionTemplates.map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleInputChange('question', q)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '13px',
                        background: formData.question === q ? 'var(--rose-500)' : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '20px',
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                        flex: '0 0 auto'
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Or type your own question..."
                  value={formData.question}
                  onChange={(e) => handleInputChange('question', e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label text-gradient-rose" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    YES Message <Heart size={12} fill="currentColor" className="text-rose-500" />
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="OMG YES! 💍"
                    value={formData.yesMessage}
                    onChange={(e) => handleInputChange('yesMessage', e.target.value)}
                    style={{ padding: '12px 16px', borderColor: 'rgba(244, 63, 108, 0.4)' }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    No Message <HeartCrack size={12} className="text-gray-400" />
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Maybe next time..."
                    value={formData.noMessage}
                    onChange={(e) => handleInputChange('noMessage', e.target.value)}
                    style={{ padding: '12px 16px' }}
                  />
                </div>
              </div>

              {error && <div className="error-message" style={{ marginTop: '12px' }}>{error}</div>}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn-secondary"
                onClick={() => goToStep(1)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={generateProposal}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Generate QR Code <QrCode size={18} /></>}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment or QR Code */}
        {step === 3 && proposalId && (
          <div className={`form-content ${animationDirection === 'right' ? 'slide-in-right' : 'slide-in-left'}`}>
            {!isPaid ? (
              <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                <h2 className="text-gradient-rose" style={{ fontSize: '24px', marginBottom: '12px' }}>
                  One Last Step!
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '24px', fontSize: '15px' }}>
                  Your magical proposal is ready. Make it live to share it with your special person.
                </p>
                <a
                  href={`https://carenote.gumroad.com/l/uizjdd?email=${encodeURIComponent(formData.email)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    background: 'linear-gradient(135deg, #ff90e8 0%, #ffc9f0 100%)', /* Gumroad-ish colors */
                    color: '#000',
                    fontWeight: 700,
                    marginBottom: '16px'
                  }}
                >
                  Make Your QR Live ($28)
                </a>

                <button
                  onClick={() => window.location.reload()}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  <RefreshCcw size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  I Paid, Refresh Status
                </button>
              </div>
            ) : (
              <QRCodeDisplay
                proposalId={proposalId}
                question={formData.question}
              />
            )}

            <button
              className="btn-secondary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}
              onClick={() => {
                setProposalId(null);
                setFormData({
                  locationLat: 0,
                  locationLng: 0,
                  locationName: '',
                  hint: '',
                  question: 'Will you marry me?',
                  yesMessage: "You've made me the happiest person alive! 💍❤️",
                  noMessage: "I understand. Thank you for being honest with me. 💔",
                  email: ''
                });
                localStorage.removeItem('lastProposal');
                goToStep(1);
              }}
            >
              <RefreshCcw size={16} /> Create Another Proposal
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px',
        textAlign: 'center',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.3)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '4px'
      }}>
        Made with <Heart size={10} fill="currentColor" /> for lovers everywhere
      </div>
    </div>
  );
}
