import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  LogOut,
  Shield,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NavItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
        isActive
          ? 'bg-primary-600 text-white shadow-sm'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`
    }
  >
    <Icon size={18} className="shrink-0" />
    <span>{label}</span>
  </NavLink>
);

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdminOrManager } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const roleBadgeColor = {
    admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    manager: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    user: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">UserHub</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Main
        </p>
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={onClose} />
        {isAdminOrManager && (
          <NavItem to="/users" icon={Users} label="Users" onClick={onClose} />
        )}
        <NavItem to="/profile" icon={UserCircle} label="My Profile" onClick={onClose} />
      </nav>

      {/* User info + Logout */}
      <div className="px-3 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
          <div className="w-9 h-9 rounded-full bg-primary-600/30 border border-primary-500/30 flex items-center justify-center shrink-0">
            <span className="text-primary-300 font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <span
              className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium border ${roleBadgeColor[user?.role]}`}
            >
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
