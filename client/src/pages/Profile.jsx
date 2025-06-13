// Profile.jsx - User profile page component

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';

const Profile = () => {
  const { user } = useAuth();
  const { 
    profile,
    isLoading,
    updateProfile,
    isUpdating,
    changePassword,
    isChangingPassword
  } = useProfile();
  
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form setup
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
    }
  });
  
  // Password form setup
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch
  } = useForm();
  
  // Watch new password to compare with confirm password
  const newPassword = watch('newPassword');
  
  // Update profile when profile data changes
  React.useEffect(() => {
    if (profile) {
      resetProfile({
        name: profile.name,
        bio: profile.bio || '',
      });
    }
  }, [profile, resetProfile]);
  
  // Handle profile update submission
  const onProfileSubmit = (data) => {
    updateProfile(data);
  };
  
  // Handle password change submission
  const onPasswordSubmit = (data) => {
    changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    resetPassword();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">My Profile</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'profile'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Information
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'security'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>
      
      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-6">
              {user?.avatar ? (
                <img
                  src={user.avatar.startsWith('http')
                    ? user.avatar
                    : `/uploads/${user.avatar}`}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl text-gray-600">{user?.name?.charAt(0)}</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Name</label>
              <input
                type="text"
                {...registerProfile('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              />
              {profileErrors.name && (
                <span className="text-red-500 text-sm">{profileErrors.name.message}</span>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Bio</label>
              <textarea
                {...registerProfile('bio', {
                  maxLength: {
                    value: 500,
                    message: 'Bio cannot exceed 500 characters',
                  },
                })}
                rows="4"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Tell us about yourself..."
              ></textarea>
              {profileErrors.bio && (
                <span className="text-red-500 text-sm">{profileErrors.bio.message}</span>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      )}
      
      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                {...registerPassword('currentPassword', {
                  required: 'Current password is required',
                })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              />
              {passwordErrors.currentPassword && (
                <span className="text-red-500 text-sm">
                  {passwordErrors.currentPassword.message}
                </span>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                {...registerPassword('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              />
              {passwordErrors.newPassword && (
                <span className="text-red-500 text-sm">
                  {passwordErrors.newPassword.message}
                </span>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                {...registerPassword('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => 
                    value === newPassword || 'The passwords do not match',
                })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              />
              {passwordErrors.confirmPassword && (
                <span className="text-red-500 text-sm">
                  {passwordErrors.confirmPassword.message}
                </span>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring disabled:opacity-50"
            >
              {isChangingPassword ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
