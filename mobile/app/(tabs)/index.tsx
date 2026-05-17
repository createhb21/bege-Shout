import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useIsFocused } from '@react-navigation/native';
import { Camera, CameraView } from 'expo-camera';
import { useRef, useState } from 'react';
import { Alert, Linking, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { theme } from '@/src/constants/theme';
import { useApp } from '@/src/context/app-context';
import { buildDefaultWakeDate, formatDateTime } from '@/src/lib/format';
import { AppScreen, Badge, HeroCard, PrimaryButton, SectionCard, SectionTitle, SecondaryButton } from '@/src/components/ui';
import { VideoPreview } from '@/src/components/video-preview';

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
    <AppScreen>
      <HeroCard>
        <SectionTitle eyebrow={t('appName')} title={t('capture.title')} subtitle={t('capture.subtitle')} />
        <View style={styles.cameraShell}>
          {isFocused && permissions.camera === 'granted' ? (
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" mode="video" mirror />
          ) : (
            <View style={styles.cameraFallback}>
              <MaterialCommunityIcons name="camera-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.cameraFallbackText}>{t('capture.permissionsTitle')}</Text>
            </View>
          )}
          <View style={styles.cameraOverlayTop}>
            <Badge label={captureGranted ? t('capture.ready') : t('capture.capturePermissionNeeded')} tone={captureGranted ? 'success' : 'warning'} />
          </View>
          <View style={styles.cameraOverlayBottom}>
            <TouchableOpacity onPress={isRecording ? stopRecording : startRecording} style={[styles.recordButton, isRecording && styles.recordingButton]}>
              <MaterialCommunityIcons name={isRecording ? 'stop' : 'record-rec'} size={34} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.recordingText}>{isRecording ? t('capture.recording') : t('capture.challengeHint')}</Text>
          </View>
        </View>
      </HeroCard>

      {!allGranted ? (
        <SectionCard>
          <SectionTitle title={t('capture.permissionsTitle')} subtitle={t('capture.permissionsBody')} />
          <PrimaryButton label={t('capture.requestAll')} onPress={() => void requestAllPermissions()} />
          <SecondaryButton label={t('common.openSettings')} onPress={() => void Linking.openSettings()} />
        </SectionCard>
      ) : null}

      <SectionCard>
        <SectionTitle title={t('common.note')} subtitle={t('capture.challengeHint')} />
        <TextInput
          multiline
          value={note}
          onChangeText={setNote}
          placeholder={t('capture.notePlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.noteInput}
        />
        <TouchableOpacity style={styles.pickerButton} onPress={() => setShowPicker(true)}>
          <Text style={styles.pickerButtonLabel}>{t('common.wakeAt')}</Text>
          <Text style={styles.pickerButtonValue}>{formatDateTime(wakeAt.toISOString(), settings.locale)}</Text>
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
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('capture.shareToCommunity')}</Text>
          <Switch value={shareToCommunity} onValueChange={setShareToCommunity} trackColor={{ true: theme.colors.accent }} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('capture.saveToLibrary')}</Text>
          <Switch value={saveToLibrary} onValueChange={setSaveToLibrary} trackColor={{ true: theme.colors.mint }} />
        </View>
      </SectionCard>

      {pendingVideoUri ? (
        <SectionCard>
          <SectionTitle title={t('capture.reviewTitle')} subtitle={t('capture.savedBody')} />
          <VideoPreview source={{ uri: pendingVideoUri }} height={320} muted />
          <PrimaryButton label={t('capture.saveShout')} onPress={() => void handleSave()} />
          <SecondaryButton label={t('common.cancel')} onPress={() => setPendingVideoUri(null)} />
        </SectionCard>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  cameraShell: {
    height: 480,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: '#040814',
  },
  cameraFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#091122',
  },
  cameraFallbackText: {
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  cameraOverlayTop: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cameraOverlayBottom: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    alignItems: 'center',
    gap: 12,
  },
  recordButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
  },
  recordingButton: {
    backgroundColor: theme.colors.danger,
  },
  recordingText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  noteInput: {
    minHeight: 120,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundAlt,
    color: theme.colors.text,
    textAlignVertical: 'top',
  },
  pickerButton: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundAlt,
    gap: 8,
  },
  pickerButtonLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  pickerButtonValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  switchLabel: {
    color: theme.colors.text,
    flex: 1,
    fontWeight: '600',
    lineHeight: 22,
  },
});
