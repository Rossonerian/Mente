# Bolt's Journal

## 2025-05-18 - Cache CSS Feature Detection on Web
**Learning:** React Native Web components like `GlassSurface` render frequently. Invoking `window.CSS.supports` directly inside component render passes triggers repeated browser feature queries for static CSS properties.
**Action:** Always cache runtime CSS feature detection (`CSS.supports`) at module scope using a lookup Map when building web-targeted React Native components.
