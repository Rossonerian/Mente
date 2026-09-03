import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MenteButton } from '../../components/Button';
import { SurfaceCard, SoftPanel } from '../../components/Card';
import { MenteIcon } from '../../components/Icon';
import { ScreenScroll } from '../../components/Screen';
import { menteMockData } from '../../data/mockData';
import { getNextPromptIndex } from '../../navigation/interaction';
import { patientTheme, spacing } from '../../theme/tokens';

export function PatientInGameScreen({ onComplete }: { onComplete: () => void }) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [message, setMessage] = useState('When you are ready, listen to the moment.');
  const prompt = menteMockData.prompts[promptIndex];

  const handleRepeat = () => {
    setMessage(`I’ll share ${prompt.personName}’s moment again.`);
  };

  const handleSkip = () => {
    const nextPromptIndex = getNextPromptIndex(promptIndex, menteMockData.prompts.length);
    if (nextPromptIndex === null) {
      onComplete();
      return;
    }
    setPromptIndex(nextPromptIndex);
    setMessage('Here is another familiar moment.');
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

      <SurfaceCard theme="patient" style={styles.promptCard}>
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
      </SurfaceCard>

      <View style={styles.actionFooter}>
        <Text style={styles.footerPrompt}>Choose what feels right.</Text>
        <MenteButton label="Repeat" onPress={handleRepeat} theme="patient" variant="secondary" iconName="refresh-outline" style={styles.actionButton} />
        <MenteButton label="Skip" onPress={handleSkip} theme="patient" variant="quiet" iconName="arrow-forward-outline" style={styles.actionButton} />
        <MenteButton label="Stop" onPress={onComplete} theme="patient" variant="danger" iconName="stop-circle-outline" style={styles.actionButton} accessibilityHint="Ends this moment gently" />
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
    backgroundColor: patientTheme.colors.surfaceWarm,
    gap: spacing.md,
    marginBottom: spacing.xl,
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
