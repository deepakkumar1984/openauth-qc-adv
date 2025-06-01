import { fetchApi } from '@/src/utils/api';
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Check for registration success message or OAuth errors
    const params = new URLSearchParams(location.search);
    if (params.get('registered') === 'true') {
      setSuccessMessage('Account created successfully! Please log in.');
    }
    
    // Handle OAuth errors
    const authError = params.get('authError');
    const provider = params.get('provider');
    if (authError && provider) {
      let errorMessage = '';
      switch (authError) {
        case 'oauth_denied':
          errorMessage = `${provider} authentication was cancelled.`;
          break;
        case 'oauth_no_code':
          errorMessage = `No authorization code received from ${provider}.`;
          break;
        case 'oauth_exchange_failed':
          errorMessage = `Failed to exchange authorization code with ${provider}.`;
          break;
        case 'oauth_verify_failed':
          errorMessage = `Failed to verify ${provider} access token.`;
          break;
        case 'oauth_callback_failed':
          errorMessage = `OAuth callback processing failed for ${provider}.`;
          break;
        case 'user_not_found':
          errorMessage = `User account not found after ${provider} authentication.`;
          break;
        case 'oauth_init_failed':
          errorMessage = `Failed to initialize ${provider} authentication.`;
          break;
        default:
          errorMessage = `Authentication error with ${provider}.`;
      }
      setError(errorMessage);
    }
  }, [location]);

  const handleLogin = (provider: string) => {
    // Redirect to the backend login route
    window.location.href = `/api/auth/${provider}/login`;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetchApi('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json() as { message?: string };

      if (response.ok) {
        // Redirect to the main app or dashboard
        window.location.href = '/';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-quantum-void text-quantum-text-primary p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-quantum-glow mb-8">
          Login to Quantum Adventure
        </h1>
        
        {successMessage && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}
        
        {/* Email/Password Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-quantum-text-secondary mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-quantum-glow text-white"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-quantum-text-secondary mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-quantum-glow text-white"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-quantum-glow hover:bg-quantum-glow/80 text-black font-bold py-3 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in with Email'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-quantum-text-secondary">Or continue with</span>
          </div>
        </div>
        
        {/* OAuth Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleLogin('google')}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out"
          >
            {/* Placeholder for Google Icon */}
            <span className="mr-2">G</span> Sign in with Google
          </button>
          
          <button
            onClick={() => handleLogin('facebook')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out"
          >
            {/* Placeholder for Facebook Icon */}
            <span className="mr-2">f</span> Sign in with Facebook
          </button>
          
          <button
            onClick={() => handleLogin('github')}
            className="w-full bg-gray-700 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out"
          >
            {/* Placeholder for GitHub Icon */}
            <span className="mr-2"></span> Sign in with GitHub
          </button>
        </div>

        {/* Registration Link */}
        <p className="text-center text-quantum-text-secondary mt-6 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-quantum-glow hover:underline">
            Create one here
          </Link>
        </p>

        <p className="text-center text-quantum-text-secondary mt-4 text-xs">
          Choose your preferred way to embark on this quantum journey!
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
