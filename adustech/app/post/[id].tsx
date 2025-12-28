import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, Image, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { postsAPI } from '../../services/postsApi';

interface CommentItem { id: string; author: string; text: string; likes?: number; liked?: boolean; }

export default function PostDetail() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params as Record<string, string>;
  const [pTitle, setPTitle] = useState('');
  const [pAuthor, setPAuthor] = useState('');
  const [pContent, setPContent] = useState('');
  const [pImage, setPImage] = useState<string | undefined>(undefined);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const postRes = await postsAPI.get(id as string);
        const post = postRes.post;
        setPTitle(post.text?.slice(0, 80) || 'Post');
        setPAuthor(post.userName || '');
        setPContent(post.text || '');
        setPImage(post.imageUrl || post.imageBase64 || undefined);
      } catch (e) {
        // fallback remains empty
      }
      try {
        const data = await postsAPI.listComments(id as string);
        const mapped = (data.comments || []).map((c: any) => ({ id: c._id, author: c.userName, text: c.text, likes: (c.likes||[]).length }));
        setComments(mapped);
      } catch (e) {}
    })();
  }, [id]);

  const card = isDark ? '#0F213A' : '#FFFFFF';
  const bg = isDark ? '#0A1929' : '#E6F4FE';
  const textPrimary = isDark ? '#FFFFFF' : '#0A1929';
  const muted = isDark ? '#90CAF9' : '#607D8B';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: bg }]}> 
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(66,165,245,0.25)' : 'rgba(25,118,210,0.15)' }]}> 
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={isDark ? '#64B5F6' : '#1976D2'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textPrimary }]} numberOfLines={1}>Post</Text>
          <View style={{ width: 22 }} />
        </View>

        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={{ padding: 12 }}>
              <View style={[styles.card, { backgroundColor: card }]}> 
                <Text style={[styles.title, { color: textPrimary }]}>{pTitle}</Text>
                <Text style={{ color: muted, marginTop: 2 }}>{pAuthor}</Text>
                {!!pImage && <Image source={{ uri: pImage }} style={styles.image} />}
                <Text style={{ color: muted, marginTop: 8 }}>{pContent}</Text>
              </View>
              <Text style={[styles.commentsHeading, { color: textPrimary }]}>Comments</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.comment, { backgroundColor: card }]}> 
              <View style={[styles.avatar, { backgroundColor: isDark ? '#42A5F5' : '#1976D2' }]}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>{item.author.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.commentAuthor, { color: textPrimary }]}>{item.author}</Text>
                <Text style={{ color: muted }}>{item.text}</Text>
              </View>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const res = await postsAPI.toggleLikeComment(id as string, item.id);
                    setComments(prev => prev.map(c => c.id === item.id ? { ...c, likes: res.likes } : c));
                  } catch {}
                }}
                style={{ padding: 8 }}
              >
                <Ionicons name="heart-outline" size={18} color={isDark ? '#FFCDD2' : '#C62828'} />
                <Text style={{ color: muted, fontSize: 12, textAlign: 'center' }}>{item.likes || 0}</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 88 }}
        />

        {/* Composer */}
        <View style={[styles.composerWrap, { backgroundColor: card, borderTopColor: isDark ? 'rgba(66,165,245,0.25)' : 'rgba(25,118,210,0.15)' }]}> 
          <TextInput
            style={[styles.composerInput, { color: textPrimary }]} value={text} onChangeText={setText}
            placeholder="Add a comment..." placeholderTextColor={muted}
          />
          <TouchableOpacity
            onPress={async () => {
              if (!text.trim()) return;
              try {
                const res = await postsAPI.addComment(id as string, text);
                const c = res.comment;
                setComments(prev => [...prev, { id: c._id, author: c.userName, text: c.text, likes: 0 }]);
                setText('');
              } catch (e) {}
            }}
            style={styles.sendBtn}
          >
            <Ionicons name="send" size={18} color={isDark ? '#64B5F6' : '#1976D2'} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 56, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  card: { borderRadius: 16, padding: 12 },
  title: { fontSize: 18, fontWeight: '800' },
  image: { marginTop: 8, height: 220, borderRadius: 12, width: '100%' },
  commentsHeading: { marginTop: 8, fontSize: 16, fontWeight: '800' },
  comment: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 12, marginBottom: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  commentAuthor: { fontWeight: '700', marginBottom: 2 },
  composerWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  composerInput: { flex: 1, height: 40 },
  sendBtn: { padding: 8 },
});
