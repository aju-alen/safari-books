import React from 'react';
import { Smartphone, Star, Shield, Headphones } from 'lucide-react';

const Download: React.FC = () => {
  return (
    <section id="download" className="py-20 bg-gradient-to-br from-amber-600 to-orange-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Start Your Audio Journey Today
            </h2>
            <p className="text-xl text-amber-100 mb-8 leading-relaxed">
              Join other users who have discovered the joy of audiobooks. 
              Download Safari Books now.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
             
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-amber-100">Cancel anytime</span>
              </div>
             
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <span className="text-amber-100">All devices</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-3" 
              onClick={() => {
                window.location.href = 'https://apps.apple.com/us/app/safari-books/id6741313582';
              }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-black font-bold text-xs">📱</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-300">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </div>
              </button>
              
              <button className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-3"
              onClick={() => {
                window.location.href = 'https://play.google.com/store/apps/details?id=com.rise.safaribooks&hl=en';
              }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-black font-bold text-xs">🤖</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-300">Get it on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">Welcome to Safari Books!</div>
                    <div className="text-gray-600">Choose your reading adventure</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-center">
                      <div className="text-white font-semibold text-sm">Fiction</div>

                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-center">
                      <div className="text-white font-semibold text-sm">Non-Fiction</div>

                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-4 text-center">
                      <div className="text-white font-semibold text-sm">Self-Help</div>

                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-center">
                      <div className="text-white font-semibold text-sm">Mystery</div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Download;