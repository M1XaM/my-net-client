import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
}

const Captcha: React.FC<CaptchaProps> = ({ onVerify }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let text = '';
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    setUserInput('');
    setIsVerified(false);
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (userInput.length === 6) {
      const verified = userInput === captchaText;
      setIsVerified(verified);
      onVerify(verified);
    } else {
      setIsVerified(false);
      onVerify(false);
    }
  }, [userInput, captchaText]);

  const drawCaptcha = () => {
    return (
      <div className="relative w-full h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-300">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-gray-600"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
        
        {/* Captcha text with distortion */}
        <div className="relative flex items-center justify-center gap-1">
          {captchaText.split('').map((char, index) => (
            <span
              key={index}
              className="font-bold text-2xl select-none"
              style={{
                transform: `rotate(${(Math.random() - 0.5) * 20}deg) skewX(${(Math.random() - 0.5) * 10}deg)`,
                color: `hsl(${Math.random() * 360}, 70%, 40%)`,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                display: 'inline-block',
                padding: '0 2px',
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Noise lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {[...Array(5)].map((_, i) => (
            <line
              key={i}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke={`hsl(${Math.random() * 360}, 50%, 50%)`}
              strokeWidth="1"
              opacity="0.3"
            />
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Verify you're human
      </label>
      
      {/* Captcha Display */}
      <div className="flex gap-2">
        {drawCaptcha()}
        <button
          type="button"
          onClick={generateCaptcha}
          className="flex-shrink-0 w-16 h-16 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center group"
          title="Generate new captcha"
        >
          <RefreshCw className="w-5 h-5 text-gray-600 group-hover:rotate-180 transition-transform duration-300" />
        </button>
      </div>

      {/* Input */}
      <div>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value.slice(0, 6))}
          placeholder="Enter the code above"
          maxLength={6}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
            userInput.length === 6
              ? isVerified
                ? 'border-green-500 bg-green-50 focus:ring-2 focus:ring-green-500'
                : 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500'
              : 'border-gray-300 focus:ring-2 focus:ring-[#7B61FF] focus:border-transparent'
          }`}
        />
        {userInput.length === 6 && (
          <p className={`mt-2 text-sm ${isVerified ? 'text-green-600' : 'text-red-600'}`}>
            {isVerified ? '✓ Verification successful' : '✗ Code does not match. Try again.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default Captcha;
