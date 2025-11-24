/**
 * Cruizr UI Component Library
 * 
 * Sistem complet de componente organizat după metodologia Atomic Design
 * Fully responsive pentru mobile, tablet și desktop
 */

// ========== HOOKS ==========
export { useMediaQuery, useResponsive, breakpoints } from './hooks/useMediaQuery';
export { useDeviceDetect } from './hooks/useDeviceDetect';
export type { DeviceType, DeviceInfo } from './hooks/useDeviceDetect';

// ========== ATOMS ==========
export * from './components/atoms';

// ========== MOLECULES ==========
export * from './components/molecules';

// ========== ORGANISMS ==========
export * from './components/organisms';

// ========== TEMPLATES ==========
export * from './components/templates';
