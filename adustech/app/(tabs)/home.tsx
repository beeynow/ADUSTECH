import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, TextInput, TouchableOpacity, FlatList, Image, ScrollView, Platform, StatusBar } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Post {
  id: string;
  author: string;
  avatar?: string;
  category: string;
  title: string;
  content: string;
  image?: string;
  likes: number;
  reposts: number;
  comments: number;
  liked?: boolean;
}

const CATEGORIES = ['All','Level','Department','Exam','Timetable','Event'];

import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([{
    id: '1', author: 'Ada Lovelace', category: 'Department', title: 'New Lab Resources', content: 'CS department just added new lab machines. Book your slot!', likes: 12, reposts: 3, comments: 5,
    image: 'https://picsum.photos/seed/lab/800/500'
  }, {
    id: '2', author: 'Exam Office', category: 'Exam', title: 'Mid-Sem Schedule', content: 'Mid-semester exam timetable will be out on Friday 10 AM.', likes: 45, reposts: 12, comments: 30,
  }, {
    id: '3', author: 'Student Union', category: 'Event', title: 'Tech Fest 2026', content: 'Join us for hackathons, talks, and merch giveaways this weekend!', likes: 64, reposts: 18, comments: 41,
    image: 'https://picsum.photos/seed/fest/800/500'
  }, {
    id: '4', author: 'Level Coordinator', category: 'Level', title: '400L Project Briefing', content: 'Mandatory briefing for 400L students on capstone projects.', likes: 23, reposts: 7, comments: 10,
  }] );

  const filtered = useMemo(() => {
    let list = posts;
    if (activeCat !== 'All') list = list.filter(p => p.category === activeCat);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.author.toLowerCase().includes(q));
    }
    return list;
  }, [posts, activeCat, search]);

  const toggleLike = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p));
  };
  const incRepost = (id: string) => setPosts(prev => prev.map(p => p.id === id ? { ...p, reposts: p.reposts + 1 } : p));
  const incComment = (id: string) => setPosts(prev => prev.map(p => p.id === id ? { ...p, comments: p.comments + 1 } : p));

  const headerBg = isDark ? '#0A1929' : '#FFFFFF';
  const bg = isDark ? '#0A1929' : '#E6F4FE';
  const card = isDark ? '#0F213A' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#0A1929';
  const muted = isDark ? '#90CAF9' : '#607D8B';
  const border = isDark ? 'rgba(66,165,245,0.25)' : 'rgba(25,118,210,0.15)';

  const goToDetail = (item: Post) => {
    router.push({ pathname: '/post/[id]', params: { id: item.id, title: item.title, author: item.author, content: item.content, image: item.image || '' } });
  };

  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity onPress={() => goToDetail(item)} activeOpacity={0.8} style={[styles.post, { backgroundColor: card, borderColor: border }]}>      <View style={styles.postHeader}>
        <View style={[styles.avatar, { backgroundColor: isDark ? '#42A5F5' : '#1976D2' }]}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>{item.author.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.postTitle, { color: textPrimary }]} numberOfLines={1}>{item.title}</Text>
          <Text style={{ color: muted, fontSize: 12 }}>{item.author} • {item.category}</Text>
        </View>
      </View>
      <Text style={{ color: muted, marginTop: 6 }}>{item.content}</Text>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} />
      )}
      <View style={styles.postActions} onStartShouldSetResponder={() => true}>
        {/* prevent parent touch from triggering navigation when pressing actions */}
        <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(item.id)}>
          <Ionicons name={item.liked ? 'heart' : 'heart-outline'} size={18} color={item.liked ? '#E53935' : muted} />
          <Text style={[styles.count, { color: muted }]}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => incRepost(item.id)}>
          <Ionicons name="repeat" size={18} color={muted} />
          <Text style={[styles.count, { color: muted }]}>{item.reposts}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => incComment(item.id)}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={muted} />
          <Text style={[styles.count, { color: muted }]}>{item.comments}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}> 
      {/* Header (non-scroll) */}
      <View style={{ height: (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 12) }} />
      <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: border }]}> 
        <Text style={[styles.logo, { color: textPrimary }]}>ADUSTECH</Text>
        <TouchableOpacity accessibilityRole="button">
          <Ionicons name="notifications-outline" size={22} color={isDark ? '#64B5F6' : '#1976D2'} />
        </TouchableOpacity>
      </View>

      {/* Search + categories (sticky header for list) */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12, paddingBottom: 96 }}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => {
            // Simulate refresh by shuffling
            setPosts((prev) => [...prev].reverse());
            setRefreshing(false);
          }, 800);
        }}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          // Simulate infinite scroll by appending demo posts
          setPage((p) => p + 1);
          const nid = (posts.length + 1).toString();
          setPosts((prev) => [
            ...prev,
            { id: nid, author: 'Campus News', category: 'Event', title: `Campus Update #${nid}`, content: 'New updates around campus. Stay tuned!', likes: 0, reposts: 0, comments: 0, image: (parseInt(nid)%2===0 ? `https://picsum.photos/seed/${nid}/800/500` : undefined) },
          ]);
        }}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View style={{ backgroundColor: headerBg }}> 
            <View style={[styles.searchWrap, { backgroundColor: headerBg, borderColor: border }]}> 
              <Ionicons name="search" color={muted} size={16} />
              <TextInput
                style={[styles.searchInput, { color: textPrimary }]} 
                placeholder="Search posts, people, updates..." 
                placeholderTextColor={muted}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={16} color={muted} />
                </TouchableOpacity>
              )}
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.chipsRow, { paddingRight: 8 }]}
            >
              {CATEGORIES.map(cat => (
                <TouchableOpacity key={cat} onPress={() => setActiveCat(cat)} style={[styles.chip, activeCat === cat && styles.chipActive, { borderColor: border }]}
                >
                  <Text style={[styles.chipText, { color: activeCat === cat ? (isDark ? '#FFFFFF' : '#1976D2') : muted }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  logo: { fontWeight: '800', fontSize: 18, letterSpacing: 0.5 },
  searchWrap: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100, borderWidth: 1, backgroundColor: 'transparent' },
  chipActive: { backgroundColor: 'rgba(25,118,210,0.12)' },

  post: { borderRadius: 16, padding: 12, borderWidth: 1, marginBottom: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  postTitle: { fontWeight: '800', fontSize: 15 },
  postImage: { marginTop: 8, height: 200, borderRadius: 12, width: '100%' },
  postActions: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8 },
  count: { fontSize: 12 },
});
