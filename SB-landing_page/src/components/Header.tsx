import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <img src="https://safari-books-mobile.s3.ap-south-1.amazonaws.com/Assets/sbLogo.png" alt="logo" className="h-10 w-10" />
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-amber-600 transition-colors duration-200">Features</a>
            <a href="#faq" className="text-gray-700 hover:text-amber-600 transition-colors duration-200">FAQ</a>
            <a href="#download" className="bg-amber-600 text-white px-6 py-2 rounded-full hover:bg-amber-700 transition-colors duration-200">
              Download
            </a>
          </nav>

          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <div className="flex flex-col space-y-3">
              <a href="#features" className="text-gray-700 hover:text-amber-600 transition-colors duration-200 px-4 py-2">
                Features
              </a>
              <a href="#audiobooks" className="text-gray-700 hover:text-amber-600 transition-colors duration-200 px-4 py-2">
                Audiobooks
              </a>
              <a href="#faq" className="text-gray-700 hover:text-amber-600 transition-colors duration-200 px-4 py-2">
                FAQ
              </a>
              <a href="#download" className="bg-amber-600 text-white px-6 py-2 rounded-full hover:bg-amber-700 transition-colors duration-200 mx-4">
                Download
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;