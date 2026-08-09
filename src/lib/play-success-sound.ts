let expoAudioModule: any = null;

async function getExpoAudioModule() {
  if (expoAudioModule) return expoAudioModule;

  try {
    expoAudioModule = await import('expo-audio');
    return expoAudioModule;
  } catch {
    return null;
  }
}

export async function playSuccessSound() {
  const { createAudioPlayer } = (await getExpoAudioModule()) ?? {};
  if (!createAudioPlayer) return;

  try {
    const player = createAudioPlayer(require('../../assets/sounds/success.mp3'));
    player.play();
  } catch {
    // no-op
  }
}

