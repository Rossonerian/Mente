import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MenteButton } from '../../components/Button';
import { SoftPanel } from '../../components/Card';
import { MenteIcon } from '../../components/Icon';
import { ScreenScroll } from '../../components/Screen';
import { menteMockData } from '../../data/mockData';
import { getNextPromptIndex } from '../../navigation/interaction';
import { patientTheme, spacing } from '../../theme/tokens';
import { GlassSurface } from '../../components/glass/GlassSurface';
import { adaptPatientMemoryToPrompt } from '../../api/adapters/caregiverFamily';
import { isDevelopmentMockMode } from '../../api/config';
import type { GameMetricDto, MemoryDto, PatientSessionDto } from '../../api/contracts/patient';
import { patientDeviceStore } from '../../auth/patientDeviceStore';
import { createSkippedGameMetric, usePatientGameWrite } from '../../features/patient/usePatientSession';

export function PatientInGameScreen({ onComplete, patientToken = null, session = null, memories = [] }: { onComplete: () => void; patientToken?: string | null; session?: PatientSessionDto | null; memories?: MemoryDto[] }) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [message, setMessage] = useState('When you are ready, listen to the moment.');
  const [writeError, setWriteError] = useState<string | null>(null);
  const [failedFinalize, setFailedFinalize] = useState<{ status: 'COMPLETED' | 'EARLY_TERMINATED'; terminationReason?: string } | null>(null);
  const [failedMetric, setFailedMetric] = useState<{ promptIndex: number; payload: GameMetricDto } | null>(null);
  const { metric, finalize } = usePatientGameWrite(patientToken);
  const prompts = isDevelopmentMockMode ? menteMockData.prompts : memories.map(adaptPatientMemoryToPrompt);
  const prompt = prompts[promptIndex];

  if (!prompt) return <ScreenScroll theme="patient"><SoftPanel theme="patient" style={styles.messagePanel}><Text style={styles.messageText}>There are no familiar moments ready right now. You can return whenever it feels right.</Text></SoftPanel></ScreenScroll>;

  const handleRepeat = () => {
    setMessage(`I’ll share ${prompt.personName}’s moment again.`);
  };

  const finish = async (status: 'COMPLETED' | 'EARLY_TERMINATED', terminationReason?: string) => {
    if (isDevelopmentMockMode || !session) { onComplete(); return; }
    const payload = { status, termination_reason: terminationReason, metadata_json: { source: 'patient-app' } } as const;
    setWriteError(null);
    setFailedFinalize(null);
    setFailedMetric(null);
    try {
      await finalize.mutateAsync({ sessionId: session.id, payload });
      await patientDeviceStore.removePendingWrite();
      onComplete();
    } catch {
      await patientDeviceStore.setPendingWrite(JSON.stringify({ sessionId: session.id, payload }));
      setFailedFinalize({ status, terminationReason });
      setWriteError('This moment is still open. You can try saving your gentle close again, or return without saying it was completed.');
    }
  };

  const advanceAfterSkip = async (fromPromptIndex: number) => {
    const nextPromptIndex = getNextPromptIndex(fromPromptIndex, prompts.length);
    if (nextPromptIndex === null) {
      await finish('COMPLETED');
      return;
    }
    setPromptIndex(nextPromptIndex);
    setMessage('Here is another familiar moment.');
  };

  const saveSkip = async (payload: GameMetricDto, fromPromptIndex: number) => {
    if (isDevelopmentMockMode || !session) {
      await advanceAfterSkip(fromPromptIndex);
      return;
    }
    setWriteError(null);
    try {
      await metric.mutateAsync({ sessionId: session.id, payload });
      setFailedMetric(null);
      await advanceAfterSkip(fromPromptIndex);
    } catch {
      setFailedMetric({ promptIndex: fromPromptIndex, payload });
      setWriteError('Mente could not save that step. Nothing was marked complete. Please try saving it again or stop for now.');
    }
  };

  const handleSkip = () => {
    const payload = session ? createSkippedGameMetric(session.id, prompt.id) : { client_metric_id: `mock:${prompt.id}`, item_type: 'FAMILIAR_MEMORY', hesitation_count: 0, metadata_json: { client_round_id: `mock:${prompt.id}`, interaction: 'skip' } } as const;
    void saveSkip(payload, promptIndex);
  };

  return (
    <ScreenScroll theme="patient" contentStyle={styles.screenContent}>
      <View style={styles.focusHeader}>
        <View style={styles.focusBrand}>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>m</Text></View>
          <Text style={styles.brand}>mente</Text>
        </View>
        <Text style={styles.focusLabel}>A moment with family</Text>
      </View>

      <GlassSurface theme="patient" variant="focus" style={styles.promptCard}>
        <View style={styles.promptTopRow}>
          <SoftPanel theme="patient" style={styles.soundPanel}>
            <MenteIcon name="volume-medium-outline" size={29} color={patientTheme.colors.primary} />
          </SoftPanel>
          <Text style={styles.promptTag}>Familiar memory</Text>
        </View>
        <Text style={styles.promptTitle}>{prompt.title}</Text>
        <Text style={styles.promptText}>{prompt.prompt}</Text>
        <View style={styles.personCard}>
          <View style={styles.personInitial}><Text style={styles.personInitialText}>{prompt.personName[0]}</Text></View>
          <View style={styles.personCopy}>
            <Text style={styles.personName}>{prompt.personName}</Text>
            <Text style={styles.personRelationship}>{prompt.relationship}</Text>
          </View>
          <MenteIcon name="heart-outline" size={22} color={patientTheme.colors.primary} />
        </View>
        <Text style={styles.memoryHint}>{prompt.memoryHint}</Text>
        <SoftPanel theme="patient" style={styles.messagePanel}>
          <Text style={styles.messageText}>{message}</Text>
        </SoftPanel>
      </GlassSurface>

      <View style={styles.actionFooter}>
        <Text style={styles.footerPrompt}>Choose what feels right.</Text>
        <MenteButton label="Repeat" onPress={handleRepeat} theme="patient" variant="secondary" iconName="refresh-outline" style={styles.actionButton} />
        <MenteButton label={metric.isPending ? 'Saving this step…' : 'Skip'} onPress={handleSkip} disabled={metric.isPending || finalize.isPending || Boolean(failedMetric)} theme="patient" variant="secondary" iconName="arrow-forward-outline" style={styles.actionButton} />
        <MenteButton label={finalize.isPending ? 'Saving gentle close…' : 'Stop'} onPress={() => void finish('EARLY_TERMINATED', 'PATIENT_STOP')} disabled={metric.isPending || finalize.isPending} theme="patient" variant="danger" iconName="stop-circle-outline" style={styles.actionButton} accessibilityHint="Ends this moment gently" />
        {writeError ? <SoftPanel theme="patient" style={styles.failedWritePanel}><Text accessibilityLiveRegion="polite" style={styles.failedWriteText}>{writeError}</Text>{failedMetric ? <MenteButton label="Try saving that step again" onPress={() => void saveSkip(failedMetric.payload, failedMetric.promptIndex)} disabled={metric.isPending} theme="patient" variant="secondary" /> : null}{failedFinalize ? <MenteButton label="Try saving again" onPress={() => void finish(failedFinalize.status, failedFinalize.terminationReason)} theme="patient" variant="secondary" /> : null}</SoftPanel> : null}
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: spacing.lg,
  },
  focusHeader: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  focusBrand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: patientTheme.colors.primary,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  brandMarkText: {
    color: patientTheme.colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  brand: {
    color: patientTheme.colors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  focusLabel: {
    color: patientTheme.colors.textMuted,
    fontSize: 15,
    fontWeight: '700',
  },
  promptCard: {
    gap: spacing.md,
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  promptTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  soundPanel: {
    alignItems: 'center',
    backgroundColor: patientTheme.colors.coralSoft,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    padding: 0,
    width: 60,
  },
  promptTag: {
    color: patientTheme.colors.primary,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  promptTitle: {
    color: patientTheme.colors.text,
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  promptText: {
    color: patientTheme.colors.textMuted,
    fontSize: 18,
    lineHeight: 27,
  },
  personCard: {
    alignItems: 'center',
    backgroundColor: patientTheme.colors.surface,
    borderColor: patientTheme.colors.border,
    borderRadius: patientTheme.radii.control,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  personInitial: {
    alignItems: 'center',
    backgroundColor: patientTheme.colors.focus,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  personInitialText: {
    color: patientTheme.colors.primary,
    fontSize: 21,
    fontWeight: '900',
  },
  personCopy: {
    flex: 1,
    gap: 2,
  },
  personName: {
    color: patientTheme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  personRelationship: {
    color: patientTheme.colors.textMuted,
    fontSize: 14,
  },
  memoryHint: {
    color: patientTheme.colors.textFaint,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  messagePanel: {
    backgroundColor: patientTheme.colors.forestSoft,
    paddingVertical: spacing.sm,
  },
  messageText: {
    color: patientTheme.colors.forest,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  failedWritePanel: { backgroundColor: patientTheme.colors.coralSoft, gap: spacing.sm },
  failedWriteText: { color: patientTheme.colors.text, fontSize: 15, fontWeight: '700', lineHeight: 22 },
  actionFooter: {
    gap: spacing.sm,
  },
  footerPrompt: {
    color: patientTheme.colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xxs,
    textAlign: 'center',
  },
  actionButton: {
    width: '100%',
  },
});
