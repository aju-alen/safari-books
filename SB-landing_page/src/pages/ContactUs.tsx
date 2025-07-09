
import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';

function ContactForm() {
  const [state, handleSubmit] = useForm("xyzjqlyv");
  
  if (state.succeeded) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h1>
            <p className="text-gray-600">Thank you for contacting us. We'll get back to you soon.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
            <Mail className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
          <p className="text-gray-600">Have a question or need support? We're here to help.</p>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email" 
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                  placeholder="Enter your email address"
                />
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <ValidationError 
                prefix="Email" 
                field="email"
                errors={state.errors}
                className="text-red-600 text-sm mt-1"
              />
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <div className="relative">
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 resize-none"
                  placeholder="Tell us how we can help you..."
                />
                <MessageSquare className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              <ValidationError 
                prefix="Message" 
                field="message"
                errors={state.errors}
                className="text-red-600 text-sm mt-1"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={state.submitting}
                className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                {state.submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-blue-800">i</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Need Immediate Help?</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p className="mb-2">For urgent matters, you can also reach us at:</p>
                <ul className="space-y-1">
                  <li>📧 Email: support@safbooks.com</li>
                  <li>⏰ Response Time: Usually within 24 hours</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactForm;