import { StyleSheet, Text, View } from 'react-native';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { SurfaceCard } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { MenteButton, IconButton } from '../../components/Button';
import { CalloutBox } from '../../components/CalloutBox';
import { Badge } from '../../components/Badge';
import { caregiverTheme, spacing } from '../../theme/tokens-enhanced';
import { menteMockData } from '../../data/mockData';
import type { CaregiverRoute } from '../../types';
import { useState } from 'react';

export function CheckinScreen({ onNavigate }: { onNavigate: (route: CaregiverRoute) => void }) {
    const { patient, family } = menteMockData;
    const [mood, setMood] = useState<'happy' | 'neutral' | 'sad' | null>(null);
    const [sessionStarted, setSessionStarted] = useState(false);

    return (
        <ScreenScroll theme="caregiver">
            <PageHeader
                eyebrow="CHECK-IN"
                title={`Hello ${patient.name}!`}
                subtitle="Starting a session with Rosa"
                theme="caregiver"
            />

            {/* PATIENT INFO */}
            <SurfaceCard theme="caregiver" style={styles.card}>
                <View style={styles.patientSection}>
                    <Avatar initials={patient.initials} name={patient.name} size="large" theme="caregiver" tone="primary" />
                    <View style={styles.patientInfo}>
                        <Text style={styles.patientName}>{patient.name}</Text>
                        <Text style={styles.patientMeta}>Ready for today&apos;s moment</Text>
                    </View>
                </View>
            </SurfaceCard>

            {!sessionStarted ? (
                <>
                    {/* MOOD CHECK */}
                    <SurfaceCard theme="caregiver" style={styles.card}>
                        <Text style={styles.sectionTitle}>How is Rosa feeling today?</Text>
                        <View style={styles.moodButtons}>
                            <IconButton
                                label="Happy"
                                iconName="happy"
                                onPress={() => setMood('happy')}
                                selected={mood === 'happy'}
                                theme="caregiver"
                            />
                            <IconButton
                                label="Neutral"
                                iconName="help-circle"
                                onPress={() => setMood('neutral')}
                                selected={mood === 'neutral'}
                                theme="caregiver"
                            />
                            <IconButton
                                label="Sad"
                                iconName="sad"
                                onPress={() => setMood('sad')}
                                selected={mood === 'sad'}
                                theme="caregiver"
                            />
                        </View>
                    </SurfaceCard>

                    {/* AVAILABLE PEOPLE */}
                    <SurfaceCard theme="caregiver" style={styles.card}>
                        <Text style={styles.sectionTitle}>Available voices</Text>
                        <Text style={styles.subtitle}>Who would Rosa like to hear from?</Text>
                        {family
                            .filter((f) => f.voiceAvailable)
                            .map((member) => (
                                <View key={member.id} style={styles.familyOption}>
                                    <Avatar initials={member.initials} name={member.name} size="small" theme="caregiver" />
                                    <View style={styles.memberDetail}>
                                        <Text style={styles.memberName}>{member.name}</Text>
                                        <Text style={styles.memberRole}>{member.relation}</Text>
                                    </View>
                                    <Badge label="Available" variant="success" size="sm" />
                                </View>
                            ))}
                    </SurfaceCard>

                    {/* TIPS */}
                    <CalloutBox theme="caregiver">
                        <Text style={styles.tipTitle}>Session Tips</Text>
                        <Text style={styles.tipText}>• Create a calm, quiet environment</Text>
                        <Text style={styles.tipText}>• Allow enough time without rushing</Text>
                        <Text style={styles.tipText}>• Share positive memories first</Text>
                    </CalloutBox>

                    {/* START SESSION */}
                    <MenteButton
                        label="Start Session"
                        onPress={() => setSessionStarted(true)}
                        variant="primary"
                        theme="caregiver"
                        style={styles.button}
                    />
                </>
            ) : (
                <>
                    {/* SESSION ACTIVE */}
                    <SurfaceCard theme="caregiver" style={styles.card}>
                        <View style={styles.liveIndicator}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>Session in progress</Text>
                        </View>
                        <View style={styles.timerSection}>
                            <Text style={styles.timer}>3:45</Text>
                            <Text style={styles.timerLabel}>minutes elapsed</Text>
                        </View>
                    </SurfaceCard>

                    {/* SESSION CONTROLS */}
                    <View style={styles.controlsRow}>
                        <MenteButton label="Share Photo" onPress={() => { }} variant="secondary" theme="caregiver" style={styles.controlButton} />
                        <MenteButton label="Play Memory" onPress={() => { }} variant="secondary" theme="caregiver" style={styles.controlButton} />
                    </View>

                    {/* END SESSION */}
                    <MenteButton
                        label="End Session"
                        onPress={() => onNavigate('home')}
                        variant="danger"
                        theme="caregiver"
                        style={styles.button}
                    />
                </>
            )}

            <MenteButton label="Cancel" onPress={() => onNavigate('home')} variant="quiet" theme="caregiver" />
        </ScreenScroll>
    );
}

const styles = StyleSheet.create({
    card: {
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    patientSection: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.md,
    },
    patientInfo: {
        flex: 1,
        gap: spacing.xs,
    },
    patientName: {
        color: caregiverTheme.colors.text,
        fontSize: 18,
        fontWeight: '800',
    },
    patientMeta: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 13,
    },
    sectionTitle: {
        color: caregiverTheme.colors.text,
        fontSize: 15,
        fontWeight: '800',
    },
    subtitle: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 13,
        marginBottom: spacing.md,
    },
    moodButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        justifyContent: 'space-around',
    },
    familyOption: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.md,
        paddingVertical: spacing.md,
        borderBottomColor: caregiverTheme.colors.border,
        borderBottomWidth: 1,
    },
    memberDetail: {
        flex: 1,
        gap: spacing.xxs,
    },
    memberName: {
        color: caregiverTheme.colors.text,
        fontSize: 14,
        fontWeight: '800',
    },
    memberRole: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 12,
    },
    tipTitle: {
        color: caregiverTheme.colors.text,
        fontSize: 13,
        fontWeight: '800',
        marginBottom: spacing.xs,
    },
    tipText: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 12,
        lineHeight: 18,
    },
    liveIndicator: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
        justifyContent: 'center',
    },
    liveDot: {
        backgroundColor: caregiverTheme.colors.alert,
        borderRadius: 6,
        height: 12,
        width: 12,
    },
    liveText: {
        color: caregiverTheme.colors.alert,
        fontSize: 14,
        fontWeight: '800',
    },
    timerSection: {
        alignItems: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.lg,
    },
    timer: {
        color: caregiverTheme.colors.primary,
        fontSize: 40,
        fontWeight: '800',
    },
    timerLabel: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 13,
    },
    controlsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    controlButton: {
        flex: 1,
    },
    button: {
        marginBottom: spacing.md,
    },
});