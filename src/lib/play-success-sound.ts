let expoAvModule: any = null;

async function getExpoAvModule() {
  if (expoAvModule) return expoAvModule;

  try {
    expoAvModule = await import('expo-av');
    return expoAvModule;
  } catch {
    return null;
  }
}

export async function playSuccessSound() {
  const { Audio } = (await getExpoAvModule()) ?? {};
  if (!Audio?.Sound?.createAsync) return;

  try {
    const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/success.mp3'));
    await sound.playAsync();
  } catch {
    // no-op
  }
}
