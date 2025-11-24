import { useState, useEffect } from 'react';

/**
 * Hook pentru detectarea media queries
 * @param query - Media query string (ex: '(min-width: 768px)')
 * @returns boolean - true dacă media query match-uiește
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    // Add listener
    media.addEventListener('change', listener);

    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

/**
 * Breakpoints conform Tailwind CSS
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Hook pentru detectarea device-ului curent
 */
export const useResponsive = () => {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.md})`);
  const isTablet = useMediaQuery(`(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`);
  const isDesktop = useMediaQuery(`(min-width: ${breakpoints.lg})`);

  return {
    isMobile,
    isTablet,
    isDesktop,
    device: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
  };
};
