import { IconButton } from './Button';

describe('IconButton component', () => {
  it('renders correctly with default props', () => {
    const button = IconButton({
      label: 'Happy',
      iconName: 'happy',
      onPress: () => {},
    });

    expect(button.props.accessibilityLabel).toBe('Happy');
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityState).toEqual({
      selected: false,
      disabled: false,
    });
  });

  it('reflects selected state and hint when provided', () => {
    const button = IconButton({
      label: 'Happy',
      iconName: 'happy',
      onPress: () => {},
      selected: true,
      accessibilityHint: 'Selects Happy mood',
    });

    expect(button.props.accessibilityState).toEqual({
      selected: true,
      disabled: false,
    });
    expect(button.props.accessibilityHint).toBe('Selects Happy mood');
  });

  it('reflects disabled state when provided', () => {
    const button = IconButton({
      label: 'Disabled Button',
      iconName: 'lock',
      onPress: () => {},
      disabled: true,
    });

    expect(button.props.accessibilityState).toEqual({
      selected: false,
      disabled: true,
    });
    expect(button.props.disabled).toBe(true);
  });
});
