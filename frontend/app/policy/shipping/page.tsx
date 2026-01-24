'use client';

import { Inter, Playfair_Display } from 'next/font/google';
import { FileText, Check, AlertCircle, Scale } from 'lucide-react';
import Link from 'next/link';

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

export default function TermsPage() {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-white ${inter.variable} ${playfair.variable}`}>
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 md:px-6 lg:px-8 xl:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 mb-8 shadow-2xl">
              <Scale className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-playfair">
              Terms of Service
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Guidelines for using our services
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 px-4 md:px-6 lg:px-8 xl:px-20">
        <div className="max-w-4xl mx-auto">
          {/* Important Notice */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 mb-12 border border-purple-200">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Important Notice</h3>
                <p className="text-gray-700">
                  By using Art Plazaa's services, you agree to these terms. Please read them carefully 
                  before making a purchase or using our website.
                </p>
              </div>
            </div>
          </div>

          {/* Terms List */}
          <div className="space-y-8">
            {/* Account Terms */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Check className="w-6 h-6 text-amber-600 mr-3" />
                Account Terms
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">You must be at least 18 years old to create an account</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">You are responsible for maintaining the security of your account</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Provide accurate and complete information</p>
                </div>
              </div>
            </div>

            {/* Order Terms */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 text-amber-600 mr-3" />
                Order & Payment Terms
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900">Order Acceptance</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-2 flex-shrink-0"></div>
                      <span>All orders are subject to availability</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-2 flex-shrink-0"></div>
                      <span>We reserve the right to cancel any order</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900">Pricing & Payment</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-2 flex-shrink-0"></div>
                      <span>All prices are in Indian Rupees (₹)</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 mr-2 flex-shrink-0"></div>
                      <span>We accept multiple payment methods</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Intellectual Property */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  All content on Art Plazaa's website, including logos, text, graphics, and images, 
                  is our property or licensed to us. You may not use our content without permission.
                </p>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-amber-800 font-medium">
                    The Art Plazaa name, logo, and all related names, logos, product and service names, 
                    designs, and slogans are trademarks of Art Plazaa or its affiliates.
                  </p>
                </div>
              </div>
            </div>

            {/* Limitations */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Limitations of Liability</h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Art Plazaa shall not be liable for any indirect, incidental, special, consequential, 
                  or punitive damages resulting from your use of our services or products.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">
                      We strive for accuracy but do not warrant that product descriptions or other content 
                      is error-free
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">
                      Our liability is limited to the maximum extent permitted by law
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Changes & Contact */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  We may update these terms from time to time. Continued use of our services after 
                  changes constitutes acceptance of the new terms.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link
                    href="/contact"
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 text-center"
                  >
                    Contact for Questions
                  </Link>
                  <Link
                    href="/privacy"
                    className="px-6 py-3 bg-white text-amber-700 font-bold rounded-xl hover:bg-amber-50 border border-amber-300 transition-all duration-300 text-center"
                  >
                    View Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}