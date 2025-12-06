import React, { useState, useEffect } from 'react';

interface EmailVerificationPageProps {
  email: string;
  onVerify: (code: string) => void;
  loading: boolean;
  error: string;
}

const EmailVerificationPage: React.FC<EmailVerificationPageProps> = ({
  email,
  onVerify,
  loading,
  error,
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
    return `${name. charAt(0)}${'*'.repeat(name.length - 2)}${name.charAt(name.length - 1)}@${domain}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e. preventDefault();
    onVerify(code);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-1 bg-gradient-to-r from-green-500 to-blue-600">
          <h1 className="text-2xl font-bold text-white text-center py-4">
            Verify Email
          </h1>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Verification code sent to:</p>
            <p className="text-lg font-semibold text-gray-800">{maskEmail(email)}</p>
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value. replace(/\D/g, ''). slice(0, 6))}
                maxLength={6}
                required
                disabled={loading}
                className="w-full px-4 py-3 text-center text-2xl letter-spacing tracking-widest border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <div className="text-center text-sm text-gray-600">
              Code expires in: <span className="font-bold text-red-600">{minutes}:{seconds.toString().padStart(2, '0')}</span>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ?  'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Didn't receive the code? <button className="text-blue-600 hover:underline">Resend</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;