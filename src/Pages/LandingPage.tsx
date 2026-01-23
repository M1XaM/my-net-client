import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0a0f] text-white relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#7B61FF]/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#5B47CC]/20 rounded-full blur-[128px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7B61FF]/5 rounded-full blur-[100px]" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(123, 97, 255, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(123, 97, 255, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col overflow-y-auto">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7B61FF] to-[#5B47CC] rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-[#7B61FF]/25">
              M
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              MyNet
            </span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-medium text-sm transition-all hover:scale-105"
          >
            Sign In
          </button>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex items-center px-8 lg:px-16 py-12">
          <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Text */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#7B61FF]/10 border border-[#7B61FF]/20 rounded-full text-sm text-[#7B61FF]">
                <span className="w-2 h-2 bg-[#7B61FF] rounded-full animate-pulse" />
                Real-time collaboration platform
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Where Ideas
                <span className="block bg-gradient-to-r from-[#7B61FF] via-[#9D8AFF] to-[#5B47CC] bg-clip-text text-transparent">
                  Come to Life
                </span>
              </h1>

              <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
                A next-generation chat platform built for developers, students, and teams.
                Share code, render formulas, draw diagrams — all in real-time.
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={onGetStarted}
                  className="group px-8 py-4 bg-gradient-to-r from-[#7B61FF] to-[#5B47CC] rounded-xl font-semibold text-lg shadow-xl shadow-[#7B61FF]/25 hover:shadow-[#7B61FF]/40 transition-all hover:scale-105 flex items-center gap-2"
                >
                  Get Started Free
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <div className="text-sm text-gray-500">
                  <span className="text-white font-semibold">100%</span> Free Forever
                </div>
              </div>
            </div>

              {/* Right Side - Feature Cards */}
              <div className="hidden lg:grid grid-cols-2 gap-4">
                {/* Code Feature */}
                <div className="group p-5 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-2xl hover:border-[#7B61FF]/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-[#7B61FF]/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Live Code Execution</h3>
                  <p className="text-sm text-gray-400">Write, share, and run Python code directly in chat with instant output.</p>
                  <div className="mt-4 p-3 bg-black/40 rounded-lg font-mono text-xs text-emerald-400 overflow-hidden">
                    <span className="text-gray-500">{'>>>'}</span> print("Hello!")
                    <br />
                    <span className="text-white">Hello!</span>
                  </div>
                </div>

                {/* LaTeX Feature */}
                <div className="group p-5 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-2xl hover:border-[#7B61FF]/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-[#7B61FF]/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">LaTeX Formulas</h3>
                  <p className="text-sm text-gray-400">Render beautiful mathematical equations with full LaTeX support.</p>
                  <div className="mt-4 p-3 bg-black/40 rounded-lg text-center">
                    <span className="text-blue-300 italic text-lg">E = mc²</span>
                  </div>
                </div>

                {/* Markdown Feature */}
                <div className="group p-5 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-2xl hover:border-[#7B61FF]/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-[#7B61FF]/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Rich Markdown</h3>
                  <p className="text-sm text-gray-400">Format messages with headers, lists, bold, italic, and more.</p>
                  <div className="mt-4 p-3 bg-black/40 rounded-lg text-sm">
                    <span className="text-purple-300 font-bold">## Title</span>
                    <br />
                    <span className="text-gray-300">**bold** & *italic*</span>
                  </div>
                </div>

                {/* UML Feature */}
                <div className="group p-5 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-2xl hover:border-[#7B61FF]/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-[#7B61FF]/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">UML Diagrams</h3>
                  <p className="text-sm text-gray-400">Draw and share class diagrams, flowcharts, and system designs.</p>
                  <div className="mt-4 p-3 bg-black/40 rounded-lg flex items-center justify-center gap-2">
                    <div className="w-8 h-6 border border-orange-400/50 rounded text-[8px] flex items-center justify-center text-orange-300">A</div>
                    <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <div className="w-8 h-6 border border-orange-400/50 rounded text-[8px] flex items-center justify-center text-orange-300">B</div>
                  </div>
                </div>

                {/* Image Sharing Feature */}
                <div className="group p-5 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-2xl hover:border-[#7B61FF]/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-[#7B61FF]/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-pink-500/5 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">Secure Images</h3>
                  <p className="text-sm text-gray-400">Share photos with automatic compression and metadata stripping.</p>
                  <div className="mt-4 p-3 bg-black/40 rounded-lg flex items-center justify-center">
                    <div className="flex gap-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded" />
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded" />
                      <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded" />
                    </div>
                  </div>
                </div>

                {/* Security Feature */}
                <div className="group p-5 bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-2xl hover:border-[#7B61FF]/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-[#7B61FF]/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">2FA Security</h3>
                  <p className="text-sm text-gray-400">Protect your account with two-factor authentication and CAPTCHA.</p>
                  <div className="mt-4 p-3 bg-black/40 rounded-lg flex items-center justify-center gap-1 font-mono text-cyan-400 text-lg tracking-widest">
                    <span>●</span><span>●</span><span>●</span><span>●</span><span>●</span><span>●</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="px-8 py-4 flex items-center justify-between text-sm text-gray-500">
            <div>© 2026 MyNet. Built with ❤️</div>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
  );
};

      export default LandingPage;
