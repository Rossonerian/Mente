export const responsiveBreakpoints = {
  tablet: 768,
  desktop: 1024,
} as const;

export const caregiverContentMaxWidth = 1180;

export type LayoutPlatform = 'native' | 'web';

export interface ResponsiveLayout {
  width: number;
  isWideWeb: boolean;
  isDesktopWeb: boolean;
  contentMaxWidth?: number;
}

export function getResponsiveLayout(width: number, platform: LayoutPlatform): ResponsiveLayout {
  const isWeb = platform === 'web';
  const isWideWeb = isWeb && width >= responsiveBreakpoints.tablet;

  return {
    width,
    isWideWeb,
    isDesktopWeb: isWeb && width >= responsiveBreakpoints.desktop,
    contentMaxWidth: isWideWeb ? caregiverContentMaxWidth : undefined,
  };
}
