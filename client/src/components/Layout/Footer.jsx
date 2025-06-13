import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* About Section */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-900">About MERN Blog</h3>
            <p className="text-gray-600 text-sm">
              A modern blog platform built with MongoDB, Express.js, React.js, and Node.js. 
              Share your thoughts and connect with fellow writers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <a href="/" className="text-gray-600 hover:text-blue-600 text-sm">
                Home
              </a>
              <a href="/posts" className="text-gray-600 hover:text-blue-600 text-sm">
                All Posts
              </a>
              <a href="/create-post" className="text-gray-600 hover:text-blue-600 text-sm">
                Write a Post
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Connect</h3>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">
                GitHub
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">
                Twitter
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © {currentYear} MERN Blog. All rights reserved.
            </p>
            <p className="text-gray-600 text-sm mt-2 md:mt-0">
              Built with ❤️ using MERN Stack
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
