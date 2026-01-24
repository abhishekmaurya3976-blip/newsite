'use client';

import { Inter, Playfair_Display } from 'next/font/google';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  MessageSquare, 
  Send, 
  Clock,
  ChevronRight,
  MessageCircle,
  Home,
  User,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MessageCircle as MessageIcon,
  Instagram,
  Facebook,
  Twitter,
  Youtube
} from 'lucide-react';

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

export default function ContactPage() {
  // WhatsApp contact information
  const whatsappNumber = '919967202612';
  const whatsappMessage = 'Hello Art Plazaa, I have a query about your products.';

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const businessHours = [
    { day: 'Monday', time: '9:30 AM - 8:30 PM' },
    { day: 'Tuesday', time: '9:30 AM - 8:30 PM' },
    { day: 'Wednesday', time: '9:30 AM - 8:30 PM' },
    { day: 'Thursday', time: '9:30 AM - 8:30 PM' },
    { day: 'Friday', time: '9:30 AM - 8:30 PM' },
    { day: 'Saturday', time: '9:30 AM - 8:30 PM' },
    { day: 'Sunday', time: '9:30 AM - 8:30 PM' },
  ];

  const socialMedia = [
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com', color: 'from-pink-500 to-purple-600' },
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com', color: 'from-blue-600 to-blue-800' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com', color: 'from-blue-400 to-blue-500' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com', color: 'from-red-500 to-red-600' },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-white ${inter.variable} ${playfair.variable}`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-16 px-4 md:px-6 lg:px-8 xl:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 mb-8 shadow-2xl">
              <MessageSquare className="w-12 h-12 text-white" />
            </div> */}
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 font-playfair leading-tight">
              <span className="block">Get In Touch</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 mt-2 text-4xl md:text-5xl lg:text-6xl">
                We're Here to Help
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Have questions about our products? Need expert advice on art supplies? 
              Our team is ready to assist you with personalized recommendations and support.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Grid */}
      <section className="py-16 px-4 md:px-6 lg:px-8 xl:px-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 font-playfair text-center">
            Contact Information
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Store Address */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-amber-100 hover:shadow-2xl transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Visit Our Store</h3>
              <div className="text-gray-600 space-y-2">
                <p className="font-semibold text-amber-700">Shop No. 4, Gajanan Apt</p>
                <p>Ashok Nagar, Opposite Vishwakarma Paradise</p>
                <p>Vasai West – 401202</p>
                <div className="pt-3">
                  <p className="text-sm font-medium text-gray-500">Landmark:</p>
                  <p className="text-amber-600 font-medium">Opposite Vishwakarma Paradise</p>
                </div>
              </div>
              <a 
                href="https://maps.google.com/?q=Shop+No.+4,+Gajanan+Apt,+Ashok+Nagar,+Vasai+West+401202"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-6 text-amber-600 hover:text-amber-700 font-medium transition-colors duration-300 group/link"
              >
                View on Google Maps <ChevronRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform duration-300" />
              </a>
            </div>

            {/* Phone Contact */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-amber-100 hover:shadow-2xl transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Call Us</h3>
              <div className="space-y-4">
                <a 
                  href="tel:+919967202612" 
                  className="text-2xl font-bold text-gray-900 hover:text-amber-600 transition-colors duration-300 block"
                >
                  +91 99672 02612
                </a>
                <p className="text-gray-600">Store Manager: Sachin</p>
                <div className="pt-4">
                  <button
                    onClick={handleWhatsAppClick}
                    className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold group/btn w-full justify-center"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat on WhatsApp
                    <Send className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Email Contact */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-amber-100 hover:shadow-2xl transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Email Us</h3>
              <a 
                href="mailto:artplazaa@outlook.com" 
                className="text-xl text-amber-600 hover:text-amber-700 transition-colors duration-300 block break-all mb-3"
              >
                artplazaa@outlook.com
              </a>
              <p className="text-gray-600">We typically respond within 4-6 hours</p>
              <a 
                href="mailto:artplazaa@outlook.com" 
                className="inline-flex items-center mt-6 text-amber-600 hover:text-amber-700 font-medium transition-colors duration-300 group/link"
              >
                Send an Email <ChevronRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform duration-300" />
              </a>
            </div>

            {/* Website */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-amber-100 hover:shadow-2xl transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Website</h3>
              <a 
                href="https://www.artplazaa.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xl text-amber-600 hover:text-amber-700 transition-colors duration-300 flex items-center mb-3"
              >
                <Globe className="w-5 h-5 mr-2" />
                www.artplazaa.com
              </a>
              <p className="text-gray-600 mb-4">Browse our full product catalog online</p>
              <a 
                href="https://www.artplazaa.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center mt-2 text-amber-600 hover:text-amber-700 font-medium transition-colors duration-300 group/link"
              >
                Visit Website <ChevronRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform duration-300" />
              </a>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-amber-100 hover:shadow-2xl transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Store Hours</h3>
              <div className="space-y-3">
                {businessHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">{schedule.day}</span>
                    <span className="text-gray-600 font-medium">{schedule.time}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-amber-700 text-sm font-medium">Open all days including Sundays & Holidays</p>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-8 shadow-xl border border-amber-100 hover:shadow-2xl transition-all duration-300 group">
              <h3 className="text-2xl font-bold text-white mb-6">Quick Contact</h3>
              <p className="text-amber-100 mb-8">
                Choose your preferred method to get in touch with us instantly.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 group/quick"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center mr-3">
                      <MessageIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">WhatsApp</div>
                      <div className="text-sm text-amber-100">Instant chat support</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover/quick:translate-x-1 transition-transform duration-300" />
                </button>

                <a
                  href="tel:+919967202612"
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 group/quick"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center mr-3">
                      <PhoneIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Call Now</div>
                      <div className="text-sm text-amber-100">Direct phone support</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover/quick:translate-x-1 transition-transform duration-300" />
                </a>

                <a
                  href="mailto:artplazaa@outlook.com"
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 group/quick"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center mr-3">
                      <MailIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Email</div>
                      <div className="text-sm text-amber-100">Detailed inquiries</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover/quick:translate-x-1 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 xl:px-20 bg-gradient-to-b from-white to-amber-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-playfair">
              Follow Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay updated with our latest products, offers, and creative inspirations
            </p>
          </div>
          
          <div className="flex justify-center space-x-6">
            {socialMedia.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${social.color} flex items-center justify-center text-white shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300`}
              >
                <social.icon className="w-7 h-7" />
              </a>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-600">Follow us for creative tips, product updates, and exclusive offers</p>
          </div>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      <button
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group"
        aria-label="Chat on WhatsApp"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <MessageCircle className="w-7 h-7 text-white" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center animate-pulse">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
        <div className="absolute right-20 bottom-0 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Chat on WhatsApp
        </div>
      </button>

      {/* FAQ Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 xl:px-20 bg-gradient-to-b from-amber-50/20 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-playfair">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <MessageSquare className="w-5 h-5 text-amber-600 mr-3" />
                What's the best way to contact you?
              </h3>
              <p className="text-gray-600">
                For quickest response, use WhatsApp or call us directly at <strong className="text-amber-600">+91 99672 02612</strong>. 
                We're available 7 days a week from 9:30 AM to 8:30 PM.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <Home className="w-5 h-5 text-amber-600 mr-3" />
                Do you offer home delivery?
              </h3>
              <p className="text-gray-600">
                Yes! We offer home delivery in the Vasai region. For bulk orders, we provide free delivery. 
                Contact us for delivery charges and availability in your area.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <Clock className="w-5 h-5 text-amber-600 mr-3" />
                What are your store timings?
              </h3>
              <p className="text-gray-600">
                We're open <strong>7 days a week</strong> from <strong>9:30 AM to 8:30 PM</strong>, 
                including Sundays and public holidays. You're always welcome to visit our store.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                <MapPin className="w-5 h-5 text-amber-600 mr-3" />
                Is parking available at your store?
              </h3>
              <p className="text-gray-600">
                Yes, there's ample parking space available opposite our store at Vishwakarma Paradise. 
                You can easily park your vehicle while you shop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 xl:px-20 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-playfair">
            Ready to Start Your Creative Project?
          </h2>
          <p className="text-xl text-amber-100 mb-10 max-w-2xl mx-auto">
            Visit our store in Vasai or contact us for expert advice on the best materials for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleWhatsAppClick}
              className="px-8 py-4 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat on WhatsApp
            </button>
            <a 
              href="tel:+919967202612" 
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Now: +91 99672 02612
            </a>
          </div>
        </div>
      </section>

      
    </div>
  );
}