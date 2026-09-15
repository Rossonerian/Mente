import { XStack } from 'tamagui';
import { StyleSheet, Image } from 'react-native';

export function AppLogo() {
  return (
    <XStack style={styles.container}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={{ width: 200, height: 80 }}
        resizeMode="contain"
      />
    </XStack>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  }
});
