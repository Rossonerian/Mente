import { it, expect, jest, describe, beforeEach } from '@jest/globals';
import { act, create } from 'react-test-renderer';
import { PatientInGameScreen } from './PatientInGameScreen';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MenteButton } from '../../components/Button';
import { Text } from 'react-native';

const mockFinalize = jest.fn<any>().mockResolvedValue({});
const mockMetric = jest.fn<any>().mockResolvedValue({});

jest.mock('../../features/patient/usePatientSession', () => ({
  createSkippedGameMetric: jest.fn(() => ({ type: 'mocked-metric' })),
  usePatientGameWrite: jest.fn(() => ({
    metric: {
      mutateAsync: mockMetric,
      isPending: false,
    },
    finalize: {
      mutateAsync: mockFinalize,
      isPending: false,
    },
  })),
}));

jest.mock('../../api/adapters/caregiverFamily', () => ({
  adaptPatientMemoryToPrompt: jest.fn((mem: any) => ({
    id: mem.id,
    title: mem.title,
    prompt: mem.prompt,
    personName: mem.personName,
    relationship: mem.relationship,
    memoryHint: 'hint'
  })),
}));

jest.mock('../../auth/patientDeviceStore', () => ({
  patientDeviceStore: {
    removePendingWrite: jest.fn<any>().mockResolvedValue(undefined),
    setPendingWrite: jest.fn<any>().mockResolvedValue(undefined),
  }
}));

// Mock react-native-url-polyfill which might be imported in HTTP layer
jest.mock('react-native-url-polyfill', () => ({ setupURLPolyfill: jest.fn() }));

describe('PatientInGameScreen Core Loop', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    jest.clearAllMocks();
  });

  const renderScreen = () => {
    return create(
      <QueryClientProvider client={queryClient}>
        <PatientInGameScreen 
          onComplete={jest.fn() as any} 
          onExit={jest.fn() as any} 
          patientToken="mock-token" 
          session={{ id: 'session-id' } as any} 
          memories={[
            { id: '1', title: 'Memory 1', prompt: 'Prompt 1', personName: 'Alice', relationship: 'Daughter' } as any,
            { id: '2', title: 'Memory 2', prompt: 'Prompt 2', personName: 'Bob', relationship: 'Son' } as any
          ]}
        />
      </QueryClientProvider>
    );
  };

  it('renders initial prompt and handles skip to next prompt', async () => {
    let tree: any;
    act(() => {
      tree = renderScreen();
    });

    const root = tree.root;
    
    // First prompt verified
    const texts = root.findAllByType(Text).map((t: any) => {
        try { return t.props.children } catch { return null }
    });
    expect(texts).toContain('Memory 1');
    expect(texts).toContain('Prompt 1');

    const skipButton = root.findAllByType(MenteButton).find((node: any) => node.props.label === 'Skip');
    
    await act(async () => {
      await skipButton.props.onPress();
    });

    // After skip, second prompt should be retrieved
    const textsAfter = root.findAllByType(Text).map((t: any) => {
        try { return t.props.children } catch { return null }
    });
    expect(textsAfter).toContain('Memory 2');
    expect(textsAfter).toContain('Prompt 2');
    expect(mockMetric).toHaveBeenCalled();
  });

  it('handles early termination on stop', async () => {
    let tree: any;
    act(() => {
      tree = renderScreen();
    });

    const root = tree.root;
    const stopButton = root.findAllByType(MenteButton).find((node: any) => node.props.label === 'Stop');
    
    await act(async () => {
      await stopButton.props.onPress();
    });

    expect(mockFinalize).toHaveBeenCalledWith(expect.objectContaining({
       sessionId: 'session-id',
       payload: expect.objectContaining({ status: 'EARLY_TERMINATED', termination_reason: 'PATIENT_STOP' })
    }));
  });
});
