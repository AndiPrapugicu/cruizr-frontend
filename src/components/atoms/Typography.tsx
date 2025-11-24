import React from 'react';

export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'label';
export type TypographyAlign = 'left' | 'center' | 'right' | 'justify';
export type TypographyColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'gray' | 'white';

export interface TypographyProps {
  variant?: TypographyVariant;
  align?: TypographyAlign;
  color?: TypographyColor;
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}

const variantStyles: Record<TypographyVariant, string> = {
  h1: 'text-4xl md:text-5xl lg:text-6xl font-bold leading-tight',
  h2: 'text-3xl md:text-4xl lg:text-5xl font-bold leading-tight',
  h3: 'text-2xl md:text-3xl lg:text-4xl font-bold leading-snug',
  h4: 'text-xl md:text-2xl lg:text-3xl font-semibold leading-snug',
  h5: 'text-lg md:text-xl lg:text-2xl font-semibold leading-normal',
  h6: 'text-base md:text-lg lg:text-xl font-semibold leading-normal',
  body1: 'text-base leading-relaxed',
  body2: 'text-sm leading-relaxed',
  caption: 'text-xs leading-normal',
  label: 'text-sm font-medium leading-normal',
};

const colorStyles: Record<TypographyColor, string> = {
  primary: 'text-pink-600',
  secondary: 'text-purple-600',
  success: 'text-green-600',
  danger: 'text-red-600',
  warning: 'text-yellow-600',
  gray: 'text-gray-600',
  white: 'text-white',
};

const alignStyles: Record<TypographyAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

const defaultElements: Record<TypographyVariant, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body1: 'p',
  body2: 'p',
  caption: 'span',
  label: 'label',
};

/**
 * Component Typography responsive pentru text
 * Adaptează automat dimensiunile pe mobile/tablet/desktop
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  align = 'left',
  color = 'gray',
  className = '',
  children,
  as,
}) => {
  const Component = (as || defaultElements[variant]) as React.ElementType;

  return (
    <Component
      className={`
        ${variantStyles[variant]}
        ${colorStyles[color]}
        ${alignStyles[align]}
        ${className}
      `}
    >
      {children}
    </Component>
  );
};
