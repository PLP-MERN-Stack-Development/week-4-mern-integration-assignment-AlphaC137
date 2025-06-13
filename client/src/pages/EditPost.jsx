import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { postService, categoryService } from '../services/api';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm();

  // Fetch post data
  const { data: postData, isLoading: postLoading, error: postError } = useQuery(
    ['post', id],
    () => postService.getPost(id),
    {
      onSuccess: (response) => {
        const post = response.data;
        // Set form values
        setValue('title', post.title);
        setValue('content', post.content);
        setValue('excerpt', post.excerpt || '');
        setValue('category', post.category._id);
        setValue('isPublished', post.isPublished);
        setValue('tags', post.tags ? post.tags.join(', ') : '');
        
        // Set current image
        if (post.featuredImage && post.featuredImage !== 'default-post.jpg') {
          setCurrentImage(`/api/uploads/${post.featuredImage}`);
        }
      },
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

  const categories = categoriesData?.data || [];

  // Update post mutation
  const updatePostMutation = useMutation(
    (postData) => postService.updatePost(id, postData),
    {
      onSuccess: (response) => {
        toast.success('Post updated successfully!');
        queryClient.invalidateQueries(['post', id]);
        queryClient.invalidateQueries('posts');
        navigate(`/posts/${response.data._id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update post');
      },
    }
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setCurrentImage(null);
    // Reset file input
    const fileInput = document.getElementById('featuredImage');
    if (fileInput) fileInput.value = '';
  };

  const onSubmit = async (data) => {
    try {
      // Process tags
      const tagsArray = data.tags
        ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('excerpt', data.excerpt || '');
      formData.append('category', data.category);
      formData.append('isPublished', data.isPublished);
      formData.append('tags', JSON.stringify(tagsArray));

      if (selectedFile) {
        formData.append('featuredImage', selectedFile);
      }

      await updatePostMutation.mutateAsync(formData);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (postLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (postError) {
    return (
      <div className="container py-8">
        <div className="card">
          <div className="card-body text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
            <p className="text-gray-600 mb-6">
              The post you're trying to edit doesn't exist or has been removed.
            </p>
            <button 
              onClick={() => navigate('/posts')}
              className="btn btn-primary"
            >
              Back to Posts
            </button>
          </div>
        </div>
      </div>
    );
  }

  const post = postData?.data;
  const title = watch('title');

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Post</h1>
          <p className="text-gray-600">Update your post details</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  className="form-input"
                  placeholder="Enter your post title"
                  {...register('title', {
                    required: 'Title is required',
                    minLength: {
                      value: 3,
                      message: 'Title must be at least 3 characters',
                    },
                    maxLength: {
                      value: 100,
                      message: 'Title cannot exceed 100 characters',
                    },
                  })}
                />
                {errors.title && (
                  <p className="form-error">{errors.title.message}</p>
                )}
              </div>

              {/* Content */}
              <div className="form-group">
                <label htmlFor="content" className="form-label">
                  Content *
                </label>
                <textarea
                  id="content"
                  className="form-input form-textarea"
                  placeholder="Write your post content here..."
                  rows={12}
                  {...register('content', {
                    required: 'Content is required',
                    minLength: {
                      value: 10,
                      message: 'Content must be at least 10 characters',
                    },
                  })}
                />
                {errors.content && (
                  <p className="form-error">{errors.content.message}</p>
                )}
              </div>

              {/* Excerpt */}
              <div className="form-group">
                <label htmlFor="excerpt" className="form-label">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  className="form-input form-textarea"
                  placeholder="Brief description of your post (auto-generated if left empty)"
                  rows={3}
                  {...register('excerpt', {
                    maxLength: {
                      value: 200,
                      message: 'Excerpt cannot exceed 200 characters',
                    },
                  })}
                />
                {errors.excerpt && (
                  <p className="form-error">{errors.excerpt.message}</p>
                )}
              </div>

              {/* Featured Image */}
              <div className="form-group">
                <label htmlFor="featuredImage" className="form-label">
                  Featured Image
                </label>
                <div className="space-y-4">
                  <input
                    type="file"
                    id="featuredImage"
                    className="form-input"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <p className="text-sm text-gray-500">
                    Recommended size: 1200x600px. Max file size: 5MB.
                  </p>
                  
                  {/* Show image preview if a new file is selected */}
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Show current image if no new file is selected */}
                  {!imagePreview && currentImage && (
                    <div className="relative">
                      <img
                        src={currentImage}
                        alt="Current Featured Image"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold">Publish</h3>
                </div>
                <div className="card-body space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublished"
                      className="mr-2"
                      {...register('isPublished')}
                    />
                    <label htmlFor="isPublished" className="text-sm">
                      Publish immediately
                    </label>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <button
                      type="submit"
                      disabled={updatePostMutation.isLoading}
                      className="btn btn-primary w-full"
                    >
                      {updatePostMutation.isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="loading-spinner mr-2"></div>
                          Updating...
                        </div>
                      ) : (
                        'Update Post'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold">Category</h3>
                </div>
                <div className="card-body">
                  {categoriesLoading ? (
                    <div className="flex justify-center">
                      <div className="loading-spinner"></div>
                    </div>
                  ) : (
                    <select
                      className="form-input w-full"
                      {...register('category', {
                        required: 'Please select a category',
                      })}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.category && (
                    <p className="form-error mt-1">{errors.category.message}</p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold">Tags</h3>
                </div>
                <div className="card-body">
                  <input
                    type="text"
                    className="form-input w-full"
                    placeholder="tag1, tag2, tag3"
                    {...register('tags')}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Separate tags with commas
                  </p>
                </div>
              </div>

              {/* Preview */}
              {title && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="font-semibold">Preview</h3>
                  </div>
                  <div className="card-body">
                    <h4 className="font-medium text-sm text-gray-900 mb-2">
                      {title}
                    </h4>
                    {(imagePreview || currentImage) && (
                      <img
                        src={imagePreview || currentImage}
                        alt="Preview"
                        className="w-full h-20 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
