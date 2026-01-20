// app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/contexts/AuthContext';
import { 
  Smartphone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    try {
      const result = await login(phone, password);
      
      if (result.success) {
        router.push('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-amber-400/5 to-orange-400/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-gradient-to-r from-yellow-400/5 to-amber-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-1/4 w-60 h-60 bg-gradient-to-r from-orange-400/5 to-rose-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl shadow-amber-100/50 border border-amber-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 border-b border-amber-100">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <h2 className="text-3xl font-bold text-gray-900 font-playfair">Sign In to Your Account</h2>
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-center text-gray-600">Enter your phone number to continue</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sign In Failed</p>
                    <p className="text-sm text-gray-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Phone Input */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-900">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center">
                    <span className="text-gray-700 font-semibold">+91</span>
                    <div className="absolute right-0 w-px h-1/2 bg-gradient-to-b from-gray-300 to-transparent"></div>
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-20 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-3 focus:ring-amber-400/30 focus:border-amber-400 text-gray-900 placeholder-gray-500 transition-all duration-300 group-hover:border-amber-300"
                    placeholder="Enter 10-digit number"
                  />
                </div>
                <p className="text-xs text-gray-500">You'll use this number to log in</p>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900">
                  Password
                </label>
                <div className="relative group">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-12 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-3 focus:ring-amber-400/30 focus:border-amber-400 text-gray-900 placeholder-gray-500 transition-all duration-300 group-hover:border-amber-300"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-600 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              {/* <div className="text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors duration-300"
                >
                  Forgot password?
                </Link>
              </div> */}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl py-5 px-6 font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-amber-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-amber-600 hover:text-amber-700 font-semibold">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}