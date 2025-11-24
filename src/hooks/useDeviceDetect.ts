import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  type: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
}

/**
 * Hook avansat pentru detectarea device-ului și orientării
 */
export const useDeviceDetect = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;

    return {
      type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
      isMobile,
      isTablet,
      isDesktop,
      width,
      height,
      orientation: width > height ? 'landscape' : 'portrait',
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      setDeviceInfo({
        type: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        isMobile,
        isTablet,
        isDesktop,
        width,
        height,
        orientation: width > height ? 'landscape' : 'portrait',
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceInfo;
};
