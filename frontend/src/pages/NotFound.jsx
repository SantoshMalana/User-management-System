import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={36} className="text-primary-600" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-lg text-gray-600 mb-2">Page not found</p>
        <p className="text-sm text-gray-400 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn-primary">
          <Home size={16} />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
