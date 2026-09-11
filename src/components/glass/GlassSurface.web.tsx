import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { caregiverTheme, patientTheme } from '../../theme/tokens-enhanced';
import { GlassLayers } from './GlassLayers';
import { getGlassVisualTokens } from './GlassSurface.tokens';
import type { GlassSurfaceProps } from './GlassSurface.types';

const GLASS_FILTER_ID = 'mente-glass-refraction';
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

function createSvgElement<K extends keyof SVGElementTagNameMap>(tagName: K) {
  return document.createElementNS(SVG_NAMESPACE, tagName);
}

function ensureGlassFilter() {
  if (document.getElementById(GLASS_FILTER_ID)) return;

  const root = document.getElementById('root') ?? document.body;
  if (!root) return;

  const svg = createSvgElement('svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.style.width = '0';
  svg.style.height = '0';
  svg.style.overflow = 'hidden';
  svg.style.pointerEvents = 'none';

  const defs = createSvgElement('defs');
  const filter = createSvgElement('filter');
  filter.setAttribute('id', GLASS_FILTER_ID);
  filter.setAttribute('x', '-12%');
  filter.setAttribute('y', '-12%');
  filter.setAttribute('width', '124%');
  filter.setAttribute('height', '124%');
  filter.setAttribute('color-interpolation-filters', 'sRGB');

  const turbulence = createSvgElement('feTurbulence');
  turbulence.setAttribute('type', 'fractalNoise');
  turbulence.setAttribute('baseFrequency', '0.012 0.026');
  turbulence.setAttribute('numOctaves', '2');
  turbulence.setAttribute('seed', '17');
  turbulence.setAttribute('result', 'menteGlassNoise');

  const displacement = createSvgElement('feDisplacementMap');
  displacement.setAttribute('in', 'SourceGraphic');
  displacement.setAttribute('in2', 'menteGlassNoise');
  displacement.setAttribute('scale', '10');
  displacement.setAttribute('xChannelSelector', 'R');
  displacement.setAttribute('yChannelSelector', 'G');

  filter.append(turbulence, displacement);
  defs.append(filter);
  svg.append(defs);
  root.append(svg);
}

function browserSupportsBackdropFilter(filterValue: string) {
  if (typeof window === 'undefined' || typeof window.CSS?.supports !== 'function') return false;

  return (
    window.CSS.supports('backdrop-filter', filterValue) ||
    window.CSS.supports('-webkit-backdrop-filter', filterValue)
  );
}

function getWebBackdropStyle(filterValue: string) {
  return {
    WebkitBackdropFilter: filterValue,
    backdropFilter: filterValue,
  } as unknown as ViewStyle;
}

export function GlassSurface({
  children,
  theme = 'caregiver',
  variant = 'elevated',
  style,
  radius,
}: GlassSurfaceProps) {
  const visual = getGlassVisualTokens(theme, variant);
  const tokens = theme === 'caregiver' ? caregiverTheme : patientTheme;
  const resolvedRadius = radius ?? tokens.radii.card;
  const blurFilter = `blur(${visual.webBlurRadius}px) saturate(${visual.webSaturation}%)`;
  const refractionFilter = `url(#${GLASS_FILTER_ID}) ${blurFilter}`;
  const supportsRefraction = browserSupportsBackdropFilter(refractionFilter);
  const supportsBackdropBlur = supportsRefraction || browserSupportsBackdropFilter(blurFilter);
  const backdropStyle = supportsRefraction
    ? getWebBackdropStyle(refractionFilter)
    : supportsBackdropBlur
      ? getWebBackdropStyle(blurFilter)
      : null;

  useEffect(() => {
    ensureGlassFilter();
  }, []);

  return (
    <View
      style={[
        styles.surface,
        style,
        {
          backgroundColor: supportsBackdropBlur ? visual.tintColor : visual.webFallbackColor,
          borderColor: visual.borderColor,
          borderRadius: resolvedRadius,
          boxShadow: `0px ${Math.round(visual.shadowDepth / 4)}px ${visual.shadowDepth}px ${visual.shadowColor}`,
          overflow: 'hidden',
        },
        backdropStyle,
      ]}
    >
      <GlassLayers
        tintColor="transparent"
        highlightColor={visual.highlightColor}
        radius={resolvedRadius}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderWidth: 1,
    position: 'relative',
  },
});
