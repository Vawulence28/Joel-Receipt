import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldCheck, Users, FileText, Receipt, LayoutDashboard, TrendingUp, Settings, Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-teal-700 text-white shadow-sm'
        : 'text-slate-200 hover:bg-slate-800 hover:text-white'
    }`;

  const mobileNavClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
      isActive
        ? 'bg-teal-700 text-white shadow-sm'
        : 'text-slate-200 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shadow-md sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              {/* Official Logo Display */}
              <div className="h-9 w-9 flex items-center justify-center bg-white/10 rounded-lg p-1 border border-slate-700 overflow-hidden">
                <img src={logo} alt="Joel Consult Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold tracking-wider text-white">JOEL CONSULT</span>
                <span className="hidden sm:inline-block ml-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30">FINANCE</span>
              </div>
            </div>

            <nav className="hidden lg:flex space-x-1">
              <NavLink to="/dashboard" className={navClass}><LayoutDashboard className="h-4 w-4" /><span>Dashboard</span></NavLink>
              <NavLink to="/clients" className={navClass}><Users className="h-4 w-4" /><span>Clients</span></NavLink>
              <NavLink to="/quotations" className={navClass}><FileText className="h-4 w-4" /><span>Quotations</span></NavLink>
              <NavLink to="/invoices" className={navClass}><Receipt className="h-4 w-4" /><span>Invoices</span></NavLink>
              <NavLink to="/letters" className={navClass}><FileText className="h-4 w-4" /><span>Letters</span></NavLink>
              <NavLink to="/receipts" className={navClass}><Receipt className="h-4 w-4" /><span>Receipts</span></NavLink>
              <NavLink to="/reports" className={navClass}><TrendingUp className="h-4 w-4" /><span>Reports</span></NavLink>
              <NavLink to="/settings" className={navClass}><Settings className="h-4 w-4" /><span>Settings</span></NavLink>
            </nav>
          </div>

          {/* Right Action & Mobile Hamburger */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-slate-300 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              <span>{user?.full_name || user?.fullName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-6 space-y-2 shadow-2xl">
          <div className="px-3 py-2 text-xs font-medium text-teal-400 border-b border-slate-800 mb-2 flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Signed in as {user?.full_name || user?.fullName}</span>
          </div>
          <div onClick={() => setMobileMenuOpen(false)} className="space-y-1">
            <NavLink to="/dashboard" className={mobileNavClass}><LayoutDashboard className="h-5 w-5" /><span>Dashboard</span></NavLink>
            <NavLink to="/clients" className={mobileNavClass}><Users className="h-5 w-5" /><span>Clients</span></NavLink>
            <NavLink to="/quotations" className={mobileNavClass}><FileText className="h-5 w-5" /><span>Quotations</span></NavLink>
            <NavLink to="/invoices" className={mobileNavClass}><Receipt className="h-5 w-5" /><span>Invoices</span></NavLink>
            <NavLink to="/letters" className={navClass}><FileText className="h-5 w-5" /><span>Letters</span></NavLink>
            <NavLink to="/receipts" className={mobileNavClass}><Receipt className="h-5 w-5" /><span>Receipts</span></NavLink>
            <NavLink to="/reports" className={mobileNavClass}><TrendingUp className="h-5 w-5" /><span>Reports</span></NavLink>
            <NavLink to="/settings" className={mobileNavClass}><Settings className="h-5 w-5" /><span>Settings</span></NavLink>
          </div>
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 rounded-lg bg-red-600/20 border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-600/30"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};