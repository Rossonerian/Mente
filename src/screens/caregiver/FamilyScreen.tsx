import { StyleSheet, Text, View } from 'react-native';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { SurfaceCard } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { MenteButton } from '../../components/Button';
import { caregiverTheme, spacing } from '../../theme/tokens-enhanced';
import { menteMockData } from '../../data/mockData';
import type { CaregiverRoute } from '../../types';

export function FamilyScreen({ onNavigate }: { onNavigate: (route: CaregiverRoute) => void }) {
    const { family } = menteMockData;

    return (
        <ScreenScroll theme="caregiver">
            <PageHeader
                eyebrow="FAMILY"
                title="Rosa's loved ones"
                subtitle="People who can share memories with Rosa"
                theme="caregiver"
            />

            {family.map((member) => (
                <SurfaceCard key={member.id} theme="caregiver" style={styles.memberCard}>
                    <View
                        style={styles.memberHeader}
                        accessible
                        accessibilityRole="text"
                        accessibilityLabel={`${member.name}, ${member.relation}${member.voiceAvailable ? '. Voice available' : ''}`}
                    >
                        <Avatar initials={member.initials} name={member.name} size="large" theme="caregiver" tone="primary" accessible={false} />
                        <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>{member.name}</Text>
                            <Text style={styles.memberRelation}>{member.relation}</Text>
                            {member.voiceAvailable && <Badge label="Voice available" variant="success" size="sm" />}
                        </View>
                    </View>

                    <Text style={styles.memberBio}>{member.bio || 'No bio added yet'}</Text>

                    <View style={styles.memberStats}>
                        <View style={styles.stat} accessible accessibilityRole="text" accessibilityLabel={`${member.memoriesCount || 0} Memories`}>
                            <Text style={styles.statValue}>{member.memoriesCount || 0}</Text>
                            <Text style={styles.statLabel}>Memories</Text>
                        </View>
                        <View style={styles.stat} accessible accessibilityRole="text" accessibilityLabel={`${member.sessionsCount || 0} Sessions`}>
                            <Text style={styles.statValue}>{member.sessionsCount || 0}</Text>
                            <Text style={styles.statLabel}>Sessions</Text>
                        </View>
                        <View style={styles.stat} accessible accessibilityRole="text" accessibilityLabel={`${member.messagesCount || 0} Messages`}>
                            <Text style={styles.statValue}>{member.messagesCount || 0}</Text>
                            <Text style={styles.statLabel}>Messages</Text>
                        </View>
                    </View>
                </SurfaceCard>
            ))}

            <MenteButton
                label="Back to Home"
                onPress={() => onNavigate('home')}
                variant="secondary"
                theme="caregiver"
                style={styles.backButton}
            />
        </ScreenScroll>
    );
}

const styles = StyleSheet.create({
    memberCard: {
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    memberHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.md,
    },
    memberInfo: {
        flex: 1,
        gap: spacing.xs,
    },
    memberName: {
        color: caregiverTheme.colors.text,
        fontSize: 18,
        fontWeight: '800',
    },
    memberRelation: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 13,
    },
    memberBio: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 13,
        lineHeight: 19,
    },
    memberStats: {
        flexDirection: 'row',
        gap: spacing.md,
        justifyContent: 'space-around',
        paddingTop: spacing.md,
        borderTopColor: caregiverTheme.colors.border,
        borderTopWidth: 1,
    },
    stat: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    statValue: {
        color: caregiverTheme.colors.primary,
        fontSize: 18,
        fontWeight: '800',
    },
    statLabel: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 11,
        fontWeight: '600',
    },
    backButton: {
        marginTop: spacing.lg,
    },
});