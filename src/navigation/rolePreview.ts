export function shouldShowRoleSwitcher({ isDevelopmentBuild, showTabs }: { isDevelopmentBuild: boolean; showTabs: boolean }): boolean {
  return isDevelopmentBuild && showTabs;
}
