import React from 'react';
import { Headphones, Download, Zap, Users, BookOpen, Clock } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Headphones,
      title: "Premium Audio Quality",
      description: "Crystal-clear narration with professional voice actors and immersive sound quality."
    },
    {
      icon: BookOpen,
      title: "Vast Library",
      description: "Access over 50,000 titles across all genres, from classics to the latest releases."
    },
    {
      icon: Clock,
      title: "Flexible Playback",
      description: "Adjust playback speed, set sleep timers, and customize your listening experience. Coming Soon"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose Safari Books?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience audiobooks like never before with features designed for the modern listener.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-12 w-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;