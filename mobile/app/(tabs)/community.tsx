import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { VideoPreview } from '@/src/components/video-preview';
import { Badge, EmptyState } from '@/src/components/ui';
import { theme } from '@/src/constants/theme';
import { resolveVideoSource } from '@/src/constants/fallback-feed';
import { useApp } from '@/src/context/app-context';

export default function CommunityScreen() {
  const { t } = useTranslation();
  const { feed, refreshFeed, isRefreshingFeed, serverMode, toggleLike, downloadPost } = useApp();

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={isRefreshingFeed} onRefresh={() => void refreshFeed()} tintColor="#fff" />}
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.kicker}>BEGE REELS</Text>
          <Text style={styles.headerTitle}>{t('community.title')}</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={() => void refreshFeed()}>
          <MaterialCommunityIcons name="refresh" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.statusRow}>
        <Badge label={serverMode === 'server' ? t('common.server') : t('common.fallback')} tone={serverMode === 'server' ? 'success' : 'warning'} />
        <Text style={styles.statusCopy}>{t('community.subtitle')}</Text>
      </View>

      {!feed.length ? (
        <EmptyState title={t('community.title')} body={t('community.empty')} />
      ) : (
        feed.map((post) => (
          <View key={post.id} style={styles.reelCard}>
            <VideoPreview source={resolveVideoSource(post)} height={560} muted={false} />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.76)']} style={styles.reelShade} />

            <View style={styles.actionRail}>
              <TouchableOpacity style={styles.railButton} onPress={() => void toggleLike(post.id)}>
                <MaterialCommunityIcons name={post.isLiked ? 'heart' : 'heart-outline'} size={28} color={post.isLiked ? theme.colors.accent : theme.colors.text} />
                <Text style={styles.railCount}>{post.likeCount}</Text>
              </TouchableOpacity>
              <Link href={`/post/${post.id}`} asChild>
                <TouchableOpacity style={styles.railButton}>
                  <MaterialCommunityIcons name="comment-outline" size={27} color={theme.colors.text} />
                  <Text style={styles.railCount}>{post.comments.length}</Text>
                </TouchableOpacity>
              </Link>
              <TouchableOpacity style={styles.railButton} onPress={() => void downloadPost(post.id)}>
                <MaterialCommunityIcons name={post.isDownloaded ? 'bookmark-check' : 'bookmark-outline'} size={27} color={post.isDownloaded ? theme.colors.mint : theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.reelMeta}>
              <View style={styles.authorRow}>
                <LinearGradient colors={theme.gradients.brand} style={styles.avatarRing}>
                  <View style={styles.avatarCore}>
                    <Text style={styles.avatarText}>{post.author.replace('@', '').slice(0, 1).toUpperCase()}</Text>
                  </View>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.author}>{post.author}</Text>
                  <Text style={styles.wakeLine}>{post.wakeTimeLabel} · {post.tags.slice(0, 2).join(' ')}</Text>
                </View>
              </View>
              <Text style={styles.title}>{post.title}</Text>
              <Text numberOfLines={2} style={styles.caption}>{post.caption}</Text>
              <Text numberOfLines={1} style={styles.feedback}>{post.feedbackSummary}</Text>
              {post.source === 'local-upload' ? <Text style={styles.localHint}>{t('community.uploadedFallback')}</Text> : null}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
    paddingBottom: 120,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    color: theme.colors.accentAlt,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  refreshButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusRow: {
    gap: 8,
  },
  statusCopy: {
    color: theme.colors.textMuted,
    lineHeight: 20,
    fontWeight: '600',
  },
  reelCard: {
    minHeight: 560,
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card,
  },
  reelShade: {
    ...StyleSheet.absoluteFillObject,
  },
  actionRail: {
    position: 'absolute',
    right: 12,
    bottom: 118,
    gap: 16,
    alignItems: 'center',
  },
  railButton: {
    width: 50,
    minHeight: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.34)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    gap: 2,
  },
  railCount: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  reelMeta: {
    position: 'absolute',
    left: 14,
    right: 76,
    bottom: 16,
    gap: 7,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    padding: 2,
  },
  avatarCore: {
    flex: 1,
    borderRadius: 19,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.text,
    fontWeight: '900',
  },
  author: {
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 15,
  },
  wakeLine: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '900',
  },
  caption: {
    color: 'rgba(255,255,255,0.86)',
    lineHeight: 20,
    fontWeight: '600',
  },
  feedback: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    fontWeight: '700',
  },
  localHint: {
    color: theme.colors.warning,
    lineHeight: 20,
    fontWeight: '700',
  },
});
