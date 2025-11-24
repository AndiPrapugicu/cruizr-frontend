/**
 * Cruizr UI Component Library
 * 
 * Sistem complet de componente organizat după metodologia Atomic Design
 * Fully responsive pentru mobile, tablet și desktop
 */

// ========== HOOKS ==========
export { useMediaQuery, useResponsive, breakpoints } from '../hooks/useMediaQuery';
export { useDeviceDetect } from '../hooks/useDeviceDetect';
export type { DeviceType, DeviceInfo } from '../hooks/useDeviceDetect';

// ========== ATOMS ==========
export * from './atoms';

// ========== MOLECULES ==========
export * from './molecules';

// ========== ORGANISMS ==========
export * from './organisms';

// ========== TEMPLATES ==========
export * from './templates';
