import { YStack, XStack, Text, Button, Card, H3 } from 'tamagui';
import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Image } from 'react-native';

const FAMILY_PHOTOS = [
  require('../../../../assets/images/family/ana.png'),
  require('../../../../assets/images/family/miguel.jpg'),
  require('../../../../assets/images/family/sofia.png')
];

const AUDIO_MESSAGES = [
  { id: 1, label: 'Play Message 1', source: require('../../../../assets/audio/voice-message-1.mp3') },
  { id: 2, label: 'Play Message 2', source: require('../../../../assets/audio/voice-message-2.mp3') }
];

export function MemoryGallery() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);

  async function playSound(id: number, source: any) {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      const { sound: newSound } = await Audio.Sound.createAsync(source);
      
      setSound(newSound);
      setPlayingId(id);
      await newSound.playAsync();
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
        }
      });
    } catch (error) {
      console.error('Error playing sound', error);
    }
  }

  async function stopSound() {
    if (sound) {
      await sound.stopAsync();
      setPlayingId(null);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <YStack style={styles.container}>
      <H3 style={styles.centerText}>Family Memories</H3>
      
      <Card style={styles.card}>
        <Text fontWeight="bold" style={styles.centerText}>Voice Messages from Family</Text>
        <YStack style={styles.buttonContainer} gap={8}>
          {AUDIO_MESSAGES.map((msg) => {
            const isPlaying = playingId === msg.id;
            return (
              <Button
                key={msg.id}
                size="$4"
                icon={isPlaying ? <Ionicons name="square" size={20} color="black" /> : <Ionicons name="play" size={20} color="black" />}
                onPress={() => isPlaying ? stopSound() : playSound(msg.id, msg.source)}
              >
                {isPlaying ? 'Stop Message' : msg.label}
              </Button>
            );
          })}
        </YStack>
      </Card>

      <YStack style={styles.gallery}>
        <Text fontWeight="bold" style={styles.centerText}>Photo Gallery</Text>
        {FAMILY_PHOTOS.map((photo, index) => (
          <Image
            key={index}
            source={photo}
            resizeMode="cover"
            style={[styles.imageMargin, { width: '100%', height: 300, borderRadius: 8 }]}
          />
        ))}
      </YStack>
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
  card: {
    padding: 16,
    gap: 16,
    elevation: 4,
  },
  buttonContainer: {
    justifyContent: 'center',
  },
  gallery: {
    gap: 16,
    marginTop: 16,
  },
  imageMargin: {
    marginBottom: 8,
  }
});
