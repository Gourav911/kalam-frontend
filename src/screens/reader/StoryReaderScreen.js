import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Alert,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ApiService from "../../services/apiService";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

/* ─── tiny heart icon ──────────────────────────────────── */
const HeartIcon = ({ liked, size = 22 }) => (
  <Text style={{ fontSize: size }}>{liked ? "❤️" : "🤍"}</Text>
);

/* ─── dynamic pagination ────────────────────────────────── */
function paginateText(text, fontSize) {
  if (!text) return [""];

  // Reserve space for header (~70), footer (~70), padding (~60)
  const availH = SCREEN_H - 200;
  const lineH  = fontSize * 1.75;
  const maxLines = Math.floor(availH / lineH);

  const charW = fontSize * 0.52;
  const availW = SCREEN_W - 48; // 24px padding each side
  const charsPerLine = Math.floor(availW / charW);

  const maxChars = Math.max(1, maxLines * charsPerLine);

  const pages = [];
  let i = 0;
  while (i < text.length) {
    let end = i + maxChars;
    if (end < text.length) {
      // walk back to word boundary
      while (end > i && text[end] !== " " && text[end] !== "\n") end--;
      if (end === i) end = i + maxChars; // no space found – hard cut
    } else {
      end = text.length;
    }
    pages.push(text.slice(i, end).trim());
    i = end;
  }
  return pages;
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const StoryReaderScreen = ({ route, navigation }) => {
  const { story } = route.params;

  /* ── theme ─────────────────────────────────────────────── */
  const [theme, setTheme]   = useState("dark");
  const [fontSize, setFontSize] = useState(18);
  const [showControls, setShowControls] = useState(true);

  /* ── like state ─────────────────────────────────────────── */
  const [isLiked, setIsLiked]     = useState(story?.has_liked || story?.story?.is_liked || false);
  const [likesCount, setLikesCount] = useState(story?.story?.likes_count || 0);
  const [isLiking, setIsLiking]   = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  /* ── pagination ──────────────────────────────────────────── */
  const slides      = useMemo(() => paginateText(story.story.content, fontSize), [story.story.content, fontSize]);
  const totalSlides = slides.length;
  const [currentSlide, setCurrentSlide] = useState(0);

  /* ── scroll refs ─────────────────────────────────────────── */
  const scrollRef     = useRef(null);
  const isScrolling   = useRef(false); // block slider updates during programmatic scroll
  const sliderRef     = useRef(null);
  const sliderWidth   = useRef(0);
  const sliderPageX   = useRef(0);

  const readingProgress = (currentSlide + 1) / totalSlides;

  /* ── theme definitions ────────────────────────────────────── */
  const themes = {
    dark: {
      bg: "#0F0A1E",
      text: "rgba(255,255,255,0.87)",
      titleColor: "#FFFFFF",
      authorColor: "#C4B5FD",
      borderColor: "rgba(124,58,237,0.15)",
      headerBg: "#0A0518",
      sliderTrack: "rgba(168,85,247,0.15)",
      sliderFill: "#A855F7",
      sliderKnob: "#A855F7",
      statusBar: "light-content",
    },
    light: {
      bg: "#F8F9FA",
      text: "#2D3748",
      titleColor: "#1A202C",
      authorColor: "#7C3AED",
      borderColor: "#E2E8F0",
      headerBg: "#FFFFFF",
      sliderTrack: "#E2E8F0",
      sliderFill: "#7C3AED",
      sliderKnob: "#7C3AED",
      statusBar: "dark-content",
    },
    sepia: {
      bg: "#F4EFE6",
      text: "#433422",
      titleColor: "#2C1D11",
      authorColor: "#B45309",
      borderColor: "#E7DEC7",
      headerBg: "#EFE7D4",
      sliderTrack: "#E7DEC7",
      sliderFill: "#B45309",
      sliderKnob: "#B45309",
      statusBar: "dark-content",
    },
  };
  const T = themes[theme];

  /* ── go to slide (programmatic) ───────────────────────────── */
  const goToSlide = useCallback((index, animated = true) => {
    const clamped = Math.max(0, Math.min(index, totalSlides - 1));
    isScrolling.current = true;
    setCurrentSlide(clamped);
    scrollRef.current?.scrollTo({ x: clamped * SCREEN_W, animated });
    // release lock after scroll is done (~350ms)
    setTimeout(() => { isScrolling.current = false; }, 350);
  }, [totalSlides]);

  /* ── detect page after native swipe ─────────────────────── */
  const onScrollEnd = useCallback((e) => {
    if (isScrolling.current) return; // was programmatic
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setCurrentSlide(Math.max(0, Math.min(idx, totalSlides - 1)));
  }, [totalSlides]);

  /* ── slider drag ─────────────────────────────────────────── */
  const handleSliderDrag = useCallback((pageX) => {
    if (sliderWidth.current <= 0) return;
    const rel = pageX - sliderPageX.current;
    const pct = Math.max(0, Math.min(1, rel / sliderWidth.current));
    const target = Math.round(pct * (totalSlides - 1));
    // instant jump – no animation for live drag
    isScrolling.current = true;
    setCurrentSlide(target);
    scrollRef.current?.scrollTo({ x: target * SCREEN_W, animated: false });
    setTimeout(() => { isScrolling.current = false; }, 50);
  }, [totalSlides]);

  const sliderPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, g) => {
        sliderRef.current?.measure((x, y, w, h, px) => {
          sliderPageX.current = px;
          sliderWidth.current = w;
          handleSliderDrag(g.x0);
        });
      },
      onPanResponderMove: (_, g) => handleSliderDrag(g.moveX),
    })
  ).current;

  /* ── like handler ─────────────────────────────────────────── */
  const handleLike = async () => {
    if (isLiking) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 110, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,   duration: 110, useNativeDriver: true }),
    ]).start();

    const prev = isLiked, prevCount = likesCount;
    setIsLiked(!prev);
    setLikesCount(prev ? Math.max(prevCount - 1, 0) : prevCount + 1);
    setIsLiking(true);

    try {
      const res = prev
        ? await ApiService.unlikeStory(story.story.id)
        : await ApiService.likeStory(story.story.id);
      if (!res.success) throw new Error();
      setIsLiked(res.data.is_liked ?? res.data.has_liked);
      setLikesCount(res.data.likes_count);
    } catch {
      setIsLiked(prev);
      setLikesCount(prevCount);
      Alert.alert("Error", "Unable to update like");
    } finally {
      setIsLiking(false);
    }
  };

  /* ── render ───────────────────────────────────────────────── */
  return (
    <View style={[s.root, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.statusBar} hidden={!showControls} />

      {/* ── HEADER ── */}
      {showControls && (
        <SafeAreaView
          style={[s.header, { backgroundColor: T.headerBg, borderBottomColor: T.borderColor }]}
          edges={["top"]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={[s.backText, { color: T.authorColor }]}>← Back</Text>
          </TouchableOpacity>

          <View style={s.headerRight}>
            {/* Font size */}
            <TouchableOpacity onPress={() => setFontSize(f => Math.max(14, f - 2))} style={s.fontBtn}>
              <Text style={[s.fontBtnTxt, { color: T.authorColor }]}>A−</Text>
            </TouchableOpacity>
            <Text style={[s.fontVal, { color: T.text }]}>{fontSize}</Text>
            <TouchableOpacity onPress={() => setFontSize(f => Math.min(26, f + 2))} style={s.fontBtn}>
              <Text style={[s.fontBtnTxt, { color: T.authorColor }]}>A+</Text>
            </TouchableOpacity>

            {/* Theme dots */}
            <View style={s.themePicker}>
              {[["light", "#F8F9FA", "#CBD5E1"], ["dark", "#0F0A1E", "#7C3AED"], ["sepia", "#F4EFE6", "#B45309"]].map(
                ([id, bg, border]) => (
                  <TouchableOpacity
                    key={id}
                    onPress={() => setTheme(id)}
                    style={[
                      s.themeDot,
                      { backgroundColor: bg, borderColor: theme === id ? "#A855F7" : border },
                      theme === id && s.themeDotActive,
                    ]}
                  />
                )
              )}
            </View>
          </View>
        </SafeAreaView>
      )}

      {/* ── THIN TOP PROGRESS LINE ── */}
      {showControls && (
        <View style={[s.topBar, { backgroundColor: T.sliderTrack }]}>
          <View style={[s.topBarFill, { width: `${readingProgress * 100}%`, backgroundColor: T.sliderFill }]} />
        </View>
      )}

      {/* ════════════════════════════════════════════════
          NATIVE HORIZONTAL SCROLL — single render, no FlatList
          Each child View is exactly SCREEN_W wide.
      ════════════════════════════════════════════════ */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        style={s.pager}
        contentContainerStyle={{ flexGrow: 0 }}
      >
        {slides.map((pageText, idx) => (
          <TouchableOpacity
            key={idx}
            activeOpacity={1}
            onPress={() => setShowControls(v => !v)}
            style={[s.page, { width: SCREEN_W }]}
          >
            {/* Title + author only on first page */}
            {idx === 0 && (
              <View style={s.coverHeader}>
                <Text style={[s.title, { color: T.titleColor }]}>
                  {story.story.title}
                </Text>
                <Text style={[s.author, { color: T.authorColor }]}>
                  by {story.story.author?.name}
                </Text>
                <View style={[s.divider, { backgroundColor: T.borderColor }]} />
              </View>
            )}

            {/* Text content */}
            <Text style={[s.bodyText, { fontSize, lineHeight: fontSize * 1.75, color: T.text }]}>
              {pageText}
            </Text>

            {/* End CTA only on last page */}
            {idx === totalSlides - 1 && (
              <View style={s.endSection}>
                <Text style={[s.endLabel, { color: T.authorColor }]}>— End of Story —</Text>
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <TouchableOpacity
                    style={[s.likeCta, isLiked && s.likeCtaActive]}
                    onPress={handleLike}
                    disabled={isLiking}
                  >
                    <HeartIcon liked={isLiked} size={22} />
                    <Text style={s.likeCtaTxt}>
                      {isLiked ? "Liked" : "Like this story"} · {likesCount}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── FOOTER ── */}
      {showControls && (
        <View style={[s.footer, { backgroundColor: T.headerBg, borderTopColor: T.borderColor }]}>
          {/* Prev */}
          <TouchableOpacity
            onPress={() => goToSlide(currentSlide - 1)}
            disabled={currentSlide === 0}
            style={s.navBtn}
          >
            <Text style={[s.navTxt, { color: T.authorColor }, currentSlide === 0 && s.navDisabled]}>
              Prev
            </Text>
          </TouchableOpacity>

          {/* Slider + page counter */}
          <View style={s.sliderArea}>
            <Text style={[s.pageCounter, { color: T.text }]}>
              {currentSlide + 1} / {totalSlides}
            </Text>

            {/* Draggable track */}
            <View
              ref={sliderRef}
              collapsable={false}
              style={s.track}
              onLayout={e => { sliderWidth.current = e.nativeEvent.layout.width; }}
              {...sliderPan.panHandlers}
            >
              {/* Fill */}
              <View style={[s.trackBg, { backgroundColor: T.sliderTrack }]}>
                <View
                  style={[
                    s.trackFill,
                    {
                      width: `${(currentSlide / Math.max(totalSlides - 1, 1)) * 100}%`,
                      backgroundColor: T.sliderFill,
                    },
                  ]}
                />
              </View>
              {/* Knob */}
              <View
                style={[
                  s.knob,
                  {
                    left: `${(currentSlide / Math.max(totalSlides - 1, 1)) * 100}%`,
                    backgroundColor: T.sliderKnob,
                    transform: [{ translateX: -10 }],
                  },
                ]}
              />
            </View>
          </View>

          {/* Next */}
          <TouchableOpacity
            onPress={() => goToSlide(currentSlide + 1)}
            disabled={currentSlide === totalSlides - 1}
            style={s.navBtn}
          >
            <Text style={[s.navTxt, { color: T.authorColor }, currentSlide === totalSlides - 1 && s.navDisabled]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default StoryReaderScreen;

/* ═══════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════ */
const s = StyleSheet.create({
  root:       { flex: 1 },

  /* header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backBtn:    { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "rgba(124,58,237,0.08)", borderRadius: 12 },
  backText:   { fontSize: 14, fontWeight: "700" },
  headerRight:{ flexDirection: "row", alignItems: "center", gap: 6 },
  fontBtn:    { width: 30, height: 30, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(124,58,237,0.08)", borderRadius: 8 },
  fontBtnTxt: { fontSize: 12, fontWeight: "800" },
  fontVal:    { fontSize: 12, fontWeight: "600", minWidth: 18, textAlign: "center" },
  themePicker:{ flexDirection: "row", gap: 6, marginLeft: 8, paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: "rgba(124,58,237,0.2)" },
  themeDot:   { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5 },
  themeDotActive: { transform: [{ scale: 1.15 }] },

  /* top progress */
  topBar:     { height: 3, width: "100%" },
  topBarFill: { height: "100%" },

  /* pages */
  pager: { flex: 1 },
  page: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 30,
  },

  /* cover on page 0 */
  coverHeader:{ alignItems: "center", marginBottom: 18 },
  title:      { fontSize: 22, fontWeight: "800", textAlign: "center", lineHeight: 30, marginBottom: 6 },
  author:     { fontSize: 13, fontWeight: "600", textAlign: "center", marginBottom: 14 },
  divider:    { height: 1, width: "35%", borderRadius: 1 },

  /* body */
  bodyText:   { textAlign: "left", letterSpacing: 0.25 },

  /* end section */
  endSection: { marginTop: 32, alignItems: "center" },
  endLabel:   { fontSize: 13, fontWeight: "600", letterSpacing: 1.5, marginBottom: 20 },
  likeCta: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: "rgba(124,58,237,0.08)",
    borderWidth: 1, borderColor: "rgba(124,58,237,0.15)",
  },
  likeCtaActive:{ backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.2)" },
  likeCtaTxt: { marginLeft: 8, fontSize: 14, fontWeight: "600", color: "#EF4444" },

  /* footer */
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  navBtn:     { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "rgba(124,58,237,0.06)", borderRadius: 10 },
  navTxt:     { fontSize: 13, fontWeight: "700" },
  navDisabled:{ opacity: 0.25 },

  /* slider */
  sliderArea: { flex: 1, alignItems: "center", paddingHorizontal: 8 },
  pageCounter:{ fontSize: 11, fontWeight: "700", marginBottom: 6 },
  track:      { width: "100%", height: 24, justifyContent: "center", position: "relative" },
  trackBg:    { height: 4, borderRadius: 2, overflow: "hidden" },
  trackFill:  { height: "100%", borderRadius: 2 },
  knob: {
    position: "absolute",
    width: 20, height: 20,
    borderRadius: 10,
    top: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
