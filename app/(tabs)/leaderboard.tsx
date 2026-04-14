import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, SafeAreaView,
} from 'react-native';
import { supabase } from '../../lib/supabase';

type LeaderboardUser = {
  id: string;
  username: string;
  xp: number;
  level: number;
  completed_quests: number;
};

const COLORS = {
  background: '#1a1f1a',
  card: '#242b24',
  primary: '#4a7c59',
  secondary: '#8b6914',
  hard: '#8b3a2a',
  text: '#e8e0d0',
  muted: '#9a9488',
};

function getInitials(username: string) {
  return username?.slice(0, 2).toUpperCase() ?? '??';
}

function RankMedal({ rank }: { rank: number }) {
  const colors: Record<number, string> = {
    1: COLORS.primary,
    2: COLORS.secondary,
    3: COLORS.hard,
  };
  const color = colors[rank] ?? COLORS.muted;
  return (
    <View style={[styles.rankBadge, { borderColor: color }]}>
      <Text style={[styles.rankText, { color }]}>{rank}</Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function fetchLeaderboard() {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('id, username, xp, level, completed_quests')
          .order('xp', { ascending: false })
          .limit(50);

        if (!error && data) setUsers(data);
        setLoading(false);
      }
      fetchLeaderboard();
    }, [])
  );

  const renderItem = ({ item, index }: { item: LeaderboardUser; index: number }) => {
    const rank = index + 1;
    const avatarColor =
      rank === 1 ? COLORS.primary :
      rank === 2 ? COLORS.secondary :
      rank === 3 ? COLORS.hard :
      COLORS.muted;

    return (
      <View style={styles.row}>
        <RankMedal rank={rank} />
        <View style={[styles.avatar, { borderColor: avatarColor + '55' }]}>
          <Text style={[styles.avatarText, { color: avatarColor }]}>
            {getInitials(item.username)}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.meta}>
            Lvl {item.level} · {item.completed_quests} quests
          </Text>
        </View>
        <View style={[styles.xpBadge, { borderColor: COLORS.primary + '44' }]}>
          <Text style={styles.xpText}>{item.xp.toLocaleString()} XP</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top adventurers</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.muted, marginTop: 2 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  rankBadge: {
    width: 28, height: 28, borderRadius: 999,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  rankText: { fontSize: 12, fontWeight: '700' },
  avatar: {
    width: 40, height: 40, borderRadius: 999,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ffffff08',
  },
  avatarText: { fontSize: 13, fontWeight: '600' },
  userInfo: { flex: 1 },
  username: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  meta: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  xpBadge: {
    borderWidth: 1, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  xpText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
});