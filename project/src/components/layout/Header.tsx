import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, ShoppingCart, User, LogOut, CircuitBoard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsOpen(false);
    setShowDropdown(false);
  }, [location]);

  const headerClass = scrolled
    ? 'bg-white shadow-md transition-all duration-300'
    : 'bg-transparent transition-all duration-300';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Handle clicking outside of dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Only close if clicking outside the profile menu
      if (showDropdown && !target.closest('.profile-menu')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <header className={`fixed w-full top-0 z-50 ${headerClass}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <CircuitBoard className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">TechRental</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            <Link to="/" className="text-base font-medium text-gray-600 hover:text-primary-600 transition-colors">
              Home
            </Link>
            <Link to="/catalog" className="text-base font-medium text-gray-600 hover:text-primary-600 transition-colors">
              Catalog
            </Link>
            {isAuthenticated && user?.role === 'student' && (
              <Link to="/dashboard" className="text-base font-medium text-gray-600 hover:text-primary-600 transition-colors">
                My Rentals
              </Link>
            )}
            {isAuthenticated && (user?.role === 'admin' || user?.role === 'staff') && (
              <Link to="/admin" className="text-base font-medium text-gray-600 hover:text-primary-600 transition-colors">
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-600 hover:text-primary-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            {isAuthenticated ? (
              <div className="relative profile-menu">
                <button 
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">{user?.name.split(' ')[0]}</span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                    {user?.role === 'student' && (
                      <Link 
                        to="/dashboard" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        My Rentals
                      </Link>
                    )}
                    {(user?.role === 'admin' || user?.role === 'staff') && (
                      <Link 
                        to="/admin" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-base font-medium text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-md transition-colors">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              className="text-gray-600 hover:text-primary-600"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md">
              Home
            </Link>
            <Link to="/catalog" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md">
              Catalog
            </Link>
            {isAuthenticated && user?.role === 'student' && (
              <Link to="/dashboard" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md">
                My Rentals
              </Link>
            )}
            {isAuthenticated && (user?.role === 'admin' || user?.role === 'staff') && (
              <Link to="/admin" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md">
                Admin Panel
              </Link>
            )}
            
            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign out
              </button>
            ) : (
              <Link to="/login" className="block px-3 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;