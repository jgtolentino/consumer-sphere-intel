
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, Package, Globe, Star, Bot, X } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { name: 'Overview', href: '/', icon: Home },
  { name: 'Trends', href: '/trends', icon: TrendingUp },
  { name: 'Product Mix', href: '/products', icon: Package },
  { name: 'Regional', href: '/regional', icon: Globe },
  { name: 'Brand Analytics', href: '/brands', icon: Star },
  { name: 'AI Chat', href: '/chat', icon: Bot },
];

interface MobileNavigationProps {
  trigger: React.ReactNode;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ trigger }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      <DrawerContent className="h-[85vh] bg-white">
        <DrawerHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold text-gray-900">
              Navigation
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-base ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-teal-50 text-blue-700 border-l-4 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Active Stores:</span>
                <span className="font-medium">47</span>
              </div>
              <div className="flex justify-between">
                <span>SKUs Tracked:</span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex justify-between">
                <span>Data Points:</span>
                <span className="font-medium">2.4M</span>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
