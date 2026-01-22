import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import GoogleLoginButton from "./loginButton";
import Captcha from "../Components/Captcha";
import PasswordStrength from "../Components/PasswordStrength";
import GraphBackground from "../Components/GraphBackground";

interface AuthPageProps {
  onLogin: (formData: { username: string; password: string; totpCode?: string }) => void;
  onRegister: (formData: { username: string; password: string; email: string }) => void;
  loading: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({
  onLogin,
  onRegister,
  loading,
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
    totpCode: "",
    rememberMe: false
  });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    email: "",
  });
  const [loginCaptchaVerified, setLoginCaptchaVerified] = useState(false);
  const [registerCaptchaVerified, setRegisterCaptchaVerified] = useState(false);
  const [registerPasswordValid, setRegisterPasswordValid] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(loginForm);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(registerForm);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] overflow-hidden relative">
      {/* Animated Graph Background */}
      <GraphBackground nodeCount={40} />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#7B61FF]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#5B47CC]/10 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Glass Card */}
          <div className="backdrop-blur-xl bg-white/[0.05] border border-white/[0.1] rounded-3xl shadow-2xl p-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-[#7B61FF] to-[#5B47CC] rounded-2xl flex justify-center items-center text-white font-bold text-2xl shadow-lg shadow-[#7B61FF]/25">
                M
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-gray-400 text-sm">
                {isLogin ? "Sign in to continue to MyNet" : "Sign up to get started with MyNet"}
              </p>
            </div>

            {/* Login Form */}
            {isLogin ? (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    required
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/50 focus:border-transparent transition-all"
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      disabled={loading}
                      className="w-full px-4 py-3 pr-12 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/50 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="totpCode" className="block text-sm font-medium text-gray-300 mb-2">
                    2FA Code <span className="text-gray-500">(if enabled)</span>
                  </label>
                  <input
                    id="totpCode"
                    type="text"
                    value={loginForm.totpCode}
                    onChange={(e) => setLoginForm({ ...loginForm, totpCode: e.target.value })}
                    disabled={loading}
                    maxLength={6}
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/50 focus:border-transparent transition-all font-mono tracking-widest"
                    placeholder="000000"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={loginForm.rememberMe}
                      onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                      className="w-4 h-4 bg-white/[0.05] border-white/[0.2] rounded text-[#7B61FF] focus:ring-[#7B61FF]/50 focus:ring-offset-0"
                    />
                    <span className="ml-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
                  </label>
                </div>

                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                  <Captcha onVerify={setLoginCaptchaVerified} />
                </div>

                <button
                  type="submit"
                  disabled={loading || !loginCaptchaVerified}
                  className="w-full bg-gradient-to-r from-[#7B61FF] to-[#5B47CC] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#7B61FF]/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : "Sign In"}
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div>
                  <label htmlFor="reg-username" className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    id="reg-username"
                    type="text"
                    required
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/50 focus:border-transparent transition-all"
                    placeholder="Choose a username"
                  />
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/50 focus:border-transparent transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showRegisterPassword ? "text" : "password"}
                      required
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      disabled={loading}
                      className="w-full px-4 py-3 pr-12 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/50 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="mt-2">
                    <PasswordStrength 
                      password={registerForm.password} 
                      onStrengthChange={(_, isValid) => setRegisterPasswordValid(isValid)}
                    />
                  </div>
                </div>

                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                  <Captcha onVerify={setRegisterCaptchaVerified} />
                </div>

                <button
                  type="submit"
                  disabled={loading || !registerCaptchaVerified || !registerPasswordValid}
                  className="w-full bg-gradient-to-r from-[#7B61FF] to-[#5B47CC] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#7B61FF]/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating account...
                    </span>
                  ) : "Sign Up"}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.1]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="flex justify-center">
              <GoogleLoginButton />
            </div>

            {/* Toggle between Login/Register */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setLoginCaptchaVerified(false);
                    setRegisterCaptchaVerified(false);
                    setRegisterPasswordValid(false);
                  }}
                  className="text-[#7B61FF] font-semibold hover:text-[#9B8AFF] transition-colors"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </div>

          {/* Bottom text */}
          <p className="text-center text-gray-600 text-xs mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
