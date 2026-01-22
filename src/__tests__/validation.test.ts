import { describe, it, expect } from 'vitest';
import { validatePassword, validateEmail, validateUsername, truncateText } from '../utils/validation';

describe('validatePassword', () => {
  it('should return weak strength for empty password', () => {
    const result = validatePassword('');
    expect(result.strength).toBe(0);
    expect(result.isValid).toBe(false);
  });

  it('should return weak strength for short password', () => {
    const result = validatePassword('abc');
    expect(result.strength).toBeLessThan(4);
    expect(result.isValid).toBe(false);
  });

  it('should detect uppercase letters', () => {
    const result = validatePassword('Password');
    expect(result.requirements.hasUppercase).toBe(true);
    expect(result.requirements.hasLowercase).toBe(true);
  });

  it('should detect numbers', () => {
    const result = validatePassword('password123');
    expect(result.requirements.hasNumber).toBe(true);
  });

  it('should detect special characters', () => {
    const result = validatePassword('password!');
    expect(result.requirements.hasSpecialChar).toBe(true);
  });

  it('should return valid for strong password', () => {
    const result = validatePassword('Password123!');
    expect(result.strength).toBeGreaterThanOrEqual(4);
    expect(result.isValid).toBe(true);
  });

  it('should check minimum length requirement', () => {
    const shortResult = validatePassword('Pass1!');
    const longResult = validatePassword('Password1!');
    expect(shortResult.requirements.minLength).toBe(false);
    expect(longResult.requirements.minLength).toBe(true);
  });
});

describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.org')).toBe(true);
    expect(validateEmail('user+tag@example.co.uk')).toBe(true);
  });

  it('should return false for invalid email', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('missing@domain')).toBe(false);
    expect(validateEmail('@nodomain.com')).toBe(false);
    expect(validateEmail('spaces in@email.com')).toBe(false);
  });
});

describe('validateUsername', () => {
  it('should return valid for proper username', () => {
    expect(validateUsername('john_doe').isValid).toBe(true);
    expect(validateUsername('User123').isValid).toBe(true);
    expect(validateUsername('abc').isValid).toBe(true);
  });

  it('should return invalid for too short username', () => {
    const result = validateUsername('ab');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('at least 3 characters');
  });

  it('should return invalid for too long username', () => {
    const result = validateUsername('a'.repeat(21));
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('at most 20 characters');
  });

  it('should return invalid for username with special characters', () => {
    const result = validateUsername('user@name');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('letters, numbers, and underscores');
  });
});

describe('truncateText', () => {
  it('should not truncate short text', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('should truncate long text with ellipsis', () => {
    expect(truncateText('Hello World!', 8)).toBe('Hello...');
  });

  it('should handle exact length', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });

  it('should handle empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });
});
