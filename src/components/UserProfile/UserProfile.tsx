import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../contexts/AuthContext';
import { Edit2, Save, X, User as UserIcon, Mail, Info, Camera } from 'lucide-react';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    displayName: '',
    email: '',
    bio: '',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setFormData(prev => ({ ...prev, photoURL: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Profile</h2>
        {!isEditing ? (
          <button 
            className="edit-button"
            onClick={() => setIsEditing(true)}
            aria-label="Edit profile"
          >
            <Edit2 /> Edit
          </button>
        ) : (
          <div className="edit-actions">
            <button 
              className="save-button"
              onClick={handleSubmit}
              aria-label="Save changes"
            >
              <Save /> Save
            </button>
            <button 
              className="cancel-button"
              onClick={() => setIsEditing(false)}
              aria-label="Cancel editing"
            >
              <X /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-avatar">
          {(previewImage || user.photoURL) ? (
            <img src={previewImage || user.photoURL} alt={user.displayName || 'User'} className="avatar" />
          ) : (
            <div className="avatar-placeholder">
              <UserIcon size={48} />
            </div>
          )}
          {isEditing && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              <button className="change-photo-button" onClick={handlePhotoUpload}>
                <Camera /> Change Photo
              </button>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="displayName">
              <UserIcon className="input-icon" /> Display Name
            </label>
            {isEditing ? (
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName || ''}
                onChange={handleInputChange}
                placeholder="Enter your name"
              />
            ) : (
              <div className="profile-field">{user.displayName || 'Not set'}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <X className="h-4 w-4" /> Email
            </label>
            {isEditing ? (
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                placeholder="Enter your email"
                disabled // Email should be changed through a separate flow
              />
            ) : (
              <div className="profile-field">{user.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="bio">
              <Info className="input-icon" /> Bio
            </label>
            {isEditing ? (
              <textarea
                id="bio"
                name="bio"
                value={formData.bio || ''}
                onChange={handleInputChange}
                placeholder="Tell us about yourself"
                rows={3}
              />
            ) : (
              <div className="profile-field">{user.bio || 'No bio provided'}</div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
