import React, { useState } from 'react';
import { Box, Lock, User, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const DEMO_USERS = [
    { username: 'admin', password: 'admin123', role: 'Admin' },
    { username: 'manager', password: 'manager123', role: 'Manager' },
    { username: 'staff', password: 'staff123', role: 'Staff' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    const user = DEMO_USERS.find(
      u => u.username.toLowerCase() === trimmedUsername.toLowerCase() && u.password === trimmedPassword
    );

    if (user) {
      localStorage.setItem('satyam_mall_user', JSON.stringify({
        username: user.username,
        role: user.role,
        loginTime: new Date().toISOString()
      }));
      onLogin(user.username);
    } else {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-float">
          <div className="inline-flex items-center justify-center p-5 rounded-3xl glass-card shadow-glow mb-4">
            <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-4 rounded-2xl">
              <Box className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold gradient-text tracking-tight">SATYAM MALL</h1>
          <p className="text-primary-400 font-medium text-sm tracking-wider uppercase mt-2 flex items-center justify-center gap-2">
            <Sparkles size={14} />
            Inventory Management System
            <Sparkles size={14} />
          </p>
          <p className="text-dark-400 text-xs mt-1">Since 1989</p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-3xl shadow-glass-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-primary-100 text-sm mt-1">Sign in to manage inventory</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-3 text-dark-400" size={20} />
                <input
                  type="text"
                  required
                  placeholder="Enter username"
                  className="w-full pl-12 pr-4 py-3 input-glass rounded-xl text-white"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 text-dark-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  className="w-full pl-12 pr-14 py-3 input-glass rounded-xl text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-dark-400 hover:text-primary-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-glossy text-white font-bold py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-3" size={22} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="px-8 pb-8">
            <div className="glass rounded-xl p-4">
              <p className="text-xs font-bold text-dark-400 uppercase mb-3 flex items-center gap-2">
                <Sparkles size={12} className="text-accent-400" />
                Demo Credentials
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-dark-300">
                  <span className="text-primary-400 font-medium">Admin:</span>
                  <span className="font-mono">admin / admin123</span>
                </div>
                <div className="flex justify-between text-dark-300">
                  <span className="text-primary-400 font-medium">Manager:</span>
                  <span className="font-mono">manager / manager123</span>
                </div>
                <div className="flex justify-between text-dark-300">
                  <span className="text-primary-400 font-medium">Staff:</span>
                  <span className="font-mono">staff / staff123</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-dark-500 text-xs mt-8">
          &copy; {new Date().getFullYear()} Satyam Mall Facility Management
        </p>
      </div>
    </div>
  );
};

export default Login;
