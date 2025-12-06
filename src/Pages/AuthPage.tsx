import React, { useState } from "react";
import GoogleLoginButton from "./loginButton";

interface AuthPageProps {
  onLogin: (formData: { username: string; password: string }) => void;
  onRegister: (formData: { username: string; password: string }) => void;
  loading: boolean;
  error: string;
}

const AuthPage: React.FC<AuthPageProps> = ({
  onLogin,
  onRegister,
  loading,
  error,
}) => {
const [loginForm, setLoginForm] = useState({
  username: "",
  password: "",
  totpCode: ""  // NEW
});
const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(loginForm);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(registerForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600">
          <h1 className="text-2xl font-bold text-white text-center py-4">
            Welcome to ChatApp
          </h1>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* ---- LOGIN SECTION ---- */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Login</h2>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, username: e.target.value })
                  }
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <input
                type="text"
                placeholder="2FA Code (if enabled)"
                value={loginForm. totpCode}
                onChange={(e) => setLoginForm({ ...loginForm, totpCode: e.target.value })}
                maxLength={6}
                className="w-full px-4 py-2 border rounded"
              />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* ✅ Google login integration */}
            <div className="mt-6 flex justify-center">
              <GoogleLoginButton />
            </div>
          </div>

          {/* ---- REGISTER SECTION ---- */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Register
            </h2>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={registerForm.username}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      username: e.target.value,
                    })
                  }
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value,
                    })
                  }
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
