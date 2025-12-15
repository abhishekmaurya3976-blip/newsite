'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import {
  Search,
  User,
  ShoppingCart,
  Heart,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Settings,
  Home,
  Tag,
  Info,
  Mail,
  PenTool,
  BookOpen
} from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Categories', href: '/categories', icon: Tag },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Mail },
  ];

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/98 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-white border-b border-gray-200'
      }`}>
        <div className="container  px-2 sm:px-6 lg:px-8">
          {/* Main Header Row - Logo | Search | Icons */}
          <div className="flex items-center h-20 lg:h-24">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link 
                href="/" 
                className="flex items-center space-x-3 group"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <PenTool className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full border-2 border-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                    Art Plaza
                  </span>
                  <span className="text-xs text-amber-600 font-medium tracking-wider">PREMIUM STATIONERY</span>
                </div>
              </Link>
            </div>

            {/* Centered Search Box - Desktop */}
            <div className="hidden lg:flex flex-1 mx-8">
              <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto">
                <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-[1.02] shadow-xl' : 'shadow-lg'}`}>
                  <input
                    type="text"
                    placeholder="Find premium pens, notebooks, art supplies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full px-8 py-4 pl-14 bg-white border-2 border-gray-300/80 rounded-2xl focus:outline-none focus:border-amber-400 focus:ring-0 text-gray-800 placeholder-gray-500 transition-all duration-300"
                  />
                  <div className="absolute left-5 top-1/2 transform -translate-y-1/2 flex items-center">
                    <Search className="w-5 h-5 text-amber-500" />
                    <div className="ml-3 w-px h-6 bg-gradient-to-b from-gray-300/50 to-transparent" />
                  </div>
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-2 lg:space-x-5 ml-auto">
              {/* Wishlist */}
              <Link 
                href="/wishlist" 
                className="relative group"
              >
                <div className="relative p-2 rounded-xl hover:bg-gray-100/50 transition-all duration-300">
                  <Heart className="w-6 h-6 text-gray-600 group-hover:text-rose-500 transition-all duration-300" />
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-sm">
                    2
                  </span>
                </div>
              </Link>

              {/* Cart */}
              <Link 
                href="/cart" 
                className="relative group"
              >
                <div className="relative p-2 rounded-xl hover:bg-gray-100/50 transition-all duration-300">
                  <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-amber-600 transition-all duration-300" />
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-sm">
                    3
                  </span>
                </div>
              </Link>

              {/* User Account */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-100/50 rounded-xl transition-all duration-300 group"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="hidden lg:flex flex-col items-start">
                      <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                      <span className="text-xs text-gray-500">Premium Member</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-all duration-300 ${isUserMenuOpen ? 'rotate-180 text-amber-600' : 'text-gray-500'}`} />
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200/50 py-3 z-50 animate-in slide-in-from-top-5 duration-300">
                      <div className="px-4 py-3 border-b border-gray-200/30">
                        <div className="font-bold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500 truncate">{user.email}</div>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 rounded-lg mx-2 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4 mr-3 text-amber-600" />
                          <span className="font-medium">My Profile</span>
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 rounded-lg mx-2 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package className="w-4 h-4 mr-3 text-amber-600" />
                          <span className="font-medium">My Orders</span>
                        </Link>
                        <Link
                          href="/wishlist"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 rounded-lg mx-2 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Heart className="w-4 h-4 mr-3 text-amber-600" />
                          <span className="font-medium">Wishlist</span>
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-3 text-amber-600 hover:bg-amber-50 rounded-lg mx-2 transition-colors duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            <span className="font-medium">Admin Panel</span>
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-lg mx-2 transition-colors duration-200 mt-2"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          <span className="font-medium">Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center space-x-4">
                  <Link 
                    href="/login" 
                    className="px-5 py-2.5 text-gray-700 hover:text-amber-700 font-medium rounded-xl hover:bg-gray-100/50 transition-all duration-300"
                  >
                    Sign in
                  </Link>
                  <Link 
                    href="/register" 
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                  >
                    Join Now
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                ref={mobileMenuButtonRef}
                className="lg:hidden p-2 text-gray-600 hover:text-amber-600 hover:bg-gray-100/50 rounded-xl transition-colors duration-300"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation Tabs - Below main row */}
          <div className="hidden lg:flex justify-center items-center pb-4">
            <nav className="flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative py-3 transition-all duration-300 ${
                    pathname === item.href
                      ? 'text-amber-700'
                      : 'text-gray-700 hover:text-amber-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <item.icon className={`w-4 h-4 transition-colors duration-300 ${
                      pathname === item.href ? 'text-amber-600' : 'text-gray-500 group-hover:text-amber-500'
                    }`} />
                    <span className="font-medium tracking-wide text-lg">{item.name}</span>
                  </div>
                  
                  {/* Hover line effect */}
                  <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-all duration-300 ${
                    pathname === item.href 
                      ? 'opacity-100 scale-x-100' 
                      : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                  }`} />
                  
                  {/* Active indicator */}
                  {pathname === item.href && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile Search */}
          <div className="lg:hidden py-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search premium stationery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3 pl-12 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-300"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors duration-300 text-sm font-medium shadow-sm"
              >
                Go
              </button>
            </form>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div 
              className="lg:hidden bg-white rounded-2xl shadow-xl border border-gray-200 mb-4" 
              ref={mobileMenuRef}
            >
              <div className="py-4">
                {/* Mobile Navigation Links */}
                <div className="space-y-1 px-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                        pathname === item.href
                          ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-amber-600' : 'text-gray-500'}`} />
                      <span className="font-medium text-lg">{item.name}</span>
                    </Link>
                  ))}
                </div>

                {/* Mobile Auth Buttons */}
                {!user && (
                  <div className="flex space-x-3 px-4 pt-6 mt-4 border-t border-gray-200">
                    <Link
                      href="/login"
                      className="flex-1 text-center bg-gray-900 text-white px-4 py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="flex-1 text-center bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3.5 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Spacer for fixed header */}
      <div className="h-20 lg:h-24" />
    </>
  );
}