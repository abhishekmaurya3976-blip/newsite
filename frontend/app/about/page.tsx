'use client';

import { Inter, Playfair_Display } from 'next/font/google';
import { MapPin, Phone, Mail, Globe, Palette, Package, Users, Award } from 'lucide-react';

// Import professional fonts (same as header)
const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter'
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-playfair'
});

export default function AboutPage() {
  const productCategories = [
    'Premium Canvas & Fine Art Papers',
    'DIY Kits & Creative Projects',
    'Artist Canvas Rolls & Panels',
    'Hobby & Craft Materials',
    'Art & Design Books',
    'Professional Drawing Materials',
    'School & Educational Stationery',
    'Office & Professional Supplies'
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-white ${inter.variable} ${playfair.variable}`}>
      {/* Hero Section - Clean Version */}
      <section className="relative overflow-hidden pt-25 pb-20 px-4 md:px-6 lg:px-8 xl:px-15">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 mb-8 shadow-2xl">
              <Palette className="w-12 h-12 text-white" />
            </div> */}
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 font-playfair leading-tight">
              <span className="block">Art Plazaa</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 mt-2 text-4xl md:text-5xl lg:text-6xl">
                A Creative Destination
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Your premier destination for premium stationery, professional art supplies, 
              and creative inspiration. We bridge the gap between imagination and creation 
              with quality materials from world-class brands.
            </p>
          </div>
        </div>
      </section>

      {/* Store Location & Contact */}
      <section className="py-16 px-4 md:px-6 lg:px-8 xl:px-20 bg-gradient-to-b from-white to-amber-50/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-playfair">
              Visit Our Creative Hub
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Located in the heart of Vasai, we provide a physical space where artists, 
              students, and professionals can explore quality materials firsthand.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-amber-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Store Location</h3>
              <div className="space-y-3 text-gray-600">
                <p className="font-semibold text-amber-700">Shop No. 4, Gajanan Apt</p>
                <p>Ashok Nagar, Opposite Vishwakarma Paradise</p>
                <p>Vasai West – 401202</p>
                <div className="pt-4">
                  <p className="text-sm font-medium text-gray-500">Landmark:</p>
                  <p className="text-amber-600">Opposite Vishwakarma Paradise</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-amber-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center mb-6">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Store Manager</p>
                  <a 
                    href="tel:+919967202612" 
                    className="text-xl font-bold text-amber-600 hover:text-amber-700 transition-colors duration-300"
                  >
                    Sachin – 9967202612
                  </a>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-gray-500 mb-2">Available:</p>
                  <p className="text-gray-700">Mon-Sun: 9:30 AM - 8:30 PM</p>
                  <p className="text-sm text-gray-600">(Including Sundays & Holidays)</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-amber-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center mb-6">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Digital Presence</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Email</p>
                  <a 
                    href="mailto:artplazaa@outlook.com" 
                    className="text-lg text-amber-600 hover:text-amber-700 transition-colors duration-300 break-all"
                  >
                    artplazaa@outlook.com
                  </a>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Website</p>
                  <a 
                    href="https://www.artplazaa.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg text-amber-600 hover:text-amber-700 transition-colors duration-300 flex items-center"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    www.artplazaa.com
                  </a>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-gray-500">Browse our full catalog online or visit us in-store for expert advice.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products & Supplies */}
      <section className="py-20 px-4 md:px-6 lg:px-8 xl:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-playfair">
              Our Creative Inventory
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From professional artists to school students, we cater to every creative need 
              with an extensive range of high-quality supplies and materials.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="grid sm:grid-cols-2 gap-4">
                {productCategories.map((category, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-3 bg-white px-5 py-4 rounded-xl shadow-sm border border-amber-50 hover:shadow-md hover:border-amber-100 transition-all duration-300"
                  >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500" />
                    <span className="text-gray-700 font-medium">{category}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4 font-playfair">Special Services</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <span className="text-sm font-bold">✓</span>
                    </div>
                    <span>Bulk orders for schools & institutions</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <span className="text-sm font-bold">✓</span>
                    </div>
                    <span>Expert product recommendations</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <span className="text-sm font-bold">✓</span>
                    </div>
                    <span>Custom art supply kits</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <span className="text-sm font-bold">✓</span>
                    </div>
                    <span>Home delivery in Vasai region</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl p-1 shadow-2xl">
                <div className="bg-white rounded-2xl p-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-6 font-playfair">
                    Why Choose Art Plazaa?
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-amber-600">✓</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Quality Assurance</h4>
                        <p className="text-gray-600">Every product is handpicked for quality and durability.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-amber-600">✓</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Expert Guidance</h4>
                        <p className="text-gray-600">Our team helps you choose the right materials for your project.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-amber-600">✓</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Creative Community</h4>
                        <p className="text-gray-600">Join a growing community of artists and creators.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-amber-600">✓</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Competitive Pricing</h4>
                        <p className="text-gray-600">Premium quality at accessible prices for all budgets.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 xl:px-20 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-playfair">
            Start Your Creative Journey
          </h2>
          <p className="text-xl text-amber-100 mb-10 max-w-2xl mx-auto">
            Visit our store in Vasai or explore our online catalog. Let's create something amazing together!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/products" 
              className="px-8 py-4 bg-white text-amber-700 font-bold rounded-xl hover:bg-amber-50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Browse Products
            </a>
            <a 
              href="/contact" 
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Get In Touch
            </a>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <footer className="py-8 px-4 text-center bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <p className="text-amber-300 font-bold text-xl mb-2 font-playfair">Art Plazaa</p>
          <p className="text-gray-400">© {new Date().getFullYear()} Art Plazaa - A Creative Destination. All rights reserved.</p>
          <p className="text-gray-500 text-sm mt-4">Shop No. 4, Gajanan Apt, Ashok Nagar, Opposite Vishwakarma Paradise, Vasai West – 401202</p>
        </div>
      </footer>
    </div>
  );
}