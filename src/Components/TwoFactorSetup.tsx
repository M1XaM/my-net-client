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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Setup 2FA</h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

        {step === 'scan' && (
          <div className="space-y-4">
            <p>1.  Scan this QR code with Google Authenticator or Authy:</p>
            {qrCode && <img src={qrCode} alt="QR Code" className="mx-auto" />}
            <p className="text-sm">Or enter manually: <code className="bg-gray-100 px-2 py-1">{secret}</code></p>
            <button
              onClick={() => setStep('verify')}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Next
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <p>2. Enter the 6-digit code from your app:</p>
            <input
              type="text"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value. replace(/\D/g, ''))}
              maxLength={6}
              placeholder="123456"
              className="w-full px-4 py-2 text-center text-2xl border rounded tracking-widest"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => setStep('scan')}
                className="flex-1 bg-gray-300 py-2 rounded"
              >
                Back
              </button>
              <button
                onClick={handleVerify}
                disabled={verifyCode.length !== 6}
                className="flex-1 bg-green-600 text-white py-2 rounded disabled:opacity-50"
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