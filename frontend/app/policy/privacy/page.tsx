'use client';

import { Inter, Playfair_Display } from 'next/font/google';
import { Shield, Lock, Eye, FileText, Users } from 'lucide-react';

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

export default function PrivacyPolicyPage() {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-white ${inter.variable} ${playfair.variable}`}>
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 md:px-6 lg:px-8 xl:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-8 shadow-2xl">
              <Lock className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-playfair">
              Privacy Policy
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              How we protect and use your information
            </p>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-16 px-4 md:px-6 lg:px-8 xl:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8 mb-8">
            <div className="flex items-center mb-6">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Our Commitment</h2>
            </div>
            <p className="text-gray-700 mb-6">
              At Art Plazaa, we are committed to protecting your privacy. This policy explains how we collect, 
              use, and safeguard your personal information when you use our services.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Eye className="w-6 h-6 text-amber-600 mr-3" />
                Information We Collect
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900">Personal Information</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-3"></div>
                      <span>Name and contact details</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-3"></div>
                      <span>Email address</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-3"></div>
                      <span>Phone number</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-3"></div>
                      <span>Shipping address</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900">Transaction Information</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-3"></div>
                      <span>Purchase history</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt=2 mr-3"></div>
                      <span>Payment details (secured)</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt=2 mr-3"></div>
                      <span>Order preferences</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Use Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="w-6 h-6 text-amber-600 mr-3" />
                How We Use Your Information
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-bold text-blue-800 mb-2">Order Processing</h4>
                    <p className="text-blue-700 text-sm">To process and fulfill your orders</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-bold text-green-800 mb-2">Customer Support</h4>
                    <p className="text-green-700 text-sm">To provide assistance and service</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-bold text-purple-800 mb-2">Service Improvements</h4>
                    <p className="text-purple-700 text-sm">To enhance your shopping experience</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-bold text-amber-800 mb-2">Communication</h4>
                    <p className="text-amber-700 text-sm">To send order updates and offers (with consent)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Protection */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="w-6 h-6 text-amber-600 mr-3" />
                Data Protection
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  We implement appropriate security measures to protect your personal information from 
                  unauthorized access, alteration, or disclosure. Your data is stored securely and 
                  accessed only by authorized personnel.
                </p>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-amber-800 font-medium">
                    <span className="font-bold">Note:</span> We do not sell or share your personal information 
                    with third parties for marketing purposes without your explicit consent.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact & Updates */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact & Updates</h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  This privacy policy may be updated periodically. We encourage you to review this page 
                  for any changes. For privacy-related inquiries, please contact us at 
                  <a href="mailto:artplazaa@outlook.com" className="text-amber-600 hover:text-amber-700 ml-1">
                    artplazaa@outlook.com
                  </a>.
                </p>
                <p className="text-gray-600 text-sm">
                  Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}