import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../contexts/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import apiService from "../../services/apiService";
import { BASE_URL } from "../../constants/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useLanguage } from "../../contexts/LanguageContext";
import StoryReel from "../../components/common/StoryReel";
import ShortStoryViewer from "../../components/common/ShortStoryViewer";
import ShortStoryUploadModal from "../../components/common/ShortStoryUploadModal";

const LANGUAGES = [
  { id: "All", name: "All Languages", flag: "🌐" },
  { id: "en", name: "English", flag: "🇬🇧" },
  { id: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { id: "pb", name: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { id: "ur", name: "اردو", flag: "🇵🇰" },
  { id: "bn", name: "বাংলা", flag: "🇧🇩" },
];

const HomeScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  
  // Pagination & Data states
  const [stories, setStories] = useState([]);
  const [adminStories, setAdminStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Search Preview states
  const [searchPreview, setSearchPreview] = useState({ stories: [], writers: [] });
  const [isSearchingUnified, setIsSearchingUnified] = useState(false);
  const [showSearchPreview, setShowSearchPreview] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const result = await apiService.getUnreadNotificationsCount();
      if (result.success) {
        setUnreadCount(result.data?.count ?? 0);
      }
    } catch (e) {
      console.error("fetchUnreadCount error:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [])
  );
  
  const reelRef = useRef(null);

  const heroStory = stories.length > 0 ? stories[0] : null;
  const otherStories = stories.length > 1 ? stories.slice(1) : [];

  useEffect(() => {
    loadInitialData();
  }, []);

  // Debounced live search — fetches unified search preview
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setShowSearchPreview(false);
      setSearchPreview({ stories: [], writers: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingUnified(true);
      setShowSearchPreview(true);
      const result = await apiService.searchUnified(searchQuery, 4);
      if (result.success) {
        setSearchPreview(result.data.data);
      }
      setIsSearchingUnified(false);
    }, 400);
    return () => clearTimeout(timer); // cancel if user keeps typing
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInitialData = async () => {
    setIsLoading(true);
    await fetchCategories();
    await fetchAdminStories();
    await fetchStories(selectedCategory, searchQuery, selectedLanguage, 1, true);
    setIsLoading(false);
  };

  const fetchCategories = async () => {
    const result = await apiService.getCategories();
    if (result.success) {
      setCategories([{ id: "All", name: "All", slug: "all" }, ...result.data.data]);
    }
  };

  const fetchAdminStories = async () => {
    const result = await apiService.getStories({ admin_recent: true, per_page: 10 });
    if (result.success) {
      setAdminStories(result.data?.data?.data ?? result.data?.data ?? []);
    }
  };

  const fetchStories = async (category = null, search = "", lang = "All", pageNum = 1, isRefresh = false) => {
    if (pageNum > 1) setIsFetchingMore(true);

    const filters = { per_page: 10, page: pageNum };
    if (category && category !== "All") filters.category = category;
    if (search) filters.search = search;
    if (lang && lang !== "All") filters.language = lang;
    
    const result = await apiService.getStories(filters);
    
    if (result.success) {
      const newStories = result.data.data.data || [];
      const lastPage = result.data.data.last_page || 1;
      
      if (isRefresh || pageNum === 1) {
        setStories(newStories);
      } else {
        setStories(prev => [...prev, ...newStories]);
      }
      
      setHasMore(pageNum < lastPage);
    }
    
    setIsFetchingMore(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    reelRef.current?.refresh();
    await fetchAdminStories();
    await fetchStories(selectedCategory, searchQuery, selectedLanguage, 1, true);
    await fetchUnreadCount();
    setRefreshing(false);
  };

  const loadMoreStories = () => {
    if (!isLoading && !isFetchingMore && hasMore && !refreshing) {
      const next = page + 1;
      setPage(next);
      fetchStories(selectedCategory, searchQuery, selectedLanguage, next, false);
    }
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category.name);
    setPage(1);
    fetchStories(category.id, searchQuery, selectedLanguage, 1, true);
  };

  const handleLanguagePress = (lang) => {
    setSelectedLanguage(lang.id);
    setPage(1);
    fetchStories(selectedCategory, searchQuery, lang.id, 1, true);
  };

  const handleSearch = () => {
    setShowSearchPreview(false);
    setPage(1);
    fetchStories(selectedCategory, searchQuery, selectedLanguage, 1, true);
  };

  const navigateToStory = (story) => {
    navigation.navigate("StoryPreviewScreenReader", { story });
  };

  const navigateToProfile = () => {
    navigation.navigate("Profile");
  };

  // useCallback ensures ListHeader keeps a stable reference between renders.
  // Without this, every keystroke in the search box re-creates ListHeader,
  // FlatList unmounts/remounts the header, and StoryReel fires its API call.
  // IMPORTANT: must be defined BEFORE any early return to follow Rules of Hooks.
  const ListHeader = useCallback(() => {
    return (
      <>
        {/* ── Hero Story ── */}
        {heroStory && (
          <TouchableOpacity
            style={styles.heroContainer}
            onPress={() => navigateToStory(heroStory)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: BASE_URL + heroStory.cover_image }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(15,10,30,0.92)"]}
              style={styles.heroGradient}
            >
              {heroStory.category && (
                <View style={styles.heroCategoryBadge}>
                  <Text style={styles.heroCategoryText}>
                    {t(heroStory.category.slug) || heroStory.category.name}
                  </Text>
                </View>
              )}
              <Text style={styles.heroTitle} numberOfLines={2}>
                {heroStory.title}
              </Text>
              <Text style={styles.heroAuthor}>
                by {heroStory.author?.name}
              </Text>
              <View style={styles.heroStats}>
                <Text style={styles.heroStat}>❤️ {heroStory.likes_count}</Text>
                <Text style={styles.heroStat}>👁 {heroStory.views_count}</Text>
                <Text style={styles.heroStat}>
                  ⏱ {heroStory.reading_time ?? "–"} min
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Languages ── */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Language</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={LANGUAGES}
            keyExtractor={(lang) => lang.id}
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item: lang }) => (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedLanguage === lang.id && styles.categoryChipActive,
                ]}
                onPress={() => handleLanguagePress(lang)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedLanguage === lang.id && styles.categoryTextActive,
                  ]}
                >
                  {lang.flag} {lang.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* ── Categories ── */}
        <View style={[styles.categoriesContainer, { paddingTop: 10 }]}>
          <Text style={styles.sectionTitle}>{t("categories")}</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(cat) => cat.id.toString()}
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item: cat }) => (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.name && styles.categoryChipActive,
                ]}
                onPress={() => handleCategoryPress(cat)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.name && styles.categoryTextActive,
                  ]}
                >
                  {t(cat.slug) || cat.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* ── Admin Picks Section ── */}
        {adminStories.length > 0 && (
          <View style={styles.adminSectionContainer}>
            <Text style={styles.sectionTitle}>{t("adminSpecials") || "Admin Picks"}</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={adminStories}
              keyExtractor={(story) => `admin-${story.id}`}
              contentContainerStyle={styles.adminStoriesList}
              renderItem={({ item: story }) => (
                <TouchableOpacity
                  style={styles.adminStoryCard}
                  onPress={() => navigateToStory(story)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: story.cover_image ? BASE_URL + story.cover_image : null }}
                    style={styles.adminStoryCover}
                    resizeMode="cover"
                  />
                  <View style={styles.adminStoryInfo}>
                    <View>
                      {story.category && (
                        <View style={styles.adminCategoryBadge}>
                          <Text style={styles.adminCategoryText}>
                            {t(story.category.slug) || story.category.name}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.adminStoryTitle} numberOfLines={2}>
                        {story.title}
                      </Text>
                      <Text style={styles.adminStoryAuthor} numberOfLines={1}>
                        by {story.author?.name}
                      </Text>
                    </View>
                    <View style={styles.adminCardStats}>
                      <Text style={styles.adminStatItem}>❤️ {story.likes_count}</Text>
                      <Text style={styles.adminStatItem}>👁 {story.views_count}</Text>
                      {story.reading_time && (
                        <Text style={styles.adminStatItem}>⏱️ {story.reading_time} min</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <Text style={[styles.sectionTitle, { paddingHorizontal: 16, paddingTop: 10 }]}>
          {t("featuredStories")}
        </Text>
      </>
    );
  // Only re-create when actual data changes, NOT on function ref or search changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroStory?.id, selectedLanguage, selectedCategory, categories?.length, adminStories?.length, t]);

  // if (true) {
  if (isLoading && page === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message={t("loadingStories")} />
      </SafeAreaView>
    );
  }



  // ── Render single story card ──
  const renderStoryCard = ({ item: story }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => navigateToStory(story)}
      activeOpacity={0.85}
    >
      <View style={styles.coverWrapper}>
        <Image
          source={{ uri: story.cover_image ? BASE_URL + story.cover_image : null }}
          style={styles.storyCover}
          resizeMode="cover"
        />
        {story.category && (
          <View style={styles.coverBadge}>
            <Text style={styles.coverBadgeText}>
              {t(story.category.slug) || story.category.name}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.storyTitle} numberOfLines={2}>
          {story.title}
        </Text>
        <Text style={styles.storyAuthor} numberOfLines={1}>
          {story.author?.name}
        </Text>
        <View style={styles.cardStats}>
          <Text style={styles.statItem}>❤️ {story.likes_count}</Text>
          <Text style={styles.statItem}>👁 {story.views_count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Sticky Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {t("hello")}, {user?.name?.split(" ")[0] || "Reader"}! 👋
          </Text>
          <Text style={styles.subtitle}>{t("discoverStories")}</Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => navigation.navigate("Notifications")}
            activeOpacity={0.75}
          >
            <Feather name="bell" size={20} color="#C4B5FD" />
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={navigateToProfile}
            activeOpacity={0.8}
          >
            {user?.profile_image ? (
              <Image
                source={{ uri: BASE_URL + user.profile_image }}
                style={styles.avatarImg}
              />
            ) : (
              <LinearGradient
                colors={["#A855F7", "#7C3AED"]}
                style={styles.avatarImg}
              >
                <Text style={styles.avatarInitial}>
                  {user?.name?.[0]?.toUpperCase() ?? "?"}
                </Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search Bar (outside FlatList to prevent keyboard dismiss on re-render) ── */}
      <View style={[styles.searchContainer, { zIndex: 100 }]}>
        <View style={styles.searchInner}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t("searchStories") || "Search stories…"}
            placeholderTextColor="rgba(255,255,255,0.45)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* ── Search Preview Dropdown ── */}
        {showSearchPreview && (
          <View style={styles.searchPreviewDropdown}>
            {isSearchingUnified ? (
              <ActivityIndicator size="small" color="#A855F7" style={{ margin: 20 }} />
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 350 }}>
                {searchPreview.writers?.length > 0 && (
                  <View style={styles.previewSection}>
                    <Text style={styles.previewSectionTitle}>Writers</Text>
                    {searchPreview.writers.map(writer => (
                      <TouchableOpacity 
                        key={`w-${writer.id}`} 
                        style={styles.previewItem}
                        onPress={() => {
                          setShowSearchPreview(false);
                          navigation.navigate("UserProfile", { userId: writer.id });
                        }}
                      >
                         <Image 
                           source={{ uri: writer.profile_image ? BASE_URL + writer.profile_image : `https://ui-avatars.com/api/?name=${encodeURIComponent(writer.name)}&background=007AFF&color=fff` }} 
                           style={styles.previewAvatar} 
                         />
                         <View style={{ flex: 1 }}>
                           <Text style={styles.previewName} numberOfLines={1}>{writer.name}</Text>
                           <Text style={styles.previewBio} numberOfLines={1}>
                             {writer.bio || `${writer.stories_count} stories`}
                           </Text>
                         </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {searchPreview.stories?.length > 0 && (
                  <View style={styles.previewSection}>
                    <Text style={styles.previewSectionTitle}>Stories</Text>
                    {searchPreview.stories.map(story => (
                      <TouchableOpacity 
                        key={`s-${story.id}`} 
                        style={styles.previewItem}
                        onPress={() => {
                          setShowSearchPreview(false);
                          navigateToStory(story);
                        }}
                      >
                        <Image 
                          source={{ uri: story.cover_image ? BASE_URL + story.cover_image : null }} 
                          style={styles.previewStoryCover} 
                        />
                        <View style={{ flex: 1 }}>
                           <Text style={styles.previewName} numberOfLines={1}>{story.title}</Text>
                           <Text style={styles.previewBio} numberOfLines={1}>by {story.author?.name}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {searchPreview.writers?.length === 0 && searchPreview.stories?.length === 0 && (
                   <Text style={styles.previewEmpty}>No results found.</Text>
                )}
              </ScrollView>
            )}
          </View>
        )}
      </View>

      {/* ── Story Reel (outside FlatList so it NEVER remounts on search/re-render) ── */}
      <StoryReel
        ref={reelRef}
        onSelectGroup={(group) => setSelectedGroup(group)}
        onAddStory={() => setShowUploadModal(true)}
      />

      {/* ── Main Infinite Scroll List ── */}
      <FlatList
        data={otherStories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderStoryCard}
        numColumns={2}
        columnWrapperStyle={styles.storiesGridRow}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>📖</Text>
              <Text style={styles.emptyStateText}>No stories found</Text>
            </View>
          )
        }
        ListFooterComponent={
          isFetchingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#A855F7" />
            </View>
          ) : (
            <View style={{ height: 24 }} />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7C3AED"
          />
        }
        onEndReached={loadMoreStories}
        onEndReachedThreshold={0.5}
      />

      {/* ── Short Story Full-screen Viewer ── */}
      <ShortStoryViewer
        visible={!!selectedGroup}
        group={selectedGroup}
        onClose={() => {
          setSelectedGroup(null);
          reelRef.current?.refresh();
        }}
        navigation={navigation}
        onStoryDeleted={(deletedId) => {
          // Remove the deleted story from the selected group
          if (selectedGroup) {
            const remaining = selectedGroup.stories.filter(s => s.id !== deletedId);
            if (remaining.length === 0) {
              setSelectedGroup(null);
            } else {
              setSelectedGroup({ ...selectedGroup, stories: remaining });
            }
          }
          reelRef.current?.refresh();
        }}
      />

      {/* ── Short Story Upload Modal ── */}
      <ShortStoryUploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => reelRef.current?.refresh()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0A1E",
  },
  flatListContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: "#0F0A1E",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    marginTop: 2,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#7C3AED",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "#0F0A1E",
  },
  searchInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1440",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: "#2D1B69",
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
    paddingVertical: 0,
  },
  heroContainer: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 18,
    overflow: "hidden",
    height: 220,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1E1440",
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 14,
  },
  heroCategoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(124,58,237,0.85)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 6,
  },
  heroCategoryText: {
    color: "#E9D5FF",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
    marginBottom: 3,
  },
  heroAuthor: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 4,
  },
  heroStat: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1E1440",
    borderWidth: 1,
    borderColor: "#2D1B69",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#7C3AED",
    borderColor: "#A855F7",
  },
  categoryText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#fff",
  },
  storiesGridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  storyCard: {
    width: "48%",
    backgroundColor: "#1A1030",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2D1B69",
  },
  coverWrapper: {
    position: "relative",
  },
  storyCover: {
    width: "100%",
    height: 150,
    backgroundColor: "#2D1B69",
  },
  coverBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(124,58,237,0.85)",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  coverBadgeText: {
    color: "#E9D5FF",
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  cardInfo: {
    padding: 10,
  },
  storyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F3F0FF",
    marginBottom: 3,
    lineHeight: 18,
  },
  storyAuthor: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 8,
  },
  cardStats: {
    flexDirection: "row",
    gap: 10,
  },
  statItem: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyStateText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 15,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  
  // Search Preview Dropdown Styles
  searchPreviewDropdown: {
    position: 'absolute',
    top: 55,
    left: 20,
    right: 20,
    backgroundColor: '#1A1030',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D1B69',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  previewSection: {
    paddingTop: 12,
  },
  previewSectionTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#2D1B69',
  },
  previewStoryCover: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#2D1B69',
  },
  previewName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  previewBio: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  previewEmpty: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
  },
  adminSectionContainer: {
    paddingTop: 14,
    paddingBottom: 8,
  },
  adminStoriesList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  adminStoryCard: {
    width: Dimensions.get('window').width - 32,
    flexDirection: "row",
    backgroundColor: "#160F2B",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.25)",
    overflow: "hidden",
    padding: 12,
  },
  adminStoryCover: {
    width: 80,
    height: 105,
    borderRadius: 10,
    backgroundColor: "#2D1B69",
  },
  adminStoryInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "space-between",
  },
  adminCategoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
  },
  adminCategoryText: {
    color: "#C4B5FD",
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  adminStoryTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 20,
    marginBottom: 2,
  },
  adminStoryAuthor: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.45)",
    marginBottom: 4,
  },
  adminCardStats: {
    flexDirection: "row",
    gap: 12,
  },
  adminStatItem: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.65)",
    fontWeight: "600",
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(124, 58, 237, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  bellBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
});

export default HomeScreen;
