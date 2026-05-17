import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { VideoPreview } from '@/src/components/video-preview';
import { AppScreen, Badge, EmptyState, PrimaryButton, SectionCard, SectionTitle } from '@/src/components/ui';
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
      <SectionCard>
        <SectionTitle title={post.title} subtitle={post.caption} />
        <VideoPreview source={resolveVideoSource(post)} height={360} muted={false} />
        <View style={styles.metaRow}>
          <Badge label={post.author} tone="accent" />
          <Badge label={post.wakeTimeLabel} tone="success" />
        </View>
      </SectionCard>

      <SectionCard>
        <SectionTitle title={t('common.comments')} subtitle={post.feedbackSummary} />
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder={t('post.commentPlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
        />
        <PrimaryButton
          label={t('post.addComment')}
          onPress={() => {
            if (!comment.trim()) {
              return;
            }
            void addComment(post.id, comment.trim());
            setComment('');
          }}
        />
        {!post.comments.length ? (
          <EmptyState title={t('common.comments')} body={t('community.empty')} />
        ) : (
          post.comments.map((entry) => (
            <View key={entry.id} style={styles.commentCard}>
              <Text style={styles.author}>{entry.author}</Text>
              <Text style={styles.body}>{entry.body}</Text>
              <Text style={styles.meta}>{formatDateTime(entry.createdAt, settings.locale)}</Text>
            </View>
          ))
        )}
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  input: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundAlt,
    color: theme.colors.text,
  },
  commentCard: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.backgroundAlt,
    padding: theme.spacing.md,
    gap: 6,
  },
  author: {
    color: theme.colors.mint,
    fontWeight: '800',
  },
  body: {
    color: theme.colors.text,
    lineHeight: 22,
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
});
