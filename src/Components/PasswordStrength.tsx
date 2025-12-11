import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  onStrengthChange?: (strength: number, isValid: boolean) => void;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, onStrengthChange }) => {
  const requirements: Requirement[] = [
    { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
    { label: 'Contains uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
    { label: 'Contains lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
    { label: 'Contains number', test: (pwd) => /\d/.test(pwd) },
    { label: 'Contains special character (!@#$%^&*)', test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
  ];

  const metRequirements = requirements.filter(req => req.test(password));
  const strength = metRequirements.length;
  const isValid = strength >= 4; // At least 4 out of 5 requirements

  React.useEffect(() => {
    if (onStrengthChange) {
      onStrengthChange(strength, isValid);
    }
  }, [strength, isValid, onStrengthChange]);

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-gray-200';
    if (strength <= 2) return 'bg-red-500';
    if (strength === 3) return 'bg-yellow-500';
    if (strength === 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength === 0) return '';
    if (strength <= 2) return 'Weak';
    if (strength === 3) return 'Fair';
    if (strength === 4) return 'Good';
    return 'Strong';
  };

  const getStrengthTextColor = () => {
    if (strength <= 2) return 'text-red-600';
    if (strength === 3) return 'text-yellow-600';
    if (strength === 4) return 'text-blue-600';
    return 'text-green-600';
  };

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Password Strength</span>
          {getStrengthText() && (
            <span className={`text-xs font-semibold ${getStrengthTextColor()}`}>
              {getStrengthText()}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                level <= strength ? getStrengthColor() : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements List */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <p className="text-xs font-medium text-gray-700 mb-2">Password requirements:</p>
        {requirements.map((req, index) => {
          const isMet = req.test(password);
          return (
            <div key={index} className="flex items-center gap-2">
              <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                isMet ? 'bg-green-100' : 'bg-gray-200'
              }`}>
                {isMet ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <X className="w-3 h-3 text-gray-400" />
                )}
              </div>
              <span className={`text-xs ${isMet ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Validation Message */}
      {password.length > 0 && (
        <div className={`text-xs font-medium ${isValid ? 'text-green-600' : 'text-orange-600'}`}>
          {isValid ? '✓ Password meets security requirements' : '⚠ Please meet at least 4 requirements'}
        </div>
      )}
    </div>
  );
};

export default PasswordStrength;
