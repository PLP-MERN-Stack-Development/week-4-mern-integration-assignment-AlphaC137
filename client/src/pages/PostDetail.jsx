import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { postService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showCommentForm, setShowCommentForm] = useState(false);

  // Form for comments
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Fetch post data
  const { data: postData, isLoading, error } = useQuery(
    ['post', id],
    () => postService.getPost(id),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Delete post mutation
  const deletePostMutation = useMutation(
    () => postService.deletePost(id),
    {
      onSuccess: () => {
        toast.success('Post deleted successfully!');
        queryClient.invalidateQueries('posts');
        navigate('/posts');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to delete post');
      },
    }
  );

  // Add comment mutation
  const addCommentMutation = useMutation(
    (commentData) => postService.addComment(id, commentData),
    {
      onSuccess: () => {
        toast.success('Comment added successfully!');
        queryClient.invalidateQueries(['post', id]);
        reset();
        setShowCommentForm(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to add comment');
      },
    }
  );

  const post = postData?.data;

  const handleDeletePost = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate();
    }
  };

  const onSubmitComment = (data) => {
    addCommentMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-body text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
            <p className="text-gray-600 mb-6">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/posts" className="btn btn-primary">
              Back to Posts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const canEditOrDelete = user && (user.id === post.author?._id || user.role === 'admin');

  return (
    <div className="container py-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link 
          to="/posts" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Posts
        </Link>
      </div>

      {/* Post Content */}
      <article className="card mb-8">
        {/* Featured Image */}
        {post.featuredImage && post.featuredImage !== 'default-post.jpg' && (
          <div className="h-64 md:h-96 overflow-hidden">
            <img
              src={`/api/uploads/${post.featuredImage}`}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="card-body">
          {/* Post Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {post.category && (
              <span
                className="text-sm px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: post.category.color }}
              >
                {post.category.name}
              </span>
            )}
            <span className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {post.viewCount} views
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {post.author?.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-blue-600 font-semibold text-lg">
                  {post.author?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{post.author?.name}</h3>
              {post.author?.bio && (
                <p className="text-gray-600 text-sm">{post.author.bio}</p>
              )}
            </div>
          </div>

          {/* Post Content */}
          <div className="post-content prose max-w-none mb-8">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {canEditOrDelete && (
            <div className="flex gap-4 pt-6 border-t">
              <Link
                to={`/edit-post/${post._id}`}
                className="btn btn-primary btn-sm"
              >
                Edit Post
              </Link>
              <button
                onClick={handleDeletePost}
                disabled={deletePostMutation.isLoading}
                className="btn btn-danger btn-sm"
              >
                {deletePostMutation.isLoading ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          )}
        </div>
      </article>

      {/* Comments Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">
            Comments ({post.comments?.length || 0})
          </h2>
        </div>

        <div className="card-body">
          {/* Add Comment Form */}
          {isAuthenticated ? (
            <div className="mb-6">
              {!showCommentForm ? (
                <button
                  onClick={() => setShowCommentForm(true)}
                  className="btn btn-outline"
                >
                  Add a Comment
                </button>
              ) : (
                <form onSubmit={handleSubmit(onSubmitComment)} className="space-y-4">
                  <div className="form-group">
                    <label htmlFor="content" className="form-label">
                      Your Comment
                    </label>
                    <textarea
                      id="content"
                      className="form-input form-textarea"
                      placeholder="Write your comment..."
                      rows={4}
                      {...register('content', {
                        required: 'Comment is required',
                        minLength: {
                          value: 1,
                          message: 'Comment cannot be empty',
                        },
                        maxLength: {
                          value: 500,
                          message: 'Comment cannot exceed 500 characters',
                        },
                      })}
                    />
                    {errors.content && (
                      <p className="form-error">{errors.content.message}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={addCommentMutation.isLoading}
                      className="btn btn-primary btn-sm"
                    >
                      {addCommentMutation.isLoading ? 'Posting...' : 'Post Comment'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCommentForm(false);
                        reset();
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                <Link to="/login" className="text-blue-600 hover:text-blue-700">
                  Login
                </Link>{' '}
                to join the conversation.
              </p>
            </div>
          )}

          {/* Comments List */}
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <div key={comment._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {comment.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {comment.user?.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
