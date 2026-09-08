## 2025-05-18 - React Native Composite Accessibility Labels

**Learning:** When a composite parent component uses `accessible={true}` and a custom `accessibilityLabel`, child visual indicators (like status badges or icon indicators) are suppressed from screen reader output unless explicitly included in the parent's `accessibilityLabel` string.
**Action:** Always check if visual status icons in composite cards are reflected in the top-level `accessibilityLabel` when `accessible={true}` is set on the container.
