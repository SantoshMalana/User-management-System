import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAdmin, isManager } = useAuth();
  const isSelf = currentUser._id === id;

  const [form, setForm] = useState({ name: '', email: '', role: '', status: '', password: '' });
  const [original, setOriginal] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    usersAPI.getOne(id)
      .then(({ data }) => {
        const u = data.data;
        setOriginal(u);
        setForm({ name: u.name, email: u.email, role: u.role, status: u.status, password: '' });
      })
      .catch(() => { toast.error('User not found'); navigate('/users'); })
      .finally(() => setLoading(false));
  }, [id]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (form.password && form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);

    const payload = { name: form.name, email: form.email };
    if (!isSelf) { payload.role = form.role; payload.status = form.status; }
    if (form.password) payload.password = form.password;

    try {
      await usersAPI.update(id, payload);
      toast.success('User updated successfully!');
      navigate(`/users/${id}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to update user';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto card p-8 animate-pulse space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  const canChangeRole = isAdmin && !isSelf;
  const canChangeStatus = isAdmin && !isSelf;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Save size={18} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Edit User</h1>
            <p className="text-sm text-gray-500">{original?.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" className={`input ${errors.name ? 'input-error' : ''}`}
              placeholder="John Doe" value={form.name} onChange={set('name')} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="label">Email Address</label>
            <input type="email" className={`input ${errors.email ? 'input-error' : ''}`}
              placeholder="john@example.com" value={form.email} onChange={set('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {canChangeRole && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Role</label>
                <select className="input" value={form.role} onChange={set('role')}>
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {canChangeStatus && (
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={form.status} onChange={set('status')}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="label">
              New Password{' '}
              <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={set('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          {isSelf && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
              You can update your name, email, and password. Role and status cannot be self-modified.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Link to={`/users/${id}`} className="btn-secondary flex-1">Cancel</Link>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
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
          </div>
        </form>
      </div>
    </div>
  );
}
