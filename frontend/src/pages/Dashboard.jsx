import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, UserX, Shield, Briefcase, UserCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
      <Icon size={22} className={color} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value ?? '—'}</p>
    </div>
  </div>
);

const QuickAction = ({ to, icon: Icon, title, desc, color }) => (
  <Link
    to={to}
    className="card p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
  >
    <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center shrink-0`}>
      <Icon size={18} className="text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900 text-sm">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5 truncate">{desc}</p>
    </div>
    <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
  </Link>
);

export default function Dashboard() {
  const { user, isAdmin, isAdminOrManager } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      usersAPI
        .getStats()
        .then(({ data }) => setStats(data.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAdmin]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="card p-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white border-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-primary-200 text-sm font-medium">{greeting()},</p>
            <h2 className="text-2xl font-bold mt-0.5">{user?.name} 👋</h2>
            <p className="text-primary-200 mt-1 text-sm capitalize">
              Logged in as <span className="text-white font-semibold">{user?.role}</span>
            </p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <TrendingUp size={28} className="text-white" />
          </div>
        </div>
      </div>

      {/* Stats (admin only) */}
      {isAdmin && (
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-3">System Overview</h3>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-16 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-8" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard icon={Users} label="Total Users" value={stats?.total} color="text-primary-600" bg="bg-primary-50" />
              <StatCard icon={UserCheck} label="Active" value={stats?.active} color="text-emerald-600" bg="bg-emerald-50" />
              <StatCard icon={UserX} label="Inactive" value={stats?.inactive} color="text-red-500" bg="bg-red-50" />
              <StatCard icon={Shield} label="Admins" value={stats?.admins} color="text-purple-600" bg="bg-purple-50" />
              <StatCard icon={Briefcase} label="Managers" value={stats?.managers} color="text-blue-600" bg="bg-blue-50" />
              <StatCard icon={UserCircle} label="Users" value={stats?.users} color="text-gray-600" bg="bg-gray-100" />
            </div>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-3">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {isAdminOrManager && (
            <QuickAction
              to="/users"
              icon={Users}
              title="Manage Users"
              desc="View, search and manage all users"
              color="bg-primary-600"
            />
          )}
          {isAdmin && (
            <QuickAction
              to="/users/create"
              icon={Shield}
              title="Create New User"
              desc="Add a new user to the system"
              color="bg-purple-600"
            />
          )}
          <QuickAction
            to="/profile"
            icon={UserCircle}
            title="My Profile"
            desc="View and update your profile details"
            color="bg-emerald-600"
          />
        </div>
      </div>

      {/* Role permissions info */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Permissions</h3>
        <div className="space-y-2">
          {user?.role === 'admin' && (
            <>
              <PermRow label="Create, edit, and delete users" allowed />
              <PermRow label="Assign and change user roles" allowed />
              <PermRow label="View all user profiles" allowed />
              <PermRow label="Access system statistics" allowed />
            </>
          )}
          {user?.role === 'manager' && (
            <>
              <PermRow label="View list of non-admin users" allowed />
              <PermRow label="Update non-admin user details" allowed />
              <PermRow label="Create or delete users" allowed={false} />
              <PermRow label="Change user roles" allowed={false} />
            </>
          )}
          {user?.role === 'user' && (
            <>
              <PermRow label="View your own profile" allowed />
              <PermRow label="Update your name and password" allowed />
              <PermRow label="View or manage other users" allowed={false} />
              <PermRow label="Change your role" allowed={false} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const PermRow = ({ label, allowed }) => (
  <div className="flex items-center gap-2 text-sm">
    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${allowed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
      {allowed ? '✓' : '✗'}
    </span>
    <span className={allowed ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
  </div>
);
