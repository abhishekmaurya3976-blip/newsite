// app/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/contexts/AuthContext';
import {
  User,
  Mail,
  Smartphone,
  Lock,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Info,
  AlertCircle
} from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { user, register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    // Calculate password strength
    if (formData.password) {
      let strength = 0;
      if (formData.password.length >= 6) strength += 1;
      if (/[A-Z]/.test(formData.password)) strength += 1;
      if (/[0-9]/.test(formData.password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        return '';
      
      case 'email':
        if (value && !/\S+@\S+\.\S+/.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';
      
      case 'phone':
        const phoneRegex = /^[0-9]{10}$/;
        if (!value) return 'Phone number is required';
        if (!phoneRegex.test(value)) return 'Please enter a valid 10-digit phone number';
        return '';
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let newValue = value;
    if (name === 'phone') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    setFormData({
      ...formData,
      [name]: newValue,
    });

    // Validate field on change if it's been touched
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      if (key === 'email' || key === 'address') return; // Optional fields
      
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);
      
      if (!result.success) {
        setErrors({ submit: result.message });
      }
    } catch (err: any) {
      setErrors({ submit: err.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return 'bg-gray-200';
      case 1: return 'bg-red-400';
      case 2: return 'bg-yellow-400';
      case 3: return 'bg-blue-400';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return 'Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return 'Weak';
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-r from-amber-400/5 to-orange-400/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-96 h-96 bg-gradient-to-r from-yellow-400/5 to-amber-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/3 w-80 h-80 bg-gradient-to-r from-orange-400/5 to-rose-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl shadow-amber-100/50 border border-amber-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 border-b border-amber-100">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Sparkles className="w-7 h-7 text-amber-500" />
              <h1 className="text-3xl font-bold text-gray-900 font-playfair">Create Your Account</h1>
              <Sparkles className="w-7 h-7 text-amber-500" />
            </div>
            <p className="text-center text-gray-600 text-lg">Fill in your details to get started</p>
          </div>

          <div className="p-8">
            {errors.submit && (
              <div className="mb-8 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center mt-0.5">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-1">Registration Failed</p>
                    <p className="text-sm text-gray-600">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-5 h-5 text-amber-600" />
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-900">
                        Full Name *
                      </label>
                      {errors.name && (
                        <span className="text-xs text-rose-600 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Required
                        </span>
                      )}
                    </div>
                    <div className={`relative group ${errors.name ? 'animate-shake' : ''}`}>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3.5 bg-white border-2 ${errors.name ? 'border-rose-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-400/30 focus:border-amber-400 text-gray-900 placeholder-gray-500 transition-all duration-300 group-hover:border-amber-300`}
                        placeholder="Enter your full name"
                      />
                      {!errors.name && formData.name && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                    </div>
                    {errors.name && (
                      <p className="text-sm text-rose-600 mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                      Email Address (Optional)
                    </label>
                    <div className="relative group">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3.5 bg-white border-2 ${errors.email ? 'border-rose-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-400/30 focus:border-amber-400 text-gray-900 placeholder-gray-500 transition-all duration-300 group-hover:border-amber-300`}
                        placeholder="your@email.com"
                      />
                      {!errors.email && formData.email && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                    </div>
                    {errors.email && (
                      <p className="text-sm text-rose-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-900">
                        Phone Number *
                      </label>
                      {errors.phone && (
                        <span className="text-xs text-rose-600 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Required
                        </span>
                      )}
                    </div>
                    <div className={`relative group ${errors.phone ? 'animate-shake' : ''}`}>
                      <div className="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center">
                        <span className="text-gray-700 font-semibold">+91</span>
                        <div className="absolute right-0 w-px h-1/2 bg-gradient-to-b from-gray-300 to-transparent"></div>
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={10}
                        className={`w-full pl-20 pr-4 py-3.5 bg-white border-2 ${errors.phone ? 'border-rose-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-400/30 focus:border-amber-400 text-gray-900 placeholder-gray-500 transition-all duration-300 group-hover:border-amber-300`}
                        placeholder="Enter 10-digit number"
                      />
                      {!errors.phone && formData.phone && formData.phone.length === 10 && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <Info className="w-3 h-3 mr-1" />
                      You'll use this number to log in
                    </p>
                    {errors.phone && (
                      <p className="text-sm text-rose-600 mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-900">
                      Address (Optional)
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      rows={3}
                      className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-400/30 focus:border-amber-400 text-gray-900 placeholder-gray-500 transition-all duration-300 resize-none"
                      placeholder="Your shipping address"
                    />
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Lock className="w-5 h-5 text-amber-600" />
                  <h2 className="text-xl font-bold text-gray-900">Security</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-900">
                        Password *
                      </label>
                      {errors.password && (
                        <span className="text-xs text-rose-600 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Required
                        </span>
                      )}
                    </div>
                    <div className={`relative group ${errors.password ? 'animate-shake' : ''}`}>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 pr-12 py-3.5 bg-white border-2 ${errors.password ? 'border-rose-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-400/30 focus:border-amber-400 text-gray-900 placeholder-gray-500 transition-all duration-300 group-hover:border-amber-300`}
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-600 transition-colors duration-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">Password strength</span>
                          <span className={`text-xs font-bold ${passwordStrength === 0 ? 'text-red-500' : passwordStrength === 1 ? 'text-red-500' : passwordStrength === 2 ? 'text-yellow-500' : passwordStrength === 3 ? 'text-blue-500' : 'text-green-500'}`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getPasswordStrengthColor()} transition-all duration-500`}
                            style={{ width: `${(passwordStrength / 4) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`flex-1 h-1 rounded-full ${passwordStrength >= level ? getPasswordStrengthColor() : 'bg-gray-200'}`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {errors.password && (
                      <p className="text-sm text-rose-600 mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900">
                        Confirm Password *
                      </label>
                      {errors.confirmPassword && (
                        <span className="text-xs text-rose-600 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Required
                        </span>
                      )}
                    </div>
                    <div className={`relative group ${errors.confirmPassword ? 'animate-shake' : ''}`}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 pr-12 py-3.5 bg-white border-2 ${errors.confirmPassword ? 'border-rose-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-400/30 focus:border-amber-400 text-gray-900 placeholder-gray-500 transition-all duration-300 group-hover:border-amber-300`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-600 transition-colors duration-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <p className="text-sm text-green-600 mt-1 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Passwords match
                      </p>
                    )}
                    {errors.confirmPassword && (
                      <p className="text-sm text-rose-600 mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Info className="w-5 h-5 text-amber-600" />
                    <span>Password Requirements</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${formData.password.length >= 6 ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {formData.password.length >= 6 ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        )}
                      </div>
                      <span className={`text-sm ${formData.password.length >= 6 ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                        At least 6 characters
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${/[A-Z]/.test(formData.password) ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {/[A-Z]/.test(formData.password) ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        )}
                      </div>
                      <span className={`text-sm ${/[A-Z]/.test(formData.password) ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${/[0-9]/.test(formData.password) ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {/[0-9]/.test(formData.password) ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        )}
                      </div>
                      <span className={`text-sm ${/[0-9]/.test(formData.password) ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                        One number
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${/[^A-Za-z0-9]/.test(formData.password) ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {/[^A-Za-z0-9]/.test(formData.password) ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        )}
                      </div>
                      <span className={`text-sm ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                        One special character
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Submit */}
              <div className="space-y-8 pt-6 border-t border-gray-200">
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="w-5 h-5 rounded border-2 border-gray-300 text-amber-600 focus:ring-amber-500 focus:ring-offset-0 focus:ring-2 transition-all duration-300 mt-1 flex-shrink-0"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" className="text-amber-600 hover:text-amber-700 font-semibold underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-amber-600 hover:text-amber-700 font-semibold underline">
                      Privacy Policy
                    </Link>
                    . By creating an account, I acknowledge that I have read and agree to the terms and conditions.
                  </label>
                </div>

                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl py-5 px-6 font-bold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-amber-300/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <div className="relative flex items-center justify-center space-x-3">
                      {loading ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                        </>
                      )}
                    </div>
                  </button>

                  <div className="text-center pt-4">
                    <p className="text-gray-600">
                      Already have an account?{' '}
                      <Link href="/login" className="text-amber-600 hover:text-amber-700 font-bold">
                        Sign In
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Add CSS for shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}