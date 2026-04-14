import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Trash2, Mail, Calendar, Clock,
  UserCircle, Shield, Briefcase, User,
} from 'lucide-react';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const roleIcon = { admin: Shield, manager: Briefcase, user: User };
const roleColor = { admin: 'text-purple-600 bg-purple-50', manager: 'text-blue-600 bg-blue-50', user: 'text-gray-600 bg-gray-100' };

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={15} className="text-gray-500" />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-sm text-gray-800 font-medium mt-0.5">{value || '—'}</p>
    </div>
  </div>
);

export default function UserDetail() {
  const { id } = useParams();
  const { user: currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    usersAPI.getOne(id)
      .then(({ data }) => setUser(data.data))
      .catch(() => { toast.error('User not found'); navigate('/users'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDeactivate = async () => {
    try {
      await usersAPI.delete(id);
      toast.success('User deactivated');
      navigate('/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const canEdit = isAdmin || currentUser._id === id || currentUser.role === 'manager';

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card p-8 animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const RoleIcon = roleIcon[user.role] || User;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-primary-700 font-bold text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`badge badge-${user.role}`}>{user.role}</span>
                <span className={`badge badge-${user.status}`}>{user.status}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <Link to={`/users/${id}/edit`} className="btn-secondary">
                <Pencil size={15} />
                Edit
              </Link>
            )}
            {isAdmin && currentUser._id !== id && (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="btn-danger"
                disabled={user.status === 'inactive'}
              >
                <Trash2 size={15} />
                Deactivate
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Details */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Account Details</h3>
          <div>
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={RoleIcon} label="Role" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} />
            <InfoRow icon={UserCircle} label="Status" value={user.status.charAt(0).toUpperCase() + user.status.slice(1)} />
          </div>
        </div>

        {/* Audit */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Audit Trail</h3>
          <div>
            <InfoRow
              icon={Calendar}
              label="Created At"
              value={new Date(user.createdAt).toLocaleString()}
            />
            <InfoRow
              icon={Clock}
              label="Last Updated"
              value={new Date(user.updatedAt).toLocaleString()}
            />
            <InfoRow
              icon={UserCircle}
              label="Created By"
              value={user.createdBy ? `${user.createdBy.name} (${user.createdBy.email})` : 'System'}
            />
            <InfoRow
              icon={UserCircle}
              label="Last Updated By"
              value={user.updatedBy ? `${user.updatedBy.name} (${user.updatedBy.email})` : '—'}
            />
          </div>
        </div>
      </div>

      {/* Deactivate modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 text-center">Deactivate User?</h3>
            <p className="text-sm text-gray-500 text-center mt-2">
              <strong>{user.name}</strong> will be deactivated and cannot log in.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteConfirm(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDeactivate} className="btn-danger flex-1">Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
