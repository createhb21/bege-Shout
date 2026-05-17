import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@/src/constants/theme';

export function AppScreen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  if (!scroll) {
    return <View style={styles.screen}>{children}</View>;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

export function HeroCard({ children }: PropsWithChildren) {
  return (
    <LinearGradient colors={theme.gradients.aurora} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroOuter}>
      <View style={styles.heroInner}>{children}</View>
    </LinearGradient>
  );
}

export function SectionCard({ children }: PropsWithChildren) {
  return <View style={styles.sectionCard}>{children}</View>;
}

export function SectionTitle({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <View style={{ gap: 7 }}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  disabled,
}: {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.primaryButton, disabled && styles.disabledButton]}>
      <LinearGradient colors={theme.gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      {icon}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.secondaryButton}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Badge({ label, tone = 'default' }: { label: string; tone?: 'default' | 'accent' | 'success' | 'warning' | 'danger' }) {
  const backgroundColor =
    tone === 'accent'
      ? 'rgba(255,45,122,0.18)'
      : tone === 'success'
        ? 'rgba(50,230,161,0.18)'
        : tone === 'warning'
          ? 'rgba(255,209,102,0.18)'
          : tone === 'danger'
            ? 'rgba(255,70,104,0.18)'
            : 'rgba(255,255,255,0.08)';

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
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
    paddingBottom: 122,
  },
  heroOuter: {
    borderRadius: theme.radius.xl,
    padding: 1,
    ...theme.shadow.card,
  },
  heroInner: {
    borderRadius: theme.radius.xl - 1,
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(5,5,7,0.80)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: theme.spacing.md,
    overflow: 'hidden',
  },
  sectionCard: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceGlass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
    ...theme.shadow.card,
  },
  eyebrow: {
    color: theme.colors.accentAlt,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    color: theme.colors.text,
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontWeight: '800',
  },
  badge: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  badgeText: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 11,
  },
  statPill: {
    flex: 1,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: theme.spacing.md,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceGlass,
    gap: 8,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 18,
  },
  emptyBody: {
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
});
