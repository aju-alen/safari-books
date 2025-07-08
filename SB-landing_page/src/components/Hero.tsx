import React from 'react';
import { Play, Download, Star, BookOpen } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-amber-50 via-white to-orange-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Your Stories,
              <span className="text-amber-600 block">Anywhere</span>
            </h1>
            <p className="text-xl text-gray-600 mt-6 leading-relaxed">
              Discover thousands of audiobooks, from bestsellers to hidden gems. 
              Transform your commute, workout, or downtime into an adventure.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-start">
              <button className="bg-amber-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-amber-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                <Download className="h-5 w-5" />
                <span>Coming Soon</span>
              </button>
              {/* <button className="border-2 border-amber-600 text-amber-600 px-8 py-4 rounded-full font-semibold hover:bg-amber-600 hover:text-white transition-all duration-200 flex items-center justify-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Watch Demo</span>
              </button> */}
            </div>

            {/* <div className="mt-12 flex items-center justify-center lg:justify-start space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">50K+</div>
                <div className="text-gray-600">Audiobooks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">1M+</div>
                <div className="text-gray-600">Happy Listeners</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="text-gray-600">4.9 Rating</div>
              </div>
            </div> */}
          </div>

          <div className="relative">
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-1 shadow-2xl">
              <div className="bg-white rounded-3xl p-8 shadow-inner">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">The Adventure Begins</h3>
                      <p className="text-gray-600">Chapter 1 of 12</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full w-1/3 rounded-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">12:34</span>
                    <div className="flex items-center space-x-4">
                      <button className="h-10 w-10 bg-amber-500 rounded-full flex items-center justify-center hover:bg-amber-600 transition-colors">
                        <Play className="h-5 w-5 text-white ml-1" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">45:21</span>
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

export default Hero;