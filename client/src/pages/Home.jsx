import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { postService, categoryService } from '../services/api';

const Home = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);

  // Fetch recent posts
  const { data: postsData, isLoading: postsLoading, error: postsError } = useQuery(
    ['posts', { limit: 6 }],
    () => postService.getAllPosts(1, 6),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    'categories',
    categoryService.getAllCategories,
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const recentPosts = postsData?.data || [];
  const categories = categoriesData?.data || [];

  if (postsError) {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-body text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-600">
              We couldn't load the posts. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-50 py-16">
        <div className="container">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-blue-600">MERN Blog</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover amazing stories, share your thoughts, and connect with a community of passionate writers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/posts" className="btn btn-primary btn-lg">
                Explore Posts
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">
                Join Our Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Explore Categories
            </h2>
            {categoriesLoading ? (
              <div className="flex justify-center">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categories.slice(0, 6).map((category) => (
                  <Link
                    key={category._id}
                    to={`/posts?category=${category._id}`}
                    className="card hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="card-body">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-gray-600 text-sm mt-1">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Recent Posts Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Recent Posts
            </h2>
            <Link to="/posts" className="text-blue-600 hover:text-blue-700 font-medium">
              View All Posts →
            </Link>
          </div>

          {postsLoading ? (
            <div className="flex justify-center">
              <div className="loading-spinner"></div>
            </div>
          ) : recentPosts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <article key={post._id} className="card hover:shadow-lg transition-shadow duration-200">
                  {post.featuredImage && post.featuredImage !== 'default-post.jpg' && (
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={`/api/uploads/${post.featuredImage}`}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="card-body">
                    <div className="flex items-center gap-2 mb-3">
                      {post.category && (
                        <span
                          className="text-xs px-2 py-1 rounded-full text-white"
                          style={{ backgroundColor: post.category.color }}
                        >
                          {post.category.name}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      <Link 
                        to={`/posts/${post._id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-xs">
                            {post.author?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {post.author?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.viewCount || 0}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to share your story!
              </p>
              <Link to="/create-post" className="btn btn-primary">
                Write Your First Post
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Share Your Story?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our community of writers and start sharing your thoughts with the world.
          </p>
          <Link to="/register" className="btn bg-white text-blue-600 hover:bg-gray-100 btn-lg">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
