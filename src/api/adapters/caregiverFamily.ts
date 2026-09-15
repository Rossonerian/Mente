import type { MemoryDto } from '../contracts/patient';
import type { FamilyMember, MemoryPrompt } from '../../types';

const familyAvatars: Record<string, any> = {
  ana: require('../../../assets/images/family/ana.png'),
  miguel: require('../../../assets/images/family/miguel.jpg'),
  sofia: require('../../../assets/images/family/sofia.png'),
};

function resolveFamilyAvatar(name: string, id: string): any | undefined {
  const lowerName = name.toLowerCase();
  const lowerId = id.toLowerCase();
  for (const key of Object.keys(familyAvatars)) {
    if (lowerName.includes(key) || lowerId.includes(key)) {
      return familyAvatars[key];
    }
  }
  return undefined;
}

export function adaptMemoryToFamilyMember(memory: MemoryDto): FamilyMember {
  const name = memory.subject_name?.trim() || 'A familiar memory';
  return {
    id: memory.id,
    name,
    relationship: memory.relationship_label?.trim() || memory.memory_type.toLowerCase(),
    initials: initialsFor(name),
    memory: memory.prompt_text,
    voiceAvailable: memory.memory_type === 'VOICE',
    avatar: resolveFamilyAvatar(name, memory.id),
  };
}

export function adaptPatientMemoryToPrompt(memory: MemoryDto): MemoryPrompt {
  const personName = memory.subject_name?.trim() || 'Someone close to you';
  return {
    id: memory.id,
    personId: memory.id,
    personName,
    relationship: memory.relationship_label?.trim() || 'someone close to you',
    title: memory.memory_type === 'VOICE' ? 'A familiar voice' : 'A family memory',
    prompt: memory.memory_type === 'VOICE'
      ? `Take a quiet moment with ${personName}.`
      : `Spend a little time with a memory of ${personName}.`,
    memoryHint: memory.prompt_text,
  };
}

function initialsFor(value: string): string {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'M';
}
