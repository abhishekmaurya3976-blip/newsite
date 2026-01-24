'use client';

import { Inter, Playfair_Display } from 'next/font/google';
import { Package, RefreshCw, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';
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

export default function ReturnsPage() {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-white ${inter.variable} ${playfair.variable}`}>
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 md:px-6 lg:px-8 xl:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 mb-8 shadow-2xl">
              <RefreshCw className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-playfair">
              Returns & Exchanges
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Hassle-free returns and exchanges within 7 days
            </p>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-16 px-4 md:px-6 lg:px-8 xl:px-20">
        <div className="max-w-4xl mx-auto">
          {/* 7-Day Policy Highlight */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 mb-12 border border-green-200">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center font-playfair">
              7-Day Return & Refund Policy
            </h2>
            <p className="text-gray-700 text-center text-lg">
              We offer a 7-day window for returns and exchanges from the date of purchase.
              All items must be in original condition with tags and packaging intact.
            </p>
          </div>

          {/* Policy Details */}
          <div className="space-y-8">
            {/* Eligibility */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="w-6 h-6 text-amber-600 mr-3" />
                Return Eligibility
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900 mb-3 text-green-700">What Can Be Returned:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Unopened, unused products in original packaging</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Damaged or defective items upon delivery</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Wrong items received</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900 mb-3 text-red-700">What Cannot Be Returned:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Opened or used products</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Products without original packaging</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Customized or personalized items</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Steps */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Package className="w-6 h-6 text-amber-600 mr-3" />
                Return Process
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-b from-amber-50 to-amber-100 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-center mx-auto mb-4 font-bold text-xl">1</div>
                  <h4 className="font-bold text-gray-900 mb-2">Contact Us</h4>
                  <p className="text-gray-600 text-sm">Reach out within 7 days of purchase</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-b from-amber-50 to-amber-100 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-center mx-auto mb-4 font-bold text-xl">2</div>
                  <h4 className="font-bold text-gray-900 mb-2">Package Item</h4>
                  <p className="text-gray-600 text-sm">Include original packaging and receipt</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-b from-amber-50 to-amber-100 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-center mx-auto mb-4 font-bold text-xl">3</div>
                  <h4 className="font-bold text-gray-900 mb-2">Return to Store</h4>
                  <p className="text-gray-600 text-sm">Bring to our Vasai store for processing</p>
                </div>
              </div>
            </div>

            {/* Refund Info */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Refund Information</h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Refunds are processed within 3-5 business days after we receive and inspect the returned item. 
                  You will receive your refund through the original payment method.
                </p>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-amber-800 font-medium">
                    <span className="font-bold">Note:</span> For hygiene reasons, certain products like opened stationery, 
                    art supplies, and personal items cannot be returned unless defective.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Contact for Returns
              </Link>
              <Link
                href="/products"
                className="px-8 py-4 bg-white text-amber-700 font-bold rounded-xl hover:bg-amber-50 border border-amber-300 hover:shadow-xl transition-all duration-300"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}