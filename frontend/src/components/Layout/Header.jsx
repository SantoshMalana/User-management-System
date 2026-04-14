import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, ChevronRight, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const breadcrumbMap = {
  dashboard: 'Dashboard',
  users: 'Users',
  create: 'Create User',
  profile: 'My Profile',
  edit: 'Edit User',
};

export default function Header({ onMenuClick }) {
  const location = useLocation();
  const { user } = useAuth();

  const segments = location.pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    label: breadcrumbMap[seg] || (seg.length === 24 ? 'Detail' : seg),
    path: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm">
          <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
            <Home size={15} />
          </Link>
          {crumbs.map((crumb) => (
            <React.Fragment key={crumb.path}>
              <ChevronRight size={14} className="text-gray-300" />
              {crumb.isLast ? (
                <span className="font-medium text-gray-800">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="text-gray-500 hover:text-gray-700 transition-colors">
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
