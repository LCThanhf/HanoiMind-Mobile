import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
//import { getForumPosts } from '../services/forumService/forum.service';
import { ForumPost } from '../services/forumService/forum.type';

const ForumScreen = ({ navigation }: any) => {
  const tabs = ['Tất cả', 'Hỏi đáp', 'Chia sẻ', 'Review'];
  const [activeTab, setActiveTab] = React.useState('Tất cả');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // const data = await getForumPosts();
        // setPosts(data);
      } catch (error) {
        console.error('Error fetching forum posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const renderPost = ({ item }: { item: ForumPost }) => (
    <View style={styles.postContainer}>
      <Text style={styles.postAuthor}>author</Text>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postFooter}>
        <Text style={styles.postLikes}>❤️likes</Text>
        <Text style={styles.postComments}>💬 comments</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Diễn đàn du lịch</Text>
        <TouchableOpacity style={styles.createPostButton} onPress={() => navigation.navigate('CreatePostScreen')}>
          <Text style={styles.createPostText}>Tạo bài viết</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderPost}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có bài viết nào.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createPostButton: {
    backgroundColor: '#2B8EF0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createPostText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e5e5e5',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#2B8EF0',
  },
  tabText: {
    color: '#555',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postAuthor: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  postContent: {
    marginBottom: 8,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postLikes: {
    color: '#e63946',
  },
  postComments: {
    color: '#457b9d',
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 20,
  },
});

export default ForumScreen;