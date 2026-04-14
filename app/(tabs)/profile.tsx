import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function ProfileScreen() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        router.replace("/login");
        return;
      }
      fetchUser(session.user.id);
    });
  }, []);

  async function fetchUser(id: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (error) console.error("fetch user error", error);
    if (data) setUser(data);
    setLoading(false);
  }

  async function handleUpload() {
    if (!avatarUrl) return;
    setUpdating(true);
    // Store the provided URL directly in the user avatar field
    const { error } = await supabase
      .from("users")
      .update({ avatar: avatarUrl })
      .eq("id", session.user.id);
    if (error) {
      alert(`Error updating avatar: ${error.message}`);
    } else {
      setUser((prev: any) => ({ ...prev, avatar: avatarUrl }));
    }
    setUpdating(false);
  }

  if (loading) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Overview</Text>
      {user?.avatar ? (
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder} />
      )}
      <Text style={styles.info}>XP: {user?.xp ?? 0}</Text>
      <Text style={styles.info}>Level: {user?.level ?? 1}</Text>
      <Text style={styles.info}>Completed Quests: {user?.completed_quests ?? 0}</Text>
      <TextInput
        style={styles.input}
        placeholder="Avatar URL"
        value={avatarUrl}
        onChangeText={setAvatarUrl}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleUpload}
        disabled={updating}
      >
        <Text style={styles.buttonText}>{updating ? "Uploading…" : "Upload Avatar"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#1a1f1a" },
  title: { fontSize: 28, color: "#fff", marginBottom: 24, textAlign: "center" },
  avatar: { width: 120, height: 120, borderRadius: 60, alignSelf: "center", marginBottom: 16 },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "#777",
    alignSelf: "center",
    marginBottom: 16,
  },
  info: { color: "#e8e0d0", fontSize: 16, marginTop: 8, textAlign: "center" },
  input: { backgroundColor: "#242b24", color: "#e8e0d0", padding: 12, borderRadius: 12, marginTop: 16 },
  button: { backgroundColor: "#4a7c59", padding: 12, borderRadius: 25, marginTop: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
