import { MemberCard } from './MemberCard';
import type { FamilyMember } from '../types';

describe('MemberCard component', () => {
  const memberWithVoice: FamilyMember = {
    id: 'mem-1',
    name: 'Sarah Connor',
    relationship: 'Daughter',
    memory: 'Loves gardening',
    initials: 'SC',
    voiceAvailable: true,
  };

  const memberWithoutVoice: FamilyMember = {
    id: 'mem-2',
    name: 'John Connor',
    relationship: 'Son',
    memory: 'Enjoys motorbikes',
    initials: 'JC',
    voiceAvailable: false,
  };

  it('includes voice note status in accessibility label when voice is available', () => {
    const card = MemberCard({ member: memberWithVoice, theme: 'caregiver' });
    expect(card.props.accessibilityLabel).toBe(
      'Sarah Connor, Daughter. Loves gardening. Voice note available'
    );
  });

  it('omits voice note status from accessibility label when voice is unavailable', () => {
    const card = MemberCard({ member: memberWithoutVoice, theme: 'patient' });
    expect(card.props.accessibilityLabel).toBe(
      'John Connor, Son. Enjoys motorbikes'
    );
  });
});
