import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white border-b">
      <div className="container">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            MERN Blog
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/posts"
              className={`nav-link ${isActive('/posts') ? 'active' : ''}`}
            >
              Posts
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/create-post"
                  className={`nav-link ${isActive('/create-post') ? 'active' : ''}`}
                >
                  Write Post
                </Link>
                <div className="flex items-center gap-4 ml-4">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 nav-link"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 font-semibold text-sm">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">{user?.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline btn-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4 ml-4">
                <Link
                  to="/login"
                  className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8"
          >
            <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
            <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link
                to="/posts"
                onClick={() => setIsMenuOpen(false)}
                className={`nav-link ${isActive('/posts') ? 'active' : ''}`}
              >
                Posts
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/create-post"
                    onClick={() => setIsMenuOpen(false)}
                    className={`nav-link ${isActive('/create-post') ? 'active' : ''}`}
                  >
                    Write Post
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="nav-link text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className={`nav-link ${isActive('/register') ? 'active' : ''}`}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
