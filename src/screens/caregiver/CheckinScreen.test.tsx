import { it, expect, jest, describe } from '@jest/globals';
import { act, create } from 'react-test-renderer';
import { Alert } from 'react-native';
import { CheckinScreen } from './CheckinScreen';
import React from 'react';
import { MenteButton } from '../../components/Button';

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('CheckinScreen Stub Buttons', () => {
  it('calls Alert.alert when stub buttons are pressed', () => {
    let tree: any;
    act(() => {
      tree = create(<CheckinScreen onNavigate={jest.fn() as any} />);
    });
    
    // Start session
    const root = tree.root;
    const startButton = root.findAllByType(MenteButton).find((node: any) => node.props.label === 'Start Session');
    act(() => {
      startButton.props.onPress();
    });

    // Share Photo
    const shareButton = root.findAllByType(MenteButton).find((node: any) => node.props.label === 'Share Photo');
    act(() => {
      shareButton.props.onPress();
    });
    expect(Alert.alert).toHaveBeenCalledWith('Coming Soon', 'This feature is currently under development.');

    // Play Memory
    const playButton = root.findAllByType(MenteButton).find((node: any) => node.props.label === 'Play Memory');
    act(() => {
      playButton.props.onPress();
    });
    expect(Alert.alert).toHaveBeenNthCalledWith(2, 'Coming Soon', 'This feature is currently under development.');
  });
});
