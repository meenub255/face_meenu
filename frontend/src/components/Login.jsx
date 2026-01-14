import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { recognizeStudent, detectBlink } from '../api';
import { Link } from 'react-router-dom';

const Login = () => {
    const webcamRef = useRef(null);
    const [message, setMessage] = useState('Blink 3 times to verify you are real.');
    const [status, setStatus] = useState('verifying'); // verifying, success, error, login_processing

    const [blinkCount, setBlinkCount] = useState(0);
    const [isBlinking, setIsBlinking] = useState(false); // Track state to avoid double counting

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
                                    // Eyes opened after closing -> Blink completed
                                    setIsBlinking(false);
                                    setBlinkCount(c => c + 1);
                                }
                            }
                        } catch (err) {
                            console.error("Blink error", err);
                        }
                    }
                }
            }, 500); // Check every 500ms
        } else if (blinkCount >= 3 && status === 'verifying') {
            // Blinks complete
            setMessage("Verification Complete. Marking Attendance...");
            setStatus('login_processing');
            autoLogin();
        }
        return () => clearInterval(interval);
    }, [status, blinkCount, isBlinking]);

    const autoLogin = useCallback(async () => {
        setMessage("Capturing multi-frame samples for accuracy...");
        setStatus('login_processing');

        const frames = [];
        for (let i = 0; i < 5; i++) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                const blob = await (await fetch(imageSrc)).blob();
                frames.push(blob);
            }
            await new Promise(resolve => setTimeout(resolve, 200)); // 200ms between frames
        }

        try {
            // Updated to use recognizeStudent
            const data = await recognizeStudent(frames);
            if (data.status === 'success') {
                setStatus('success');
                // Backend returns: status, student, enrollment_number, similarity, session_id
                setMessage(`Welcome, ${data.student} (${data.enrollment_number})! Attendance Marked.`);
            } else {
                setStatus('error');
                setMessage('Recognition failed: Student not recognized.');
                setTimeout(() => {
                    setStatus('verifying');
                    setBlinkCount(0); // Reset blinks to retry
                }, 3000);
            }
        } catch (error) {
            setStatus('error');
            setMessage('Error: ' + (error.response?.data?.detail || error.message));
        }
    }, [webcamRef]);


    return (
        <div className="flex flex-col items-center w-full animate-fade-in">
            <h2 className="text-xl font-semibold mb-6 text-white text-center">Smart Attendance</h2>

            <div className="relative w-full aspect-video bg-black/50 rounded-lg overflow-hidden border-2 border-dashed border-[var(--glass-border)] mb-6 shadow-inner flex items-center justify-center">
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
                        {blinkCount < 3 ? "PLEASE BLINK EYES" : "VERIFIED"}
                    </div>
                )}
            </div>

            <div className="w-full mb-6">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--success)] transition-all duration-300"
                        style={{ width: `${(blinkCount / 3) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Manual Trigger (Fallback or after liveness) */}
            <button
                onClick={autoLogin}
                disabled={blinkCount < 3 || status === 'login_processing'}
                className={`btn-primary mb-6 flex items-center justify-center gap-2 ${blinkCount < 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {status === 'login_processing' ? 'Authenticating...' : 'Mark Attendance'}
            </button>

            {message && (
                <div className={`w-full p-3 rounded-lg mb-6 text-sm font-medium text-center ${status === 'success' ? 'bg-green-500/20 text-green-200 border border-green-500/30' :
                    status === 'error' ? 'bg-red-500/20 text-red-200 border border-red-500/30' :
                        'bg-blue-500/20 text-blue-200'
                    }`}>
                    {message}
                </div>
            )}

            <div className="text-center w-full pt-4 border-t border-[var(--glass-border)]">
                <span className="text-[var(--text-secondary)] text-sm">New Student? </span>
                <Link to="/register" className="text-[var(--accent-color)] hover:text-white font-medium text-sm transition-colors">
                    Register Here
                </Link>
            </div>
        </div>
    );
};

export default Login;
