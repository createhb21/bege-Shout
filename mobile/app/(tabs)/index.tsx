import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, CameraView } from 'expo-camera';
import { useRef, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { VideoPreview } from '@/src/components/video-preview';
import { theme } from '@/src/constants/theme';
import { useApp } from '@/src/context/app-context';
import { buildDefaultWakeDate, formatDateTime } from '@/src/lib/format';

export default function CaptureScreen() {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const cameraRef = useRef<CameraView | null>(null);
  const { permissions, saveShout, settings, syncPermissions } = useApp();
  const [wakeAt, setWakeAt] = useState(buildDefaultWakeDate());
  const [showPicker, setShowPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingVideoUri, setPendingVideoUri] = useState<string | null>(null);

  const captureGranted = permissions.camera === 'granted' && permissions.microphone === 'granted';
  const wakeLabel = formatDateTime(wakeAt.toISOString(), settings.locale);
  const generatedNote = t('capture.autoNote', { time: wakeLabel });

  const requestCapturePermissions = async () => {
    const [cameraPermission, microphonePermission] = await Promise.all([
      Camera.requestCameraPermissionsAsync(),
      Camera.requestMicrophonePermissionsAsync(),
    ]);
    await syncPermissions();

    return cameraPermission.status === 'granted' && microphonePermission.status === 'granted';
  };

  const startRecording = async () => {
    if (isRecording) {
      return;
    }

    if (!captureGranted) {
      const granted = await requestCapturePermissions();
      if (!granted) {
        Alert.alert(t('capture.permissionsTitle'), t('capture.permissionsBody'));
      }
      return;
    }

    if (!cameraRef.current) {
      Alert.alert(t('capture.ready'), t('capture.tapAgainWhenReady'));
      return;
    }

    try {
      setIsRecording(true);
      const result = await cameraRef.current.recordAsync({ maxDuration: 45 });
      if (result?.uri) {
        setPendingVideoUri(result.uri);
      }
    } catch (error) {
      Alert.alert('Recording failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    cameraRef.current?.stopRecording();
  };

  const handleSave = async () => {
    if (!pendingVideoUri) {
      return;
    }

    await saveShout({
      videoUri: pendingVideoUri,
      note: generatedNote,
      wakeAt: wakeAt.toISOString(),
      shareToCommunity: settings.defaultShareToCommunity,
      saveToLibrary: settings.autoSaveToLibrary,
    });

    setPendingVideoUri(null);
    setWakeAt(buildDefaultWakeDate());
    Alert.alert(t('capture.saved'), t('capture.savedBody'));
  };

  return (
    <View style={styles.fullScreen}>
      {pendingVideoUri ? (
        <View style={StyleSheet.absoluteFill}>
          <VideoPreview source={{ uri: pendingVideoUri }} height={999} muted={false} />
        </View>
      ) : isFocused && permissions.camera === 'granted' ? (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" mode="video" mirror />
      ) : (
        <View style={styles.cameraFallback}>
          <MaterialCommunityIcons name="camera-outline" size={56} color={theme.colors.textMuted} />
          <Text style={styles.cameraFallbackText}>{t('capture.permissionsTitle')}</Text>
          <Text style={styles.cameraFallbackSubtext}>{t('capture.permissionsBody')}</Text>
        </View>
      )}

      <LinearGradient colors={['rgba(4,7,18,0.48)', 'rgba(4,7,18,0.03)', 'rgba(4,7,18,0.58)']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.overlay} edges={['top', 'left', 'right']}>
        <View style={styles.topHud}>
          <Text style={styles.brandText}>{t('appName')}</Text>
          <View style={[styles.statusDot, captureGranted ? styles.statusReady : styles.statusWarning]} />
        </View>

        {isRecording ? (
          <View style={styles.recordingPill}>
            <View style={styles.liveDot} />
            <Text style={styles.recordingText}>{t('capture.recordingShort')}</Text>
          </View>
        ) : null}

        <View style={styles.bottomControls}>
          {showPicker ? (
            <View style={styles.pickerShell}>
              <DateTimePicker
                value={wakeAt}
                mode="datetime"
                display="compact"
                onChange={(_, selectedDate) => {
                  setShowPicker(false);
                  if (selectedDate) {
                    setWakeAt(selectedDate);
                  }
                }}
              />
            </View>
          ) : null}

          {pendingVideoUri ? (
            <View style={styles.reviewRow}>
              <TouchableOpacity style={styles.secondaryMiniButton} onPress={() => setPendingVideoUri(null)}>
                <Text style={styles.secondaryMiniText}>{t('capture.retake')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryMiniButton} onPress={() => void handleSave()}>
                <Text style={styles.primaryMiniText}>{t('capture.saveShout')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.captureRow}>
              <TouchableOpacity style={styles.timeChip} onPress={() => setShowPicker(true)}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.text} />
                <View style={styles.timeCopy}>
                  <Text style={styles.timeLabel}>{t('common.wakeAt')}</Text>
                  <Text numberOfLines={1} style={styles.timeValue}>{wakeLabel}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                style={[styles.recordButton, isRecording && styles.recordingButton]}>
                <MaterialCommunityIcons name={isRecording ? 'stop' : 'record-rec'} size={26} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {permissions.camera === 'denied' || permissions.microphone === 'denied' ? (
            <TouchableOpacity style={styles.settingsLink} onPress={() => void Linking.openSettings()}>
              <Text style={styles.settingsLinkText}>{t('common.openSettings')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#040814',
  },
  cameraFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: theme.spacing.xl,
    backgroundColor: '#091122',
  },
  cameraFallbackText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  cameraFallbackSubtext: {
    color: theme.colors.textMuted,
    lineHeight: 22,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 96,
  },
  topHud: {
    alignSelf: 'flex-start',
    minHeight: 32,
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(4,7,18,0.32)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusReady: {
    backgroundColor: theme.colors.success,
  },
  statusWarning: {
    backgroundColor: theme.colors.warning,
  },
  recordingPill: {
    alignSelf: 'center',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,93,122,0.82)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  recordingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  bottomControls: {
    gap: 8,
  },
  pickerShell: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.md,
    padding: 6,
    backgroundColor: 'rgba(11,16,32,0.72)',
  },
  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  timeChip: {
    maxWidth: 210,
    minHeight: 46,
    borderRadius: 23,
    paddingLeft: 12,
    paddingRight: 14,
    backgroundColor: 'rgba(11,16,32,0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeCopy: {
    flexShrink: 1,
    gap: 1,
  },
  timeLabel: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 10,
    fontWeight: '900',
  },
  timeValue: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  recordButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.82)',
  },
  recordingButton: {
    backgroundColor: theme.colors.danger,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  secondaryMiniButton: {
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(11,16,32,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryMiniText: {
    color: theme.colors.text,
    fontWeight: '900',
  },
  primaryMiniButton: {
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 18,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryMiniText: {
    color: '#fff',
    fontWeight: '900',
  },
  settingsLink: {
    alignSelf: 'flex-end',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(11,16,32,0.62)',
  },
  settingsLinkText: {
    color: theme.colors.mint,
    fontWeight: '900',
    fontSize: 12,
  },
});
