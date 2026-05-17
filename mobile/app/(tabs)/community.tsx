import { Link } from 'expo-router';
import { RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { VideoPreview } from '@/src/components/video-preview';
import { AppScreen, Badge, EmptyState, HeroCard, PrimaryButton, SectionCard, SectionTitle } from '@/src/components/ui';
import { theme } from '@/src/constants/theme';
import { resolveVideoSource } from '@/src/constants/fallback-feed';
import { useApp } from '@/src/context/app-context';

export default function CommunityScreen() {
  const { t } = useTranslation();
  const { feed, refreshFeed, isRefreshingFeed, serverMode, toggleLike, downloadPost } = useApp();

  return (
    <AppScreen scroll={false}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefreshingFeed} onRefresh={() => void refreshFeed()} tintColor="#fff" />}
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.content}>
        <HeroCard>
          <SectionTitle title={t('community.title')} subtitle={t('community.subtitle')} />
          <View style={styles.headerRow}>
            <Badge label={serverMode === 'server' ? t('common.server') : t('common.fallback')} tone={serverMode === 'server' ? 'success' : 'warning'} />
            <PrimaryButton label={t('community.refresh')} onPress={() => void refreshFeed()} />
          </View>
        </HeroCard>

        {!feed.length ? (
          <EmptyState title={t('community.title')} body={t('community.empty')} />
        ) : (
          feed.map((post) => (
            <SectionCard key={post.id}>
              <VideoPreview source={resolveVideoSource(post)} height={420} muted={false} />
              <View style={styles.postHeader}>
                <View style={{ gap: 6, flex: 1 }}>
                  <Text style={styles.author}>{post.author}</Text>
                  <Text style={styles.title}>{post.title}</Text>
                  <Text style={styles.caption}>{post.caption}</Text>
                </View>
                <Badge label={post.wakeTimeLabel} tone="accent" />
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton} onPress={() => void toggleLike(post.id)}>
                  <Text style={styles.actionText}>{post.isLiked ? t('common.liked') : t('common.like')}</Text>
                  <Text style={styles.actionCount}>{post.likeCount}</Text>
                </TouchableOpacity>
                <Link href={`/post/${post.id}`} asChild>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>{t('common.comments')}</Text>
                    <Text style={styles.actionCount}>{post.comments.length}</Text>
                  </TouchableOpacity>
                </Link>
                <TouchableOpacity style={styles.actionButton} onPress={() => void downloadPost(post.id)}>
                  <Text style={styles.actionText}>{post.isDownloaded ? t('common.downloaded') : t('common.download')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tagRow}>
                {post.tags.map((tag) => (
                  <Badge key={tag} label={tag} />
                ))}
              </View>
              <Text style={styles.feedback}>{post.feedbackSummary}</Text>
              {post.source === 'local-upload' ? <Text style={styles.localHint}>{t('community.uploadedFallback')}</Text> : null}
            </SectionCard>
          ))
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    paddingBottom: 120,
  },
  headerRow: {
    gap: 12,
  },
  postHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  author: {
    color: theme.colors.mint,
    fontWeight: '800',
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  caption: {
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionButton: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.colors.backgroundAlt,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  actionCount: {
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  feedback: {
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
  localHint: {
    color: theme.colors.warning,
    lineHeight: 20,
  },
});
