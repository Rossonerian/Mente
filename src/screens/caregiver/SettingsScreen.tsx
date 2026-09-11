import { StyleSheet, Text, View, Switch } from 'react-native';
import { PageHeader } from '../../components/PageHeader';
import { ScreenScroll } from '../../components/Screen';
import { SurfaceCard } from '../../components/Card';
import { MenteButton, TextButton } from '../../components/Button';
import { caregiverTheme, spacing } from '../../theme/tokens';
import { useState } from 'react';
import type { CaregiverRoute } from '../../types';

export function SettingsScreen({ onNavigate }: { onNavigate: (route: CaregiverRoute) => void }) {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);

    return (
        <ScreenScroll theme="caregiver">
            <PageHeader eyebrow="SETTINGS" title="Preferences" subtitle="Manage your account and app settings" theme="caregiver" />

            {/* ACCOUNT */}
            <SurfaceCard theme="caregiver" style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.settingItem}>
                    <View style={styles.settingLabel}>
                        <Text style={styles.settingName}>Caregiver Name</Text>
                        <Text style={styles.settingValue}>Ana Rodriguez</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.settingItem}>
                    <View style={styles.settingLabel}>
                        <Text style={styles.settingName}>Patient</Text>
                        <Text style={styles.settingValue}>Rosa Delgado</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.settingItem}>
                    <View style={styles.settingLabel}>
                        <Text style={styles.settingName}>Email</Text>
                        <Text style={styles.settingValue}>ana@example.com</Text>
                    </View>
                </View>
            </SurfaceCard>

            {/* NOTIFICATIONS */}
            <SurfaceCard theme="caregiver" style={styles.section}>
                <Text style={styles.sectionTitle}>Notifications</Text>
                <View style={styles.toggleItem}>
                    <View>
                        <Text style={styles.settingName}>Push Notifications</Text>
                        <Text style={styles.settingDescription}>Receive alerts for important events</Text>
                    </View>
                    <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
                </View>
                <View style={styles.divider} />
                <View style={styles.toggleItem}>
                    <View>
                        <Text style={styles.settingName}>Sound</Text>
                        <Text style={styles.settingDescription}>Play sound for notifications</Text>
                    </View>
                    <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
                </View>
                <View style={styles.divider} />
                <View style={styles.toggleItem}>
                    <View>
                        <Text style={styles.settingName}>Auto-play Videos</Text>
                        <Text style={styles.settingDescription}>Play memory videos automatically</Text>
                    </View>
                    <Switch value={autoPlayEnabled} onValueChange={setAutoPlayEnabled} />
                </View>
            </SurfaceCard>

            {/* ABOUT */}
            <SurfaceCard theme="caregiver" style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.settingItem}>
                    <View style={styles.settingLabel}>
                        <Text style={styles.settingName}>App Version</Text>
                        <Text style={styles.settingValue}>1.0.0</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <TextButton label="Privacy Policy" onPress={() => { }} theme="caregiver" />
                <View style={styles.divider} />
                <TextButton label="Terms of Service" onPress={() => { }} theme="caregiver" />
            </SurfaceCard>

            {/* DANGER ZONE */}
            <SurfaceCard theme="caregiver" style={styles.section}>
                <Text style={[styles.sectionTitle, { color: caregiverTheme.colors.alert }]}>Danger Zone</Text>
                <MenteButton label="Sign Out" onPress={() => { }} variant="danger" theme="caregiver" style={styles.dangerButton} />
            </SurfaceCard>

            <MenteButton label="Back to Home" onPress={() => onNavigate('home')} variant="secondary" theme="caregiver" style={styles.button} />
        </ScreenScroll>
    );
}

const styles = StyleSheet.create({
    section: {
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        color: caregiverTheme.colors.text,
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        paddingVertical: spacing.sm,
    },
    settingItem: {
        paddingVertical: spacing.md,
    },
    toggleItem: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.md,
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
    },
    settingLabel: {
        gap: spacing.xxs,
    },
    settingName: {
        color: caregiverTheme.colors.text,
        fontSize: 15,
        fontWeight: '800',
    },
    settingValue: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 13,
    },
    settingDescription: {
        color: caregiverTheme.colors.textMuted,
        fontSize: 12,
    },
    divider: {
        backgroundColor: caregiverTheme.colors.border,
        height: 1,
    },
    dangerButton: {
        marginTop: spacing.sm,
    },
    button: {
        marginBottom: spacing.md,
    },
});