## 2025-05-18 - React Native Composite Accessibility Labels

**Learning:** When a composite parent component uses `accessible={true}` and a custom `accessibilityLabel`, child visual indicators (like status badges or icon indicators) are suppressed from screen reader output unless explicitly included in the parent's `accessibilityLabel` string.
**Action:** Always check if visual status icons in composite cards are reflected in the top-level `accessibilityLabel` when `accessible={true}` is set on the container.
## 2023-10-27 - Grouped Stats Accessibility\n**Learning:** When displaying grouped statistics (like "10 Memories"), applying `accessible={true}` and a descriptive `accessibilityLabel` to a wrapper `<View>` prevents screen readers from reading the numerical value and label as disjointed text blocks.\n**Action:** Always group related numerical statistics and their labels into single accessible elements for smoother screen reader navigation.
