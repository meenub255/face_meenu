import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { registerStudent, detectBlink } from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Registration = () => {
    const webcamRef = useRef(null);
    const [name, setName] = useState('');
    const [enrollmentNumber, setEnrollmentNumber] = useState('');
    const [enrollmentType, setEnrollmentType] = useState('FT');
    const [images, setImages] = useState([]); // Stores blobs
    const [capturedPreviews, setCapturedPreviews] = useState([]); // Stores data URLs for preview
    const [message, setMessage] = useState('Blink 3 times to unlock capture.');
    const [status, setStatus] = useState('verifying'); // verifying, unlocked, loading, success, error
    const navigate = useNavigate();

    const [blinkCount, setBlinkCount] = useState(0);
    const [isBlinking, setIsBlinking] = useState(false);

    // Blink Detection Loop
    useEffect(() => {
        let interval;
        if (status === 'verifying' && blinkCount < 3) {
            interval = setInterval(async () => {
                if (webcamRef.current) {
                    const imageSrc = webcamRef.current.getScreenshot();
                    if (imageSrc) {
                        try {
                            const blob = await (await fetch(imageSrc)).blob();
                            const res = await detectBlink(blob);

                            if (res.blink) {
                                if (!isBlinking) {
                                    setIsBlinking(true); // Eyes closed
                                }
                            } else {
                                if (isBlinking) {
                                    setIsBlinking(false);
                                    setBlinkCount(c => c + 1);
                                }
                            }
                        } catch (err) {
                            console.error("Blink error", err);
                        }
                    }
                }
            }, 500);
        } else if (blinkCount >= 3 && status === 'verifying') {
            setMessage("Verification Complete. You can now capture images.");
            setStatus('unlocked');
        }
        return () => clearInterval(interval);
    }, [status, blinkCount, isBlinking]);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            setCapturedPreviews(prev => [...prev, imageSrc]);
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    setImages(prev => [...prev, blob]);
                });
        }
    }, [webcamRef]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (images.length !== 3) {
            setMessage('Please capture exactly 3 images.');
            setStatus('error');
            return;
        }
        if (!name.trim() || !enrollmentNumber.trim()) {
            setMessage('Please fill in all fields (Name and Enrollment Number).');
            setStatus('error');
            return;
        }

        setStatus('loading');
        setMessage('Registering Student...');

        try {
            await registerStudent({
                name,
                enrollment_number: enrollmentNumber,
                enrollment_type: enrollmentType
            }, images);

            setStatus('success');
            setMessage('Registration successful!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage('Registration failed: ' + (error.response?.data?.detail || error.message));
        }
    };

    const reset = () => {
        setImages([]);
        setCapturedPreviews([]);
        setMessage('Blink 3 times to unlock capture.');
        setStatus('verifying');
        setBlinkCount(0);
    };

    return (
        <div className="flex flex-col items-center w-full animate-fade-in">
            <h2 className="text-xl font-semibold mb-6 text-white text-center">Register New Student</h2>

            <div className="w-full mb-4 space-y-3">
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={status === 'loading'}
                    className="w-full text-center"
                />

                <input
                    type="text"
                    placeholder="Enrollment Number"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    disabled={status === 'loading'}
                    className="w-full text-center"
                />

                <div className="flex justify-center gap-4 text-white">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="etype"
                            checked={enrollmentType === 'FT'}
                            onChange={() => setEnrollmentType('FT')}
                            className="accent-[var(--accent-color)]"
                        />
                        Full Time
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="etype"
                            checked={enrollmentType === 'PT'}
                            onChange={() => setEnrollmentType('PT')}
                            className="accent-[var(--accent-color)]"
                        />
                        Part Time
                    </label>
                </div>
            </div>

            <div className="relative w-full aspect-video bg-black/50 rounded-lg overflow-hidden border-2 border-dashed border-[var(--glass-border)] mb-4 shadow-inner flex items-center justify-center group">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                    videoConstraints={{ facingMode: "user" }}
                />

                {/* Liveness Overlay */}
                <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded-full text-xs font-mono border border-white/20">
                    Blinks: {blinkCount} / 3
                </div>

                {status === 'verifying' && (
                    <div className="absolute bottom-4 left-0 right-0 text-center text-[var(--accent-color)] font-bold drop-shadow-md animate-pulse">
                        {blinkCount < 3 ? "PLEASE BLINK TO UNLOCK" : "UNLOCKED"}
                    </div>
                )}
            </div>

            {/* Progress Dots */}
            <div className="flex gap-3 mb-6">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${i < images.length
                            ? 'bg-[var(--accent-color)] scale-110 shadow-[0_0_10px_var(--accent-color)]'
                            : 'bg-gray-600'
                            }`}
                    ></div>
                ))}
            </div>

            <div className="flex gap-3 w-full mb-6">
                {images.length < 3 ? (
                    <button
                        onClick={capture}
                        disabled={status !== 'unlocked'}
                        className={`btn-primary flex-1 ${status !== 'unlocked' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Capture Image {images.length + 1}/3
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={status === 'loading'}
                        className="btn-primary flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-[0_4px_12px_rgba(16,185,129,0.4)]"
                    >
                        {status === 'loading' ? 'Registering...' : 'Complete Registration'}
                    </button>
                )}

                {images.length > 0 && (
                    <button
                        onClick={reset}
                        disabled={status === 'loading'}
                        className="px-4 py-2 rounded-lg border border-[var(--glass-border)] hover:bg-white/5 text-sm transition-colors"
                    >
                        Reset
                    </button>
                )}
            </div>

            {message && (
                <div className={`w-full p-3 rounded-lg mb-6 text-sm font-medium text-center ${status === 'success' ? 'bg-green-500/20 text-green-200 border border-green-500/30' :
                    status === 'error' ? 'bg-red-500/20 text-red-200 border border-red-500/30' :
                        'bg-blue-500/20 text-blue-200'
                    }`}>
                    {message}
                </div>
            )}

            <div className="text-center w-full pt-4 border-t border-[var(--glass-border)]">
                <span className="text-[var(--text-secondary)] text-sm">Already registered? </span>
                <Link to="/login" className="text-[var(--accent-color)] hover:text-white font-medium text-sm transition-colors">
                    Login Here
                </Link>
            </div>
        </div>
    );
};

export default Registration;
