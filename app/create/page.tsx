'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
  Loader2,
  Video,
  VideoOff,
  Trash2,
  Camera,
  Upload
} from 'lucide-react';
import QRCodeDisplay from '../components/QRCodeDisplay';

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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isParsingLocation, setIsParsingLocation] = useState(false);
  const [error, setError] = useState('');
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'right' | 'left'>('right');

  // Video states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProposalData>({
    locationLat: 0,
    locationLng: 0,
    locationName: '',
    hint: '',
    question: '💍 Watch my special message...',
    yesMessage: "You've made me the happiest person alive! 💍❤️",
    noMessage: "I understand. Thank you for being honest with me. 💔",
    email: ''
  });

  // Check local storage on mount
  useEffect(() => {
    const checkSaved = async () => {
      try {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('lastProposal');
          if (saved) {
            const { id, email } = JSON.parse(saved);
            if (id) {
              setProposalId(id);
              const { data } = await supabase
                .from('proposals')
                .select('is_paid, question')
                .eq('id', id)
                .single();

              if (data) {
                setIsPaid(data.is_paid || false);
                setFormData(prev => ({ ...prev, question: data.question, email: email || '' }));
                setStep(3);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading saved proposal:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    checkSaved();
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleInputChange = (field: keyof ProposalData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const parseLocationUrl = useCallback(async (url: string) => {
    setIsParsingLocation(true);
    setLoading(true);
    setError('');

    try {
      let lat: number | null = null;
      let lng: number | null = null;
      let locationName = '';

      const coordMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (coordMatch) { lat = parseFloat(coordMatch[1]); lng = parseFloat(coordMatch[2]); }

      const queryMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (!lat && queryMatch) { lat = parseFloat(queryMatch[1]); lng = parseFloat(queryMatch[2]); }

      const appleLl = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (!lat && appleLl) { lat = parseFloat(appleLl[1]); lng = parseFloat(appleLl[2]); }

      const appleSll = url.match(/[?&]sll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (!lat && appleSll) { lat = parseFloat(appleSll[1]); lng = parseFloat(appleSll[2]); }

      const placeMatch = url.match(/\/place\/([^/@]+)/);
      if (placeMatch) locationName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));

      const applePlace = url.match(/maps\.apple\.com.*[?&](?:q|address)=([^&]+)/);
      if (applePlace && !locationName) locationName = decodeURIComponent(applePlace[1].replace(/\+/g, ' '));

      if (!lat || !lng) {
        const response = await fetch('/api/parse-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        if (response.ok) {
          const data = await response.json();
          lat = data.lat; lng = data.lng;
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
        setError('Could not extract location. Try pasting coordinates directly.');
      }
    } catch {
      setError('Failed to parse location. Try coordinates manually.');
    } finally {
      setLoading(false);
      setIsParsingLocation(false);
    }
  }, []);

  const handleLocationPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (
      pastedText.includes('google.com/maps') || pastedText.includes('goo.gl') ||
      pastedText.includes('maps.app') || pastedText.includes('maps.apple.com') ||
      pastedText.includes('apple.co')
    ) {
      e.preventDefault();
      await parseLocationUrl(pastedText);
    } else if (pastedText.match(/-?\d+\.?\d*,\s*-?\d+\.?\d*/)) {
      e.preventDefault();
      const coords = pastedText.split(',').map(c => parseFloat(c.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        setFormData(prev => ({
          ...prev, locationLat: coords[0], locationLng: coords[1],
          locationName: prev.locationName || `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`
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
    if (!recordedBlob) {
      setError('Please record or upload your video proposal');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  // ─── VIDEO RECORDING ───
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Could not access camera. Please check permissions.');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm'
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
      setShowCamera(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
  };

  // ─── VIDEO UPLOAD ───
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('Video must be under 50MB');
      return;
    }

    setError('');
    setRecordedBlob(file);
    setRecordedUrl(URL.createObjectURL(file));
  };

  const uploadVideo = async (proposalId: string): Promise<string | null> => {
    if (!recordedBlob) return null;

    setIsUploading(true);
    try {
      const ext = recordedBlob.type.includes('mp4') ? 'mp4' : 'webm';
      const fileName = `proposals/${proposalId}/video.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('proposal-videos')
        .upload(fileName, recordedBlob, {
          contentType: recordedBlob.type,
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('proposal-videos')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Video upload error:', err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const checkPaymentLoop = useCallback(() => {
    if (!proposalId) return;
    setIsCheckingPayment(true);
    let attempts = 0;
    const maxAttempts = 5;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const { data } = await supabase
          .from('proposals')
          .select('is_paid')
          .eq('id', proposalId)
          .single();

        if (data?.is_paid) {
          setIsPaid(true);
          clearInterval(interval);
          setIsCheckingPayment(false);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setIsCheckingPayment(false);
        }
      } catch (e) {
        console.error('Check payment error', e);
        clearInterval(interval);
        setIsCheckingPayment(false);
      }
    }, 2000);
  }, [proposalId]);

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
          question: '💍 Watch my special message...',
          yes_message: formData.yesMessage,
          no_message: formData.noMessage,
          email: formData.email,
          is_paid: false
        })
        .select('id')
        .single();

      if (dbError) throw dbError;

      // Upload video
      if (recordedBlob) {
        const videoUrl = await uploadVideo(data.id);
        if (videoUrl) {
          await supabase
            .from('proposals')
            .update({ video_url: videoUrl })
            .eq('id', data.id);
        }
      }

      setProposalId(data.id);
      localStorage.setItem('lastProposal', JSON.stringify({ id: data.id, email: formData.email }));
      setIsPaid(false);
      goToStep(3);
    } catch (err) {
      console.error('Error creating proposal:', err);
      setError('Failed to create proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── INITIAL LOADING SPINNER ───
  if (isInitialLoading) {
    return (
      <div className="app-container">
        <div className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <Loader2 className="animate-spin text-rose-400" size={48} style={{ marginBottom: '16px' }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Loading your proposal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-content pb-safe">
        {/* Logo */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <h1 className="romantic-title text-gradient-rose" style={{ fontSize: '32px' }}>Insory</h1>
          <p className="romantic-subtitle text-vibrant" style={{ opacity: 0.9 }}>Create your magical proposal</p>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator" style={{ marginBottom: '16px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} className={`step-dot ${step === s ? 'active' : ''} ${step > s ? 'completed' : ''}`} />
          ))}
        </div>

        {/* ═══════════ STEP 1: LOCATION ═══════════ */}
        {step === 1 && (
          <>
            <div className={`form-content ${animationDirection === 'right' ? 'slide-in-right' : 'slide-in-left'}`}>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                  <MapPin className="text-rose-400" size={24} />
                  <h2 className="text-gradient-purple" style={{ fontSize: '20px' }}>Choose The Place</h2>
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
                  <label className="form-label">Paste Google Maps or Apple Maps Link</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Paste a map link or coordinates..."
                      onPaste={handleLocationPaste}
                      onChange={(e) => {
                        const val = e.target.value;
                        const coords = val.split(',').map(c => parseFloat(c.trim()));
                        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                          setFormData(prev => ({
                            ...prev, locationLat: coords[0], locationLng: coords[1],
                            locationName: prev.locationName || `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`
                          }));
                        }
                      }}
                      style={{ paddingRight: isParsingLocation ? '44px' : undefined }}
                    />
                    {isParsingLocation && (
                      <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                        <Loader2 className="animate-spin text-rose-400" size={20} />
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '6px' }}>
                    Supports Google Maps, Apple Maps, and shortened links
                  </p>
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
            </div>

            <div className="sticky-action-bar">
              <button
                className="btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => validateStep1() && goToStep(2)}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Continue <ArrowRight size={18} /></>}
              </button>
            </div>
          </>
        )}

        {/* ═══════════ STEP 2: VIDEO + DETAILS ═══════════ */}
        {step === 2 && (
          <>
            <div className={`form-content ${animationDirection === 'right' ? 'slide-in-right' : 'slide-in-left'}`}>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Video className="text-rose-400" size={24} />
                  <h2 className="text-gradient-gold" style={{ fontSize: '20px' }}>Your Proposal</h2>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label">Your Email (to get notified)</label>
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
                    placeholder="e.g. Remember where we first met?..."
                    value={formData.hint}
                    onChange={(e) => handleInputChange('hint', e.target.value)}
                    style={{ minHeight: '80px' }}
                  />
                </div>

                {/* ── VIDEO SECTION ── */}
                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Video size={14} className="text-rose-400" /> Record or Upload Your Proposal
                  </label>

                  {/* Camera Preview (while recording) */}
                  {showCamera && (
                    <div style={{
                      position: 'relative',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      marginBottom: '12px',
                      border: isRecording ? '2px solid var(--rose-500)' : '2px solid rgba(255,255,255,0.15)'
                    }}>
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{
                          width: '100%',
                          aspectRatio: '1/1',
                          objectFit: 'cover',
                          display: 'block',
                          transform: 'scaleX(-1)'
                        }}
                      />
                      {isRecording && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(220, 38, 38, 0.9)',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}>
                          <div style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: '#fff', animation: 'pulse 1s infinite'
                          }} />
                          REC
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recorded / Uploaded Preview */}
                  {recordedUrl && !showCamera && (
                    <div style={{
                      position: 'relative',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      marginBottom: '12px',
                      border: '2px solid rgba(52, 211, 153, 0.3)'
                    }}>
                      <video
                        src={recordedUrl}
                        controls
                        playsInline
                        style={{
                          width: '100%',
                          aspectRatio: '1/1',
                          objectFit: 'cover',
                          display: 'block',
                          background: '#000'
                        }}
                      />
                      <button
                        onClick={deleteRecording}
                        style={{
                          position: 'absolute', top: '8px', right: '8px',
                          background: 'rgba(220, 38, 38, 0.85)',
                          border: 'none', borderRadius: '50%',
                          width: '32px', height: '32px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#fff'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}

                  {/* Record / Upload Buttons — only show if no video yet */}
                  {!recordedUrl && !showCamera && (
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                      <button
                        type="button"
                        onClick={startCamera}
                        style={{
                          flex: 1,
                          padding: '28px 12px',
                          border: '2px dashed rgba(244, 63, 108, 0.3)',
                          borderRadius: '16px',
                          background: 'rgba(244, 63, 108, 0.05)',
                          color: 'rgba(255,255,255,0.7)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          fontWeight: 500,
                          transition: 'all 0.2s'
                        }}
                      >
                        <Camera size={28} style={{ color: 'var(--rose-400)' }} />
                        Record
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          flex: 1,
                          padding: '28px 12px',
                          border: '2px dashed rgba(139, 92, 246, 0.3)',
                          borderRadius: '16px',
                          background: 'rgba(139, 92, 246, 0.05)',
                          color: 'rgba(255,255,255,0.7)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          fontWeight: 500,
                          transition: 'all 0.2s'
                        }}
                      >
                        <Upload size={28} style={{ color: 'var(--purple-400)' }} />
                        Upload
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                    </div>
                  )}

                  {/* Camera Controls */}
                  {showCamera && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="btn-primary"
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc2626' }} />
                          Start Recording
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            padding: '12px', borderRadius: '50px', border: '2px solid #dc2626',
                            background: 'rgba(220, 38, 38, 0.15)', color: '#fff',
                            fontWeight: 600, cursor: 'pointer', fontSize: '14px'
                          }}
                        >
                          <VideoOff size={16} /> Stop Recording
                        </button>
                      )}
                    </div>
                  )}

                  {/* Re-record / Re-upload after recording */}
                  {recordedUrl && !showCamera && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => { deleteRecording(); startCamera(); }}
                        style={{
                          flex: 1, background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          padding: '10px', borderRadius: '50px',
                          color: 'rgba(255,255,255,0.6)', fontSize: '13px',
                          cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: '6px'
                        }}
                      >
                        <Camera size={14} /> Re-record
                      </button>
                      <button
                        type="button"
                        onClick={() => { deleteRecording(); fileInputRef.current?.click(); }}
                        style={{
                          flex: 1, background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          padding: '10px', borderRadius: '50px',
                          color: 'rgba(255,255,255,0.6)', fontSize: '13px',
                          cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: '6px'
                        }}
                      >
                        <Upload size={14} /> Re-upload
                      </button>
                    </div>
                  )}
                </div>

                {/* Yes / No messages */}
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
            </div>

            <div className="sticky-action-bar">
              <button
                className="btn-secondary"
                onClick={() => goToStep(1)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                className="btn-primary"
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={generateProposal}
                disabled={loading || isUploading}
              >
                {loading || isUploading ? (
                  <><Loader2 className="animate-spin" size={20} /> {isUploading ? 'Uploading...' : 'Creating...'}</>
                ) : (
                  <>Generate QR <QrCode size={18} /></>
                )}
              </button>
            </div>
          </>
        )}

        {/* ═══════════ STEP 3: QR + PAYMENT ═══════════ */}
        {step === 3 && proposalId && (
          <>
            <div className={`form-content ${animationDirection === 'right' ? 'slide-in-right' : 'slide-in-left'}`}>
              <QRCodeDisplay
                proposalId={proposalId}
                question={formData.question}
                isPaid={isPaid}
                isCheckingPayment={isCheckingPayment}
                email={formData.email}
                onCheckPayment={checkPaymentLoop}
              />
            </div>

            <div className="sticky-action-bar">
              <button
                className="btn-secondary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => {
                  setProposalId(null);
                  setFormData({
                    locationLat: 0, locationLng: 0, locationName: '', hint: '',
                    question: '💍 Watch my special message...',
                    yesMessage: "You've made me the happiest person alive! 💍❤️",
                    noMessage: "I understand. Thank you for being honest with me. 💔",
                    email: ''
                  });
                  setRecordedBlob(null);
                  setRecordedUrl(null);
                  localStorage.removeItem('lastProposal');
                  goToStep(1);
                }}
              >
                <RefreshCcw size={16} /> Create Another Proposal
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px', textAlign: 'center', fontSize: '11px',
        color: 'rgba(255,255,255,0.3)', display: 'flex',
        justifyContent: 'center', alignItems: 'center', gap: '4px'
      }}>
        Made with <Heart size={10} fill="currentColor" /> for lovers everywhere
      </div>
    </div>
  );
}
