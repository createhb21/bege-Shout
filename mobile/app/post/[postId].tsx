import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { VideoPreview } from '@/src/components/video-preview';
import { Badge, EmptyState, SectionCard, SectionTitle, AppScreen } from '@/src/components/ui';
import { resolveVideoSource } from '@/src/constants/fallback-feed';
import { theme } from '@/src/constants/theme';
import { useApp } from '@/src/context/app-context';
import { formatDateTime } from '@/src/lib/format';

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { t } = useTranslation();
  const { feed, addComment, settings } = useApp();
  const [comment, setComment] = useState('');

  const post = feed.find((item) => item.id === postId);

  if (!post) {
    return (
      <AppScreen>
        <EmptyState title={t('common.comments')} body={t('community.empty')} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={styles.reelHero}>
        <VideoPreview source={resolveVideoSource(post)} height={430} muted={false} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.78)']} style={styles.shade} />
        <View style={styles.heroMeta}>
          <View style={styles.metaRow}>
            <Badge label={post.author} tone="accent" />
            <Badge label={post.wakeTimeLabel} tone="success" />
          </View>
          <Text style={styles.title}>{post.title}</Text>
          <Text numberOfLines={2} style={styles.caption}>{post.caption}</Text>
        </View>
      </View>

      <SectionCard>
        <SectionTitle eyebrow="COMMENTS" title={t('common.comments')} subtitle={post.feedbackSummary} />
        <View style={styles.commentInputRow}>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder={t('post.commentPlaceholder')}
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => {
              if (!comment.trim()) {
                return;
              }
              void addComment(post.id, comment.trim());
              setComment('');
            }}>
            <MaterialCommunityIcons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {!post.comments.length ? (
          <EmptyState title={t('common.comments')} body={t('community.empty')} />
        ) : (
          post.comments.map((entry) => (
            <View key={entry.id} style={styles.commentCard}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>{entry.author.replace('@', '').slice(0, 1).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.author}>{entry.author}</Text>
                <Text style={styles.body}>{entry.body}</Text>
                <Text style={styles.meta}>{formatDateTime(entry.createdAt, settings.locale)}</Text>
              </View>
            </View>
          ))
        )}
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  reelHero: {
    minHeight: 430,
    borderRadius: 34,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    ...theme.shadow.card,
  },
  shade: {
    ...StyleSheet.absoluteFillObject,
  },
  heroMeta: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    gap: 9,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  caption: {
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 21,
    fontWeight: '700',
  },
  commentInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    fontWeight: '700',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
  },
  commentCard: {
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: theme.spacing.md,
    gap: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    color: theme.colors.text,
    fontWeight: '900',
  },
  author: {
    color: theme.colors.mint,
    fontWeight: '900',
  },
  body: {
    color: theme.colors.text,
    lineHeight: 22,
    fontWeight: '600',
  },
  meta: {
    color: theme.colors.textSubtle,
    fontSize: 12,
    fontWeight: '700',
  },
});
