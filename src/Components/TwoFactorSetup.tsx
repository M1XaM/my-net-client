import React, { useState, useEffect } from 'react';

interface TwoFactorSetupProps {
  accessToken: string;
  onClose: () => void;
  onSuccess: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ accessToken, onClose, onSuccess }) => {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'scan' | 'verify'>('scan');


  // lkjlk
  useEffect(() => {
    // Get QR code from server
    fetch('https://localhost/api/2fa/setup', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      credentials: 'include'
    })
      .then(res => res.json())
      . then(data => {
        setQrCode(data.qr_code);
        setSecret(data.secret);
      })
      .catch(err => setError('Failed: ' + err.message));
  }, [accessToken]);

  const handleVerify = async () => {
    setError('');
    try {
      const res = await fetch('https://localhost/api/2fa/enable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ token: verifyCode })
      });

      if (!res.ok) throw new Error('Invalid code');
      
      onSuccess();
      alert('2FA enabled! ');
      onClose();
    } catch (err) {
      setError('Invalid code, try again');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#7B61FF] rounded-xl flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Setup 2FA</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
              <span className="text-red-600 text-xs font-bold">!</span>
            </div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {step === 'scan' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-700 mb-4 font-medium">Step 1: Scan QR Code</p>
              <p className="text-sm text-gray-600 mb-6">Use Google Authenticator or Authy to scan this code</p>
              {qrCode && (
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                </div>
              )}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-2">Or enter manually:</p>
                <code className="bg-white px-3 py-2 rounded border border-purple-200 text-sm font-mono text-[#7B61FF] font-semibold">{secret}</code>
              </div>
            </div>
            <button
              onClick={() => setStep('verify')}
              className="w-full bg-[#7B61FF] text-white py-3 rounded-lg font-semibold hover:bg-[#6951E0] transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Next Step
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-700 mb-2 font-medium">Step 2: Verify Code</p>
              <p className="text-sm text-gray-600 mb-6">Enter the 6-digit code from your authenticator app</p>
            </div>
            <input
              type="text"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              placeholder="000000"
              className="w-full px-4 py-4 text-center text-3xl tracking-[0.5em] font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:border-transparent transition-all"
              style={{ letterSpacing: '0.5em' }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setStep('scan')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleVerify}
                disabled={verifyCode.length !== 6}
                className="flex-1 bg-[#7B61FF] text-white py-3 rounded-lg font-semibold hover:bg-[#6951E0] transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Enable 2FA
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;