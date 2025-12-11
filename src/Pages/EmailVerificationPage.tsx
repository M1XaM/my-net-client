import React, { useState, useEffect } from 'react';
import { Mail, Clock, CheckCircle2 } from 'lucide-react';

interface EmailVerificationPageProps {
  email: string;
  onVerify: (code: string) => void;
  loading: boolean;
}

const EmailVerificationPage: React.FC<EmailVerificationPageProps> = ({
  email,
  onVerify,
  loading,
}) => {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const maskEmail = (email: string) => {
    const [name, domain] = email.split('@');
    return `${name.charAt(0)}${'*'.repeat(name.length - 2)}${name.charAt(name.length - 1)}@${domain}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(code);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#7B61FF] to-[#5B47CC] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-[#7B61FF] rounded-2xl flex justify-center items-center text-white">
            <Mail className="w-8 h-8" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-500 mb-4">
            We've sent a verification code to
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
            <Mail className="w-4 h-4 text-[#7B61FF]" />
            <span className="text-sm font-medium text-gray-800">{maskEmail(email)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
              disabled={loading}
              className="w-full px-4 py-4 text-center text-3xl tracking-[0.5em] font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500"
              style={{ letterSpacing: '0.5em' }}
            />
            <p className="mt-2 text-xs text-gray-500 text-center">
              Enter the 6-digit code from your email
            </p>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">
              Code expires in: 
              <span className={`ml-1 font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6 || timeLeft === 0}
            className="w-full bg-[#7B61FF] text-white py-3 rounded-lg font-semibold hover:bg-[#6951E0] transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Verify Email
              </>
            )}
          </button>
        </form>

        {/* Resend Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button 
              type="button"
              className="text-[#7B61FF] font-semibold hover:text-[#6951E0] transition-colors"
              onClick={() => window.location.reload()}
            >
              Resend code
            </button>
          </p>
        </div>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Check your spam folder if you don't see the email in your inbox
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;