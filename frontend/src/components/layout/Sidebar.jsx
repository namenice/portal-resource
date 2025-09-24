// src/components/layout/Sidebar.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Server, ChevronLeft, Menu, ChevronRight, LogOut, Code, User, Home, Database, Globe, Layers, HardDrive, MapPin } from 'lucide-react';
import { menuItems } from '../../constants/menuItems';

const isParentActive = (parentItem, activeId) => {
  if (parentItem.id === activeId) {
    return true;
  }
  if (parentItem.subItems) {
    return parentItem.subItems.some(subItem => subItem.id === activeId);
  }
  return false;
};

const getBadge = (badge) => {
  if (!badge) return null;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge.variant === 'primary' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {badge.text}
    </span>
  );
};

export default function Sidebar({ sidebarCollapsed, setSidebarCollapsed, activeMenu, setActiveMenu, expandedMenus, toggleSubmenu }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. ลบ token ออกจาก localStorage
    localStorage.removeItem('authToken');
    // 2. นำผู้ใช้ไปยังหน้า Login
    navigate('/login');
  };

  return (
    <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 h-16">
        <div className={`flex items-center transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <Server className="h-6 w-6 text-gray-900" />
          <span className="text-xl font-bold ml-2 text-gray-900">CloudOps</span>
        </div>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <div key={item.id}>
              <Link
                to={item.subItems ? '#' : (item.id === 'dashboard' ? '/' : `/${item.id}`)}
                onClick={() => {
                  setActiveMenu(item.id);
                  if (item.subItems) {
                    toggleSubmenu(item.id);
                  }
                }}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isParentActive(item, activeMenu)
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className={`${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    <div className="flex items-center space-x-2">
                      {getBadge(item.badge)}
                      {item.subItems && (
                        <span className={`transition-transform ${expandedMenus.includes(item.id) ? 'rotate-90' : ''}`}>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </>
                )}
              </Link>
              
              {/* Sub-menu */}
              {item.subItems && !sidebarCollapsed && expandedMenus.includes(item.id) && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.id}
                      to={`/${subItem.id}`}
                      onClick={() => setActiveMenu(subItem.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                        activeMenu === subItem.id
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3">{subItem.icon}</span>
                      <span>{subItem.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={handleLogout} // 🚨 เพิ่ม onClick handler
          className="w-full flex items-center justify-center px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          <span className={`${sidebarCollapsed ? 'hidden' : 'block'}`}>Log Out</span>
        </button>
      </div>
    </div>
  );
}