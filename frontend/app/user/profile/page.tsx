// app/user/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Edit,
  X,
  Package,
  Heart,
  LogOut,
  ChevronRight,
  Shield,
  Clock,
  Calendar,
  CheckCircle,
  PenTool,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Info,
  Key,
  ShieldCheck,
  Award,
  Star
} from 'lucide-react';
import { useAuth } from '../../components/contexts/AuthContext';

interface ProfileFormData {
  name: string;
  phone: string;
  address: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();
  const currentUser = user as any;

  // States for profile editing
  const [loading, setLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // States for password changing
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || ''
      });
    }
  }, [currentUser]);

  // Password strength calculation
  useEffect(() => {
    if (passwordForm.newPassword) {
      let strength = 0;
      if (passwordForm.newPassword.length >= 6) strength += 1;
      if (/[A-Z]/.test(passwordForm.newPassword)) strength += 1;
      if (/[0-9]/.test(passwordForm.newPassword)) strength += 1;
      if (/[^A-Za-z0-9]/.test(passwordForm.newPassword)) strength += 1;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [passwordForm.newPassword]);

  const formatDate = (d?: string | number | Date) => {
    if (!d) return 'Not available';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return 'Not available';
    return dt.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (d?: string | number | Date) => {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '';
    return dt.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const initialsOf = (name?: string) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Profile handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setProfileData(prev => ({
        ...prev,
        [name]: digits,
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const result = await updateProfile(profileData);
      
      if (result.success) {
        setProfileSuccess('Profile updated successfully!');
        setEditing(false);
        setTimeout(() => setProfileSuccess(''), 3500);
      } else {
        setProfileError(result.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Password handlers
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePasswordForm = () => {
    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required');
      return false;
    }
    if (!passwordForm.newPassword) {
      setPasswordError('New password is required');
      return false;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return false;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError('New password must be different from current password');
      return false;
    }
    return true;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    if (!validatePasswordForm()) {
      setChangingPassword(false);
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/change-password`, {
        method: 'PUT', // Changed from POST to PUT
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPasswordSuccess('Password updated successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setPasswordSuccess(''), 3500);
      } else {
        setPasswordError(data.message || 'Failed to update password');
      }
    } catch (err: any) {
      setPasswordError('Failed to update password. Please try again.');
    } finally {
      setChangingPassword(false);
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

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl animate-pulse mx-auto mb-4 flex items-center justify-center">
            <PenTool className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-r from-amber-400/5 to-orange-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-yellow-400/5 to-amber-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8">
            <nav className="flex items-center text-sm text-gray-600">
              <Link href="/" className="hover:text-amber-600 transition-colors duration-300">Home</Link>
              <ChevronRight className="w-4 h-4 mx-3 text-gray-400" />
              <span className="text-gray-900 font-semibold">My Profile</span>
            </nav>
          </div>

          {/* Header with Stats */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2 font-playfair">My Profile</h1>
                <p className="text-gray-600">Manage your personal information and account security</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-50 rounded-xl border border-green-200">
                  <span className="text-sm font-semibold text-green-700 flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Account Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="text-lg font-bold text-gray-900">{formatDate(currentUser.createdAt)}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-amber-500" />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Account Status</p>
                    <p className="text-lg font-bold text-green-600">Active</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Last Login</p>
                    <p className="text-lg font-bold text-gray-900">Today</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {(profileError || profileSuccess || passwordError || passwordSuccess) && (
            <div className={`mb-8 rounded-2xl p-6 border ${
              profileError || passwordError ? 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200' : 
              'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
            }`}>
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  profileError || passwordError ? 'bg-gradient-to-br from-rose-500 to-pink-500' : 
                  'bg-gradient-to-br from-green-500 to-emerald-500'
                }`}>
                  {profileError || passwordError ? (
                    <AlertCircle className="w-6 h-6 text-white" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {profileError || passwordError ? 'Update Failed' : 'Success!'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {profileError || profileSuccess || passwordError || passwordSuccess}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Overview & Quick Actions */}
            <div className="lg:col-span-1 space-y-8">
              {/* Profile Card */}
              <div className="bg-white rounded-3xl border border-amber-100 p-8 shadow-xl shadow-amber-100/50">
                <div className="text-center mb-6">
                  <div className="relative inline-block mb-6">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl mx-auto">
                      <div className="w-full h-full bg-gradient-to-br from-amber-500 via-amber-600 to-orange-500 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold font-playfair">
                          {initialsOf(currentUser.name)}
                        </span>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-2 font-playfair">{currentUser.name}</h2>
                  <div className="space-y-2">
                    <p className="text-gray-600 flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      {currentUser.email || 'No email provided'}
                    </p>
                    <p className="text-gray-600 flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      +91 {currentUser.phone}
                    </p>
                  </div>
                </div>

                {/* Security Status */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">Account Security</span>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      Strong
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:border-rose-300 hover:bg-rose-50 transition-all duration-300 font-semibold group"
                >
                  <LogOut className="w-5 h-5 group-hover:text-rose-600" />
                  Sign Out
                </button>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-3xl border border-amber-100 p-6 shadow-xl shadow-amber-100/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/user/orders" className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-transparent rounded-xl hover:from-amber-100 transition-all duration-300 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Package className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">My Orders</p>
                      <p className="text-xs text-gray-600">Track & manage orders</p>
                    </div>
                  </Link>

                  <Link href="/user/wishlist" className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-transparent rounded-xl hover:from-amber-100 transition-all duration-300 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-pink-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Heart className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">My Wishlist</p>
                      <p className="text-xs text-gray-600">Saved items & favorites</p>
                    </div>
                  </Link>

                </div>
              </div>
            </div>

            {/* Right Column - Profile Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Information Form */}
              <div className="bg-white rounded-3xl border border-amber-100 p-8 shadow-xl shadow-amber-100/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-6 h-6 text-amber-600" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 font-playfair">Personal Information</h2>
                      <p className="text-gray-600">Update your personal details and contact information</p>
                    </div>
                  </div>

                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditing(false);
                        setProfileData({
                          name: currentUser.name || '',
                          phone: currentUser.phone || '',
                          address: currentUser.address || ''
                        });
                      }}
                      className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  )}
                </div>

                <form onSubmit={handleProfileSubmit}>
                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        disabled={!editing}
                        className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={currentUser.email || ''}
                        disabled
                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-500"
                        placeholder="Your email address"
                      />
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Email cannot be changed for security reasons
                      </p>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center">
                          <span className="text-gray-700 font-semibold">+91</span>
                          <div className="absolute right-0 w-px h-1/2 bg-gradient-to-b from-gray-300 to-transparent"></div>
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          disabled={!editing}
                          maxLength={10}
                          className="w-full pl-16 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300"
                          placeholder="Enter 10-digit number"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">This is your primary login method</p>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Shipping Address
                      </label>
                      <textarea
                        name="address"
                        value={profileData.address}
                        onChange={handleProfileChange}
                        disabled={!editing}
                        rows={3}
                        className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300 resize-none"
                        placeholder="Enter your complete shipping address"
                      />
                    </div>

                    {/* Save Button */}
                    {editing && (
                      <div className="pt-6 border-t border-gray-200">
                        <button
                          type="submit"
                          disabled={saving}
                          className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl py-4 px-6 font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="relative flex items-center justify-center space-x-3">
                            {saving ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Saving Changes...</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-5 h-5" />
                                <span>Save Changes</span>
                              </>
                            )}
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Change Password Form */}
              <div className="bg-white rounded-3xl border border-amber-100 p-8 shadow-xl shadow-amber-100/50">
                <div className="flex items-center space-x-3 mb-8">
                  <Key className="w-6 h-6 text-amber-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 font-playfair">Change Password</h2>
                    <p className="text-gray-600">Update your password to keep your account secure</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit}>
                  <div className="space-y-6">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all duration-300"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-600 transition-colors duration-300"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all duration-300"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-600 transition-colors duration-300"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {passwordForm.newPassword && (
                        <div className="space-y-2 mt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">Password strength</span>
                            <span className={`text-xs font-bold ${
                              passwordStrength === 0 ? 'text-red-500' : 
                              passwordStrength === 1 ? 'text-red-500' : 
                              passwordStrength === 2 ? 'text-yellow-500' : 
                              passwordStrength === 3 ? 'text-blue-500' : 
                              'text-green-500'
                            }`}>
                              {getPasswordStrengthText()}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getPasswordStrengthColor()} transition-all duration-500`}
                              style={{ width: `${(passwordStrength / 4) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all duration-300"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-600 transition-colors duration-300"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <Info className="w-4 h-4 text-amber-600" />
                        <span>Password Requirements</span>
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <li className="flex items-center space-x-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${passwordForm.newPassword.length >= 6 ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {passwordForm.newPassword.length >= 6 ? (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">At least 6 characters</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${/[A-Z]/.test(passwordForm.newPassword) ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {/[A-Z]/.test(passwordForm.newPassword) ? (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">One uppercase letter</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${/[0-9]/.test(passwordForm.newPassword) ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {/[0-9]/.test(passwordForm.newPassword) ? (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">One number</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">One special character</span>
                        </li>
                      </ul>
                    </div>

                    {/* Update Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="w-full group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl py-4 px-6 font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="relative flex items-center justify-center space-x-3">
                          {changingPassword ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Updating Password...</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-5 h-5" />
                              <span>Update Password</span>
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}