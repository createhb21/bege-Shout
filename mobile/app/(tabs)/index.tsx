import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, CameraView } from 'expo-camera';
import { useRef, useState } from 'react';
import { Alert, Linking, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { VideoPreview } from '@/src/components/video-preview';
import { Badge, PrimaryButton, SecondaryButton } from '@/src/components/ui';
import { theme } from '@/src/constants/theme';
import { useApp } from '@/src/context/app-context';
import { buildDefaultWakeDate, formatDateTime } from '@/src/lib/format';

export default function CaptureScreen() {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const cameraRef = useRef<CameraView | null>(null);
  const { permissions, requestAllPermissions, saveShout, settings, syncPermissions } = useApp();
  const [wakeAt, setWakeAt] = useState(buildDefaultWakeDate());
  const [note, setNote] = useState('');
  const [shareToCommunity, setShareToCommunity] = useState(true);
  const [saveToLibrary, setSaveToLibrary] = useState(settings.autoSaveToLibrary);
  const [showPicker, setShowPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingVideoUri, setPendingVideoUri] = useState<string | null>(null);

  const captureGranted = permissions.camera === 'granted' && permissions.microphone === 'granted';
  const allGranted = Object.values(permissions).every((status) => status === 'granted');

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
      note,
      wakeAt: wakeAt.toISOString(),
      shareToCommunity,
      saveToLibrary,
    });

    setPendingVideoUri(null);
    setNote('');
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
          <MaterialCommunityIcons name="camera-outline" size={64} color={theme.colors.textMuted} />
          <Text style={styles.cameraFallbackText}>{t('capture.permissionsTitle')}</Text>
          <Text style={styles.cameraFallbackSubtext}>{t('capture.permissionsBody')}</Text>
        </View>
      )}

      <LinearGradient colors={['rgba(4,7,18,0.92)', 'rgba(4,7,18,0.25)', 'rgba(4,7,18,0.96)']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.overlay} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <View style={styles.brandBlock}>
            <Text style={styles.eyebrow}>{t('appName')}</Text>
            <Text style={styles.title}>{pendingVideoUri ? t('capture.reviewTitle') : t('capture.title')}</Text>
          </View>
          <Badge label={captureGranted ? t('capture.ready') : t('capture.capturePermissionNeeded')} tone={captureGranted ? 'success' : 'warning'} />
        </View>

        <View style={styles.promptPanel}>
          <MaterialCommunityIcons name={isRecording ? 'microphone' : 'weather-night'} size={22} color={theme.colors.mint} />
          <Text style={styles.promptText}>{isRecording ? t('capture.recording') : t('capture.fullScreenPrompt')}</Text>
        </View>

        <View style={styles.bottomSheet}>
          <TouchableOpacity style={styles.wakeButton} onPress={() => setShowPicker(true)}>
            <View>
              <Text style={styles.controlLabel}>{t('common.wakeAt')}</Text>
              <Text style={styles.wakeValue}>{formatDateTime(wakeAt.toISOString(), settings.locale)}</Text>
            </View>
            <MaterialCommunityIcons name="clock-edit-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          {showPicker ? (
            <DateTimePicker
              value={wakeAt}
              mode="datetime"
              onChange={(_, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) {
                  setWakeAt(selectedDate);
                }
              }}
            />
          ) : null}

          <TextInput
            multiline
            value={note}
            onChangeText={setNote}
            placeholder={t('capture.notePlaceholder')}
            placeholderTextColor="rgba(255,255,255,0.62)"
            style={styles.noteInput}
          />

          <View style={styles.optionGrid}>
            <View style={styles.optionPill}>
              <Text style={styles.optionText}>{t('capture.shareShort')}</Text>
              <Switch value={shareToCommunity} onValueChange={setShareToCommunity} trackColor={{ true: theme.colors.accent }} />
            </View>
            <View style={styles.optionPill}>
              <Text style={styles.optionText}>{t('capture.libraryShort')}</Text>
              <Switch value={saveToLibrary} onValueChange={setSaveToLibrary} trackColor={{ true: theme.colors.mint }} />
            </View>
          </View>

          <View style={styles.actionRow}>
            {pendingVideoUri ? (
              <>
                <SecondaryButton label={t('common.cancel')} onPress={() => setPendingVideoUri(null)} />
                <PrimaryButton label={t('capture.saveShout')} onPress={() => void handleSave()} />
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={isRecording ? stopRecording : startRecording}
                  style={[styles.recordButton, isRecording && styles.recordingButton]}>
                  <MaterialCommunityIcons name={isRecording ? 'stop' : 'record-rec'} size={38} color="#fff" />
                </TouchableOpacity>
                <View style={styles.recordCopy}>
                  <Text style={styles.recordTitle}>{isRecording ? t('capture.stop') : t('capture.record')}</Text>
                  <Text style={styles.recordSubtitle}>{t('capture.challengeHint')}</Text>
                </View>
              </>
            )}
          </View>

          {!allGranted ? (
            <TouchableOpacity style={styles.permissionLink} onPress={() => void requestAllPermissions()}>
              <Text style={styles.permissionLinkText}>{t('capture.requestOptionalPermissions')}</Text>
            </TouchableOpacity>
          ) : null}
          {permissions.camera === 'denied' || permissions.microphone === 'denied' ? (
            <TouchableOpacity style={styles.permissionLink} onPress={() => void Linking.openSettings()}>
              <Text style={styles.permissionLinkText}>{t('common.openSettings')}</Text>
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
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 104,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  brandBlock: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: theme.colors.mint,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowRadius: 12,
  },
  promptPanel: {
    alignSelf: 'center',
    maxWidth: 320,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(9,17,34,0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  promptText: {
    flex: 1,
    color: theme.colors.text,
    fontWeight: '800',
    lineHeight: 21,
  },
  bottomSheet: {
    gap: 12,
    borderRadius: 30,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(11,16,32,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
  },
  wakeButton: {
    minHeight: 62,
    borderRadius: 22,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  wakeValue: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  noteInput: {
    minHeight: 72,
    maxHeight: 110,
    borderRadius: 22,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    color: theme.colors.text,
    textAlignVertical: 'top',
    fontWeight: '700',
  },
  optionGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  optionPill: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.pill,
    paddingLeft: theme.spacing.md,
    paddingRight: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  optionText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800',
    flexShrink: 1,
  },
  actionRow: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  recordButton: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.78)',
  },
  recordingButton: {
    backgroundColor: theme.colors.danger,
  },
  recordCopy: {
    flex: 1,
    gap: 4,
  },
  recordTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  recordSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  permissionLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  permissionLinkText: {
    color: theme.colors.mint,
    fontWeight: '800',
  },
});
