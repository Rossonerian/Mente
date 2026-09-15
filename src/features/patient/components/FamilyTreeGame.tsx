import { YStack, XStack, Text, Card, H3 } from 'tamagui';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Avatar } from '../../../components/Avatar';

const DUMMY_FAMILY = [
  { id: '1', name: 'Ana', relationship: 'Mother', image: require('../../../../assets/images/family/ana.png') },
  { id: '2', name: 'Miguel', relationship: 'Son', image: require('../../../../assets/images/family/miguel.jpg') },
  { id: '3', name: 'Sofia', relationship: 'Daughter', image: require('../../../../assets/images/family/sofia.png') },
];

export function FamilyTreeGame() {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  return (
    <YStack style={styles.container}>
      <H3 style={styles.centerText}>Who is this?</H3>
      <Text style={styles.subtitle} color="$color11">
        Tap on a family member to reveal their relationship!
      </Text>

      <XStack style={styles.grid}>
        {DUMMY_FAMILY.map((member) => (
          <Card
            key={member.id}
            size="$4"
            style={styles.card}
            onPress={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
          >
            <YStack style={styles.cardContent}>
              <Card.Header style={styles.cardHeader}>
                <Avatar
                  name={member.name}
                  initials={member.name[0]}
                  avatarImage={member.image}
                  theme="patient"
                  size="large"
                />
              </Card.Header>
              <Text fontWeight="bold" style={styles.centerText}>
                {member.name}
              </Text>
              {selectedMember === member.id && (
                <Text color="$color10" style={styles.centerText}>
                  {member.relationship}
                </Text>
              )}
            </YStack>
          </Card>
        ))}
      </XStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  centerText: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  grid: {
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  card: {
    width: 120,
    padding: 8,
    elevation: 4,
  },
  cardContent: {
    alignItems: 'center',
    gap: 8,
  },
  cardHeader: {
    padding: 0,
  }
});
