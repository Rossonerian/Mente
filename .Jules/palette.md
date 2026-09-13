## 2025-05-18 - React Native Composite Accessibility Labels

**Learning:** When a composite parent component uses `accessible={true}` and a custom `accessibilityLabel`, child visual indicators (like status badges or icon indicators) are suppressed from screen reader output unless explicitly included in the parent's `accessibilityLabel` string.
**Action:** Always check if visual status icons in composite cards are reflected in the top-level `accessibilityLabel` when `accessible={true}` is set on the container.

## 2025-05-18 - Stateful Icon Selection and Screen Reader State

**Learning:** Interactive icon buttons used for multi-option selection (such as mood tracking or rating controls) need explicit `accessibilityState={{ selected }}` alongside filled/contrast background styling, otherwise screen reader users have no way of knowing which option is currently selected.
**Action:** When creating selection-based icon buttons, always accept a `selected` boolean prop, pass `accessibilityState={{ selected }}`, and toggle visual container/icon colors for high-contrast selection feedback.
