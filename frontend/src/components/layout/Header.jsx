// components/layout/Header.js
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { menuItems } from '../../constants/menuItems';

const getBreadcrumbItems = (activeMenu) => {
  const items = [];
  
  // Always add the Home/Dashboard item first
  items.push({ id: 'dashboard', label: 'Home', icon: <Home className="w-4 h-4" /> });

  // Find the active menu item in the entire menuItems structure
  let activeMenuItem = null;
  let parentMenuItem = null;

  for (const item of menuItems) {
    if (item.id === activeMenu) {
      activeMenuItem = item;
      break;
    }
    if (item.subItems) {
      const subItem = item.subItems.find(sub => sub.id === activeMenu);
      if (subItem) {
        parentMenuItem = item;
        activeMenuItem = subItem;
        break;
      }
    }
  }

  // If a parent item exists (for sub-menus), add it to the breadcrumbs
  if (parentMenuItem) {
    items.push({ id: parentMenuItem.id, label: parentMenuItem.label, icon: parentMenuItem.icon });
  }

  // If the active menu is not the dashboard, add it to the breadcrumbs
  // This check prevents the duplicate 'dashboard' key
  if (activeMenuItem && activeMenuItem.id !== 'dashboard') {
    items.push({ id: activeMenuItem.id, label: activeMenuItem.label, icon: activeMenuItem.icon });
  }

  return items;
};

export default function Header({ activeMenu, setActiveMenu }) {
  const breadcrumbItems = getBreadcrumbItems(activeMenu);

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <nav className="flex items-center text-gray-500">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {breadcrumbItems.map((item, index) => (
              <li key={item.id} className="inline-flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                )}
                <span className="flex items-center text-sm font-medium">
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  <span 
                    className={`text-gray-700 hover:text-gray-900 cursor-pointer ${index === breadcrumbItems.length - 1 ? 'text-gray-900 font-semibold' : ''}`}
                    onClick={() => setActiveMenu(item.id)}
                  >
                    {item.label}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}