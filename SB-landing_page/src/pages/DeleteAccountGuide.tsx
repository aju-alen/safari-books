import React, { useState } from 'react';
import { AlertTriangle, Shield, Lock, Info } from 'lucide-react';

const DeleteAccountGuide = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsConfirmed(e.target.checked);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Delete Your Account</h1>
          <p className="text-gray-600">This action cannot be undone. Please read carefully before proceeding.</p>
        </div>

        {/* Warning Card */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Important Warning</h3>
              <div className="mt-2 text-sm text-red-700">
                <p className="mb-2">
                  Deleting your account will permanently remove:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>All your reading progress and bookmarks</li>
                  <li>Your personal library and collections</li>
                  <li>Account settings and preferences</li>
                  <li>Subscription and payment information</li>
                  <li>All associated data and history</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-4">
            <Info className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">How to Delete Your Account</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-medium text-amber-800">1</span>
              </div>
              <p>Open the Safari Books mobile app on your device</p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-medium text-amber-800">2</span>
              </div>
              <p>Navigate to Settings → Account → Delete Account</p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-medium text-amber-800">3</span>
              </div>
              <p>Enter your password to confirm the deletion</p>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-medium text-amber-800">4</span>
              </div>
              <p>Review the consequences and tap "Delete Account"</p>
            </div>
          </div>
        </div>

        {/* Password Confirmation Form */}
        {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-4">
            <Lock className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Password Confirmation</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your password to continue
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <Shield className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="flex items-start">
              <input
                type="checkbox"
                id="confirm"
                checked={isConfirmed}
                onChange={handleConfirmChange}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="confirm" className="ml-3 text-sm text-gray-700">
                I understand that this action is permanent and cannot be undone. I have backed up any important data and am ready to delete my account.
              </label>
            </div>
          </div>
        </div> */}

        {/* Action Buttons */}
        {/* <div className="flex flex-col sm:flex-row gap-4">
          <button
            disabled={!password || !isConfirmed}
            className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Proceed to Mobile App
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
          >
            Cancel
          </button>
        </div> */}

        {/* Additional Information */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Need help? Contact our support team at support@safbooks.com</p>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountGuide;