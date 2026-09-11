import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { SurfaceCard } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { MenteButton } from '../../components/Button';
import { caregiverTheme, spacing } from '../../theme/tokens';
import type { CaregiverRoute } from '../../types';

interface Memory {
    id: string;
    title: string;
    date: string;
    people: string[];
    description: string;
    photoCount: number;
    tags: string[];
}

const mockMemories: Memory[] = [
    {
        id: '1',
        title: 'Birthday Celebration',
        date: 'Sept 5, 2024',
        people: ['Ana', 'Miguel', 'Sofia'],
        description: 'Rosa turned 78! We celebrated with cake and stories.',
        photoCount: 12,
        tags: ['Birthday', 'Family', 'Celebration'],
    },
    {
        id: '2',
        title: 'Garden Walk',
        date: 'Aug 28, 2024',
        people: ['Ana'],
        description: 'Beautiful morning walk in the garden with roses blooming.',
        photoCount: 8,
        tags: ['Outdoor', 'Nature', 'Exercise'],
    },
    {
        id: '3',
        title: 'Family Dinner',
        date: 'Aug 20, 2024',
        people: ['Ana', 'Miguel', 'Sofia'],
        description: 'Shared a lovely dinner with family. Rosa enjoyed the paella!',
        photoCount: 15,
        tags: ['Meal', 'Family', 'Together'],
    },
    {
        id: '4',
        title: 'Music Session',
        date: 'Aug 15, 2024',
        people: ['Sofia'],
        description: 'Sofia played guitar and sang Rosa\'s favorite songs.',
        photoCount: 6,
        tags: ['Music', 'Entertainment', 'Sofia'],
    },
    {
        id: '5',
        title: 'Puzzle Time',
        date: 'Aug 10, 2024',
        people: ['Ana', 'Miguel'],
        description: 'Worked on a puzzle together. Rosa remembered many pieces!',
        photoCount: 5,
        tags: ['Activity', 'Cognitive', 'Engagement'],
    },
];

export function MemoryGalleryScreen({ onNavigate }: { onNavigate: (route: CaregiverRoute) => void }) {
    return (
        <ScreenScroll theme="caregiver">
            <PageHeader
                eyebrow="MEMORIES"
                title="Rosa's Gallery"
                subtitle={`${mockMemories.length} special moments`}
                theme="caregiver"
            />

            {mockMemories.map((memory) => (
                <SurfaceCard key={memory.id} theme="caregiver" style={styles.memoryCard}>
                    {/* HEADER */}
                    <View style={styles.memoryHeader}>
                        <View style={styles.headerInfo}>
                            <Text style={styles.memoryTitle}>{memory.title}</Text>
                            <Text style={styles.memoryDate}>{memory.date}</Text>
                        </View>
                        <Badge label={`${memory.photoCount} photos`} variant="primary" size="sm" />
                    </View>

                    {/* DESCRIPTION */}
                    <Text style={styles.memoryDescription}>{memory.description}</Text>

                    {/* PHOTO GRID PLACEHOLDER */}
                    <View style={styles.photoGrid}>
                        {Array.from({ length: Math.min(3, memory.photoCount) }).map((_, i) => (
                            <View key={i} style={styles.photoPlaceholder}>
                                <Text style={styles.photoIcon}>📸</Text>
                            </View>
                        ))}
                        {memory.photoCount > 3 && (
                            <View style={[styles.photoPlaceholder, styles.photoMore]}>
                                <Text style={styles.photoMoreText}>+{memory.photoCount - 3}</Text>
                            </View>
                        )}
                    </View>

                    {/* TAGS */}
                    <View style={styles.tagsRow}>
                        {memory.tags.map((tag) => (
                            <Badge key={tag} label={tag} variant="neutral" size="sm" />
                        ))}
                    </View>

                    {/* PEOPLE */}
                    <View style={styles.peopleSection}>
                        <Text style={styles.peopleLabel}>With: {memory.people.join(', ')}</Text>
                    </View>

                    {/* ACTION */}
                    <MenteButton label="View Memory" onPress={() => { }} variant="secondary" theme="caregiver" />
                </SurfaceCard>
            ))}

            <MenteButton
                label="Back to Home"
                onPress={() => onNavigate('home')}
                variant="secondary"
                theme="caregiver"
                style={styles.button}
            />
        </ScreenScroll>
    );
}

const styles = StyleSheet.create({
    memoryCard: {
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    memoryHeader: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        gap: spacing.md,
        justifyContent: 'space-between',
    },
    headerInfo: {
        flex: 1,
        gap: spacing.xs,
    },
    memoryTitle: {
        color: caregiverTheme.colors.text,
        fontSize: 16,
        fontWeight: '800',
    },
    memoryDate: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 12,
    },
    memoryDescription: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 13,
        lineHeight: 19,
    },
    photoGrid: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    photoPlaceholder: {
        alignItems: 'center',
        backgroundColor: caregiverTheme.colors.background,
        borderRadius: 8,
        height: 80,
        justifyContent: 'center',
        flex: 1,
    },
    photoIcon: {
        fontSize: 32,
    },
    photoMore: {
        backgroundColor: caregiverTheme.colors.surfaceMuted,
    },
    photoMoreText: {
        color: caregiverTheme.colors.primary,
        fontSize: 14,
        fontWeight: '800',
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    peopleSection: {
        borderTopColor: '#e2e8f0',
        borderTopWidth: 1,
        paddingTop: spacing.md
    },
    peopleLabel: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 12,
        fontWeight: '600',
    },
    button: {
        marginBottom: spacing.md,
    },
});