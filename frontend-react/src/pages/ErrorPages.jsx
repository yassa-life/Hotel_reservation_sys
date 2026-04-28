import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center animate-slide-up">
        <p className="font-display text-8xl font-bold text-navy-200 mb-4">404</p>
        <h1 className="font-display text-2xl font-bold text-navy-800 mb-3">Page Not Found</h1>
        <p className="text-mid-gray text-sm mb-8 max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => nav(-1)} className="btn-outline flex items-center gap-2 justify-center">
            <ArrowLeft size={16}/> Go Back
          </button>
          <Link to="/" className="btn-primary flex items-center gap-2 justify-center">
            <Home size={16}/> Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ErrorPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center animate-slide-up">
        <p className="font-display text-8xl font-bold text-red-200 mb-4">500</p>
        <h1 className="font-display text-2xl font-bold text-navy-800 mb-3">Server Error</h1>
        <p className="text-mid-gray text-sm mb-8 max-w-xs mx-auto">
          Something went wrong on our end. Please try again in a few moments.
        </p>
        <Link to="/" className="btn-primary flex items-center gap-2 justify-center w-fit mx-auto">
          <Home size={16}/> Return Home
        </Link>
      </div>
    </div>
  );
}
