import { useState, useRef } from 'react';
import { Camera, Upload, RotateCcw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CameraCapture({ onCapture }) {
  const [mode, setMode] = useState('select');
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const streamRef = useRef(null);

  // Callback ref: sets srcObject the moment the video element mounts in the DOM
  const videoCallbackRef = (el) => {
    videoRef.current = el;
    if (el && streamRef.current) {
      el.srcObject = streamRef.current;
      el.play().catch(() => {});
    }
  };

  const startCamera = async () => {
    setError('');
    try {
      const ms = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = ms;
      setStream(ms);
      setMode('camera');
    } catch (err) {
      const msg = err.name === 'NotAllowedError'
        ? 'Bạn chưa cho phép truy cập camera. Hãy thử tải ảnh lên.'
        : 'Không thể truy cập camera. Hãy thử tải ảnh lên.';
      setError(msg);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setStream(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    const dataUrl = c.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
    setMode('preview');
    onCapture(dataUrl);
  };

  const retake = () => { setCapturedImage(null); setMode('select'); };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) { setError('Chỉ chấp nhận file ảnh'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setCapturedImage(ev.target.result); setMode('preview'); onCapture(ev.target.result); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full">
      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence mode="wait">
        {mode === 'select' && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="border-2 border-dashed border-orange-200 rounded-2xl p-8 text-center bg-orange-50">
            <div className="text-5xl mb-3">📸</div>
            <p className="text-gray-500 text-sm mb-4">Chụp ảnh bằng chứng hoàn thành nhiệm vụ</p>
            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
            <div className="flex gap-3 justify-center">
              <button onClick={startCamera} className="btn-orange flex items-center gap-2">
                <Camera size={16} /> Camera
              </button>
              <button onClick={() => fileRef.current?.click()}
                className="bg-white border-2 border-orange-200 text-orange-primary font-bold py-2 px-4 rounded-full flex items-center gap-2 text-sm">
                <Upload size={16} /> Tải lên
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </motion.div>
        )}

        {mode === 'camera' && (
          <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative rounded-2xl overflow-hidden bg-black">
            <video ref={videoCallbackRef} autoPlay playsInline muted className="w-full max-h-80 object-cover" />
            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4">
              <button onClick={retake} className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm flex items-center gap-1">
                <RotateCcw size={14} /> Hủy
              </button>
              <button onClick={capturePhoto} className="bg-white text-gray-800 font-bold px-6 py-2 rounded-full flex items-center gap-2 text-sm">
                <Camera size={16} /> Chụp
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'preview' && capturedImage && (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-2xl overflow-hidden">
            <img src={capturedImage} alt="Proof" className="w-full max-h-80 object-cover" />
            <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check size={18} className="text-white" />
            </div>
            <button onClick={retake}
              className="absolute bottom-3 left-3 bg-black/50 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1">
              <RotateCcw size={12} /> Chụp lại
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}