import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function Index() {
  const [quest, setQuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) router.replace("/login");
      else fetchRandomQuest();
    });
  }, []);

  async function fetchRandomQuest() {
    setLoading(true);
    const { data, error } = await supabase.from("quests").select("*");

    if (data && data.length > 0) {
      const random = data[Math.floor(Math.random() * data.length)];
      setQuest(random);
    }
    setLoading(false);
  }

  async function completeQuest() {
    if (!quest || !session) return;
    setCompleting(true);

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profile) {
      const newXp = Number(profile.xp) + Number(quest.xp_reward);
      const newLevel = Math.floor(newXp / 100) + 1;
      const newCompleted = profile.completed_quests + 1;

      const { error } = await supabase
        .from("users")
        .update({ xp: newXp, level: newLevel, completed_quests: newCompleted })
        .eq("id", session.user.id);

      console.log("Update error:", error);

      alert(`⚔️ Quest Complete! +${quest.xp_reward} XP`);
      fetchRandomQuest();
    } else {
      await supabase.from("users").insert({
        id: session.user.id,
        username: session.user.email,
        xp: quest.xp_reward,
        level: 1,
        completed_quests: 1,
      });
      alert(`⚔️ Quest Complete! +${quest.xp_reward} XP`);
      fetchRandomQuest();
    }
    setCompleting(false);
  }

  const difficultyColor: any = {
    easy: "#4caf50",
    medium: "#ff9800",
    hard: "#f44336",
    legendary: "#9c27b0",
  };

  if (loading)
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#6c47ff" size="large" />
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.header}> Daily Side Quest</Text>

      {quest && (
        <View style={styles.card}>
          <View
            style={[
              styles.badge,
              { backgroundColor: difficultyColor[quest.difficulty] ?? "#888" },
            ]}
          >
            <Text style={styles.badgeText}>
              {quest.difficulty?.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.questTitle}>{quest.title}</Text>
          <Text style={styles.questDesc}>{quest.description}</Text>

          <Text style={styles.xp}>+{quest.xp_reward} XP</Text>

          <TouchableOpacity
            style={styles.completeButton}
            onPress={completeQuest}
            disabled={completing}
          >
            <Text style={styles.completeText}>
              {completing ? "Completing..." : "✅ Complete Quest"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={fetchRandomQuest}
          >
            <Text style={styles.skipText}>🎲 Reroll Quest</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    justifyContent: "center",
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 32,
  },
  card: { backgroundColor: "#1a1a1a", borderRadius: 16, padding: 24 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  questTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  questDesc: { fontSize: 15, color: "#aaa", marginBottom: 20 },
  xp: { fontSize: 20, fontWeight: "bold", color: "#6c47ff", marginBottom: 24 },
  completeButton: {
    backgroundColor: "#6c47ff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  completeText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  skipButton: { padding: 12, alignItems: "center" },
  skipText: { color: "#888", fontSize: 14 },
});
