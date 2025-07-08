import React from 'react';
import { Star, Clock, Play } from 'lucide-react';

const AudioBooks: React.FC = () => {
  const books = [
    {
      id: 1,
      title: "The Midnight Library",
      author: "Matt Haig",
      narrator: "Carey Mulligan",
      duration: "8h 32m",
      rating: 4.8,
      cover: "https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg?auto=compress&cs=tinysrgb&w=300&h=400",
      genre: "Fiction"
    },
    {
      id: 2,
      title: "Atomic Habits",
      author: "James Clear",
      narrator: "James Clear",
      duration: "5h 35m",
      rating: 4.9,
      cover: "https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=300&h=400",
      genre: "Self-Help"
    },
    {
      id: 3,
      title: "The Seven Husbands of Evelyn Hugo",
      author: "Taylor Jenkins Reid",
      narrator: "Alma Cuervo",
      duration: "12h 10m",
      rating: 4.7,
      cover: "https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=300&h=400",
      genre: "Romance"
    },
    {
      id: 4,
      title: "Project Hail Mary",
      author: "Andy Weir",
      narrator: "Ray Porter",
      duration: "16h 10m",
      rating: 4.9,
      cover: "https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg?auto=compress&cs=tinysrgb&w=300&h=400",
      genre: "Sci-Fi"
    },
    {
      id: 5,
      title: "The Silent Patient",
      author: "Alex Michaelides",
      narrator: "Jack Hawkins",
      duration: "8h 43m",
      rating: 4.6,
      cover: "https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=300&h=400",
      genre: "Thriller"
    },
    {
      id: 6,
      title: "Educated",
      author: "Tara Westover",
      narrator: "Julia Whelan",
      duration: "12h 10m",
      rating: 4.8,
      cover: "https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg?auto=compress&cs=tinysrgb&w=300&h=400",
      genre: "Memoir"
    }
  ];

  return (
    <section id="audiobooks" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Popular Audiobooks
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the most loved audiobooks from our community of listeners.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book) => (
            <div
              key={book.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
            >
              <div className="relative">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                  <Play className="h-6 w-6 text-amber-600 ml-1" />
                </button>
                <div className="absolute top-4 right-4 bg-amber-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                  {book.genre}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-gray-600 mb-1">by {book.author}</p>
                <p className="text-sm text-gray-500 mb-4">Narrated by {book.narrator}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{book.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{book.duration}</span>
                    </div>
                  </div>
                  <button className="text-amber-600 hover:text-amber-700 font-medium text-sm">
                    Listen Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-amber-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-amber-700 transition-colors duration-200">
            Browse All Books
          </button>
        </div>
      </div>
    </section>
  );
};

export default AudioBooks;