import React from 'react';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <BookOpen className="h-8 w-8 text-amber-500" />
              <span className="text-2xl font-bold">Safari Books</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Discover the world through stories. Join millions of listeners on their audio journey.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors cursor-pointer">
                <span className="text-sm">📘</span>
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors cursor-pointer">
                <span className="text-sm">🐦</span>
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors cursor-pointer">
                <span className="text-sm">📷</span>
              </div>
            </div>
          </div>

          {/* <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Browse Books</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">New Releases</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Bestsellers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Free Books</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Gift Cards</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Account</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Billing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Accessibility</a></li>
            </ul>
          </div> */}

          <div>
            <h3 className="text-lg font-semibold mb-6">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-amber-500" />
                <span className="text-gray-400">support@safbooks.com</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-amber-500" />
                <span className="text-gray-400">Unit 201, Level 1, Zone South - Avenue G, DIFC Dubai</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Safari Books. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="https://doc-hosting.flycricket.io/safari-books-privacy-policy/3014250c-185e-467a-868a-dda00296bd29/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
            {/* <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;