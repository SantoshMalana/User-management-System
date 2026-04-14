import React, { useState } from 'react';
import { UserCircle, Save, Eye, EyeOff, Mail, Shield, Calendar } from 'lucide-react';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (form.password) {
      if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);

    const payload = { name: form.name, email: form.email };
    if (form.password) payload.password = form.password;

    try {
      const { data } = await usersAPI.update(user._id, payload);
      updateUser(data.data);
      setForm((f) => ({ ...f, password: '', confirmPassword: '' }));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const roleBadgeColor = {
    admin: 'bg-purple-100 text-purple-800 border border-purple-200',
    manager: 'bg-blue-100 text-blue-800 border border-blue-200',
    user: 'bg-gray-100 text-gray-800 border border-gray-200',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary-200">
            <span className="text-white font-bold text-3xl">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1.5">
              <Mail size={13} />
              {user?.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${roleBadgeColor[user?.role]}`}>
                {user?.role}
              </span>
              <span className={`badge badge-${user?.status}`}>{user?.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Edit form */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <UserCircle size={16} className="text-primary-600" />
            Edit Profile
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" className={`input ${errors.name ? 'input-error' : ''}`}
                value={form.name} onChange={set('name')} placeholder="Your full name" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="label">Email Address</label>
              <input type="email" className={`input ${errors.email ? 'input-error' : ''}`}
                value={form.email} onChange={set('email')} placeholder="your@email.com" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Change Password
              </p>
              <div className="space-y-3">
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                      value={form.password}
                      onChange={set('password')}
                      placeholder="Leave blank to keep current"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    placeholder="Repeat new password"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={16} />
                  Save Changes
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Account info */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Shield size={16} className="text-primary-600" />
            Account Information
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium">Role</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5 capitalize">{user?.role}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium">Account Status</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5 capitalize">{user?.status}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                <Calendar size={12} />
                Member Since
              </p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="text-xs font-medium text-amber-800">Note</p>
              <p className="text-xs text-amber-700 mt-0.5">
                You cannot change your role. Contact an admin if needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
