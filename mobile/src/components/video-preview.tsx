import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import { theme } from '@/src/constants/theme';

export function VideoPreview({
  source,
  loop = true,
  autoplay = true,
  muted = false,
  height = 280,
}: {
  source: number | { uri: string };
  loop?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  height?: number;
}) {
  const player = useVideoPlayer(source, (videoPlayer) => {
    videoPlayer.loop = loop;
    videoPlayer.muted = muted;
    if (autoplay) {
      videoPlayer.play();
    }
  });

  return (
    <View style={[styles.container, { height }]}>
      <VideoView style={StyleSheet.absoluteFill} player={player} fullscreenOptions={{ enable: true }} nativeControls contentFit="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: theme.radius.md,
    backgroundColor: '#060913',
  },
});
