import React, { ReactNode, useState } from 'react';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';
import { TopHeader } from './TopHeader';
import { BottomNavigation } from './BottomNavigation';

export interface ResponsiveLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
  headerProps?: React.ComponentProps<typeof TopHeader>;
  bottomNavProps?: React.ComponentProps<typeof BottomNavigation>;
  sidebar?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

/**
 * ResponsiveLayout - Layout principal responsive
 * Adaptează automat structura pentru mobile/tablet/desktop
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  showHeader = true,
  showBottomNav = true,
  headerProps,
  bottomNavProps,
  sidebar,
  maxWidth = 'xl',
  padding = true,
  className = '',
}) => {
  const { isMobile } = useDeviceDetect();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      {showHeader && (
        <TopHeader
          {...headerProps}
          showMenu={!!sidebar}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Desktop only */}
        {sidebar && (
          <>
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-64 xl:w-80 bg-white border-r border-gray-200 overflow-y-auto">
              <div className="p-4">{sidebar}</div>
            </aside>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <aside
                  className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4">
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="mb-4 text-gray-500 hover:text-gray-700"
                    >
                      ✕ Close
                    </button>
                    {sidebar}
                  </div>
                </aside>
              </div>
            )}
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div
            className={`
              ${maxWidthClasses[maxWidth]}
              mx-auto
              ${padding ? 'p-4 md:p-6 lg:p-8' : ''}
              ${showBottomNav && isMobile ? 'pb-20' : ''}
              ${className}
            `}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile/Tablet only */}
      {showBottomNav && <BottomNavigation {...bottomNavProps} />}
    </div>
  );
};
