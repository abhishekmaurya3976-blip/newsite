import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'Shipping Information', href: '/policy/shipping' },
      { name: 'Returns & Exchanges', href: '/policy/returns' },
    ],
    company: [
      { name: 'Our Story', href: '/about' },
      { name: 'Privacy Policy', href: '/policy/privacy' },
      { name: 'Terms of Service', href: '/policy/shipping' },
    ],
  };

  return (
    <footer className="bg-gradient-to-b from-gray-950 to-black text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-24 w-96 h-96 bg-gray-800/5 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center mb-16 text-center">
          <Link href="/" className="text-4xl font-serif font-bold text-white tracking-wider mb-4">
            Art<span className="text-amber-400">Plazaa</span>
          </Link>
          <p className="text-gray-400 text-sm max-w-xl italic font-light">
            Premium art supplies curated for the discerning artist. Where creativity meets excellence.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 mb-16">
          {/* Brand Description */}
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 tracking-wider uppercase border-l-4 border-amber-500 pl-4">
                About Our Craft
              </h3>
              <p className="text-gray-400 leading-relaxed">
                At ArtPlazaa, we curate the world's finest art supplies for professionals 
                and enthusiasts alike. Our collection represents a commitment to quality, 
                precision, and artistic excellence that transforms creative vision into 
                tangible masterpieces.
              </p>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 tracking-wider uppercase border-l-4 border-amber-500 pl-4">
                Connect With Us
              </h3>
              <div className="flex space-x-6">
                {[
                  { name: 'Instagram', icon: (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  )},
                  { name: 'Pinterest', icon: (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10 0 5.514-4.486 10-10 10-5.514 0-10-4.486-10-10 0-5.514 4.486-10 10-10zm0 4c-3.313 0-6 2.687-6 6 0 2.281 1.271 4.269 3.143 5.286-.044-.786-.085-1.994.017-2.851.093-.786.607-4.999.607-4.999s-.155-.312-.155-.77c0-.722.419-1.261.94-1.261.443 0 .657.333.657.732 0 .445-.283 1.109-.43 1.726-.123.517.259.938.767.938.92 0 1.628-1.086 1.628-2.652 0-1.386-1.017-2.355-2.468-2.355-1.681 0-2.667 1.261-2.667 2.562 0 .498.142.86.365 1.134.101.121.115.227.084.35-.028.118-.092.402-.119.512-.037.155-.127.188-.293.113-.816-.38-1.329-1.575-1.329-2.534 0-2.064 1.546-3.956 4.458-3.956 2.338 0 4.156 1.667 4.156 3.892 0 2.322-1.465 4.193-3.498 4.193-.683 0-1.325-.355-1.544-.773 0 0-.338 1.287-.419 1.603-.152.585-.459 1.169-.734 1.639 1.05.323 2.162.5 3.324.5 5.514 0 10-4.486 10-10s-4.486-10-10-10z"/>
                    </svg>
                  )},
                  { name: 'YouTube', icon: (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                    </svg>
                  )},
                  { name: 'LinkedIn', icon: (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  )},
                ].map((social) => (
                  <a
                    key={social.name}
                    href="#"
                    className="w-12 h-12 rounded-full bg-gray-900/50 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-amber-300 hover:border-amber-500/30 hover:bg-gray-800/50 transition-all duration-300 group"
                    aria-label={social.name}
                  >
                    <div className="group-hover:scale-110 transition-transform duration-300">
                      {social.icon}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-6 tracking-wider uppercase border-l-4 border-amber-500 pl-4">
                Support
              </h3>
              <ul className="space-y-4">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-amber-300 transition-all duration-300 group flex items-center py-2"
                    >
                      <span className="w-0 h-0.5 bg-amber-500 group-hover:w-4 mr-0 group-hover:mr-3 transition-all duration-300"></span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-6 tracking-wider uppercase border-l-4 border-amber-500 pl-4">
                Company
              </h3>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-amber-300 transition-all duration-300 group flex items-center py-2"
                    >
                      <span className="w-0 h-0.5 bg-amber-500 group-hover:w-4 mr-0 group-hover:mr-3 transition-all duration-300"></span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="py-8 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center group">
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center mr-4 group-hover:bg-amber-900/20 transition-all duration-300">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Customer Service</div>
                  <div className="text-white font-medium">+1 (555) 123-4567</div>
                </div>
              </div>
              
              <div className="flex items-center group">
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center mr-4 group-hover:bg-amber-900/20 transition-all duration-300">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Email Support</div>
                  <div className="text-white font-medium">support@artplazaa.com</div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="text-center lg:text-right">
              <div className="text-white font-medium">Monday - Friday: 9AM - 6PM EST</div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 mt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-500 text-sm">
                © {currentYear} ArtPlazaa. All rights reserved.
              </p>
              <p className="text-gray-600 text-xs mt-1">
                All products and materials are trademarks of their respective owners.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end space-y-3">
              <a 
                href="https://www.arnavcreativesolutions.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-300 text-sm transition-all duration-300 group flex items-center"
              >
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="group-hover:translate-x-1 transition-transform duration-300">
                  Developed by Arnav Creative Solutions
                </span>
              </a>
              
              {/* Payment Methods */}
              <div className="flex items-center space-x-4">
                {['VISA', 'MASTERCARD',  'PAYPAL'].map((method) => (
                  <div key={method} className="text-gray-700 text-xs font-medium px-2 py-1 bg-gray-900/50 rounded">
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}