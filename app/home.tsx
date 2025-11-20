import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { XMLParser } from "fast-xml-parser";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// ====================================================================================
// Helper Components
// ====================================================================================

// 1. WebsiteCard Component
const WebsiteCard = ({ item, index, tw }) => (
  <TouchableOpacity
    key={item.id}
    style={styles.enhancedWebsiteCard}
    onPress={() =>
      Linking.openURL(item.url).catch((err) =>
        console.error("Couldn't load page", err)
      )
    }
  >
    <View style={styles.websiteBanner}>
      <Image
        source={
          item.bannerUri || require("../assets/images/indianwaterportal.jpg")
        }
        style={styles.bannerImage}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.bannerGradient}
      />
      <View style={styles.websiteCardContent}>
        <Text style={styles.websiteTitle}>{tw(index, "title")}</Text>
        <Text style={styles.websiteDescription}>
          {tw(index, "description")}
        </Text>
        <View style={styles.visitButton}>
          <Text style={styles.visitButtonText}>{tw(index, "visitSite")}</Text>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

// 2. FeatureCard Component (UPDATED)
const FeatureCard = ({ item, tf, router, onPress }) => {
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    if (onPress) {
      onPress(item);
    } else if (router && item.page) {
      router.push(item.page);
    }
  };

  return (
    <Animated.View
      style={[
        styles.categoryCardContainer,
        {
          opacity: cardAnim,
          transform: [
            {
              scale: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity style={styles.categoryCard} onPress={handlePress}>
        <View
          style={[styles.categoryIcon, { backgroundColor: `${item.color}20` }]}
        >
          {/* RENDER IMAGE INSTEAD OF EMOJI TEXT */}
          <Image 
            source={item.icon} 
            style={styles.categoryImage} 
            resizeMode="contain" 
          />
        </View>
        <Text style={styles.categoryTitle}>
          {tf ? tf(item.page) : item.title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// 3. NewsCard Component
const NewsCard = ({ item, t }) => {
  const newsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(newsAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: newsAnim,
        transform: [
          {
            translateY: newsAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        style={styles.newsCard}
        onPress={() =>
          Linking.openURL(item.url).catch((err) =>
            console.error("Couldn't load page", err)
          )
        }
      >
        <View style={styles.newsImageContainer}>
          <Image
            source={
              typeof item.image === "string" ? { uri: item.image } : item.image
            }
            style={styles.newsImage}
            defaultSource={require("../assets/images/news.jpg")}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.newsImageGradient}
          />
        </View>
        <View style={styles.newsContent}>
          <View style={styles.newsHeader}>
            <View style={styles.newsBadge}>
              <Text style={styles.newsBadgeText}>{t("newsBadge")}</Text>
            </View>
            <Text style={styles.newsDate}>
              {new Date(item.publishedAt || Date.now()).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.newsTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.newsSubtitle} numberOfLines={3}>
            {item.subtitle}
          </Text>
          <View style={styles.readMoreContainer}>
            <Text style={styles.readMoreText}>{t("readMore")}</Text>
            <Ionicons name="arrow-forward" size={14} color="#3B82F6" />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ====================================================================================
// Main Home Screen Component
// ====================================================================================

const GroundwaterHome = () => {
  const router = useRouter();
  const [waterNews, setWaterNews] = useState([]);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [currentHeaderIndex, setCurrentHeaderIndex] = useState(0);
  const [language, setLanguage] = useState("en");
  const scrollX = useRef(new Animated.Value(0)).current;
  const headerTextAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Array of local news image paths to use as placeholders
  const newsPlaceholders = [
    require("../assets/images/news2.jpg"),
    require("../assets/images/news.jpg"),
    require("../assets/images/news3.jpg"),
    require("../assets/images/news4.jpg"),
  ];

  // Translations Data (omitted for brevity, unchanged)
  const translations = {
    en: {
      appName: "HydroSense",
      heroTitles: [
        "Real-time Groundwater Resource Evaluation",
        "Advanced Analytics for Water Management",
        "AI-Powered Predictive Insights",
        "Comprehensive Monitoring Solutions",
      ],
      heroSubtitle: "Monitor • Analyze • Predict • Conserve",
      statWells: "Wells Monitored",
      statRealtime: "Real-time Data",
      sectionResourcesTitle: "Data Suppliers (Central Agencies)",
      sectionResourcesSubtitle:
        "Explore official portals and data repositories",
      exploreAll: "Explore All Resources",
      sectionFeaturesTitle: "Features",
      sectionFeaturesSubtitle: "Comprehensive groundwater management tools",
      sectionNewsTitle: "Water News Updates",
      sectionNewsSubtitle: "Latest developments in water management",
      newsBadge: "LATEST",
      readMore: "Read Full Article",
      sectionAboutTitle: "About the App",
      seeAll: "See All",
      about: "About",
      statistics: "Statistics",
      getStarted: "Get Started",
      modalTitle: "CGWB Related Resources",
      visitSite: "Visit Site",
      features: {
        dashboard: "Dashboard",
        mapview: "Map View",
        rechargepattern: "Recharge Pattern",
        reportgeneration: "Report Generation",
        comparison: "Comparison Page",
        alerts: "Alert Page",
        anomalydetection: "Anomaly Detection",
        chatbot: "Chat Bot / AI",
      },
      featuresDescriptions: {
        dashboard: "Central hub for all key metrics and quick insights.",
        mapview: "Interactive maps showing groundwater levels across regions.",
        rechargepattern: "Analyze historical and predicted recharge patterns.",
        reportgeneration: "Generate customizable reports on groundwater data.",
        comparison: "Compare data across different time periods or locations.",
        alerts: "Receive notifications for critical changes in water levels.",
        anomalydetection: "Detect unusual patterns in groundwater data.",
        chatbot: "AI assistant for queries and guidance.",
      },
      websites: [
        {
          title: "CGWB Official Website",
          description:
            "Central Ground Water Board - Official portal for groundwater data and policies",
          category: "Government Portal",
        },
        {
          title: "Ministry of Jal Shakti",
          description:
            "Leading India's water security initiatives and sustainable water management",
          category: "Ministry",
        },
        {
          title: "India Water Portal",
          description:
            "Comprehensive water resource information and community knowledge platform",
          category: "Information Portal",
        },
        {
          title: "Groundwater Data Repository",
          description:
            "Access comprehensive groundwater monitoring data and analytical tools",
          category: "Data Repository",
        },
        {
          title: "Water Quality Portal",
          description:
            "Real-time water quality monitoring and assessment platform",
          category: "Quality Assessment",
        },
        {
          title: "Rainwater Harvesting Portal",
          description:
            "Guidelines and best practices for rainwater harvesting systems",
          category: "Harvesting Solutions",
        },
      ],
    },
    hi: {
      appName: "भूजल समीक्षा",
      heroTitles: [
        "वास्तविक समय भूजल संसाधन मूल्यांकन",
        "जल प्रबंधन के लिए उन्नत विश्लेषण",
        "एआई-संचालित पूर्वानुमान अंतर्दृष्टि",
        "व्यापक निगरानी समाधान",
      ],
      heroSubtitle: "निगरानी • विश्लेषण • पूर्वानुमान • संरक्षण",
      statWells: "कुओं की निगरानी",
      statRealtime: "वास्तविक समय डेटा",
      sectionResourcesTitle: "डेटा आपूर्तिकर्ता (केंद्रीय एजेंसियां)",
      sectionResourcesSubtitle:
        "आधिकारिक पोर्टल और डेटा रिपॉजिटरी का अन्वेषण करें",
      exploreAll: "सभी संसाधन अन्वेषण करें",
      sectionFeaturesTitle: "विशेषताएं",
      sectionFeaturesSubtitle: "व्यापक भूजल प्रबंधन उपकरण",
      sectionNewsTitle: "जल समाचार अपडेट",
      sectionNewsSubtitle: "जल प्रबंधन में नवीनतम विकास",
      newsBadge: "नवीनतम",
      readMore: "पूर्ण लेख पढ़ें",
      sectionAboutTitle: "ऐप के बारे में",
      seeAll: "सभी देखें",
      about: "के बारे में",
      statistics: "आंकड़े",
      getStarted: "शुरू करें",
      modalTitle: "सीजीडब्ल्यूबी संबंधित संसाधन",
      visitSite: "साइट पर जाएं",
      features: {
        dashboard: "डैशबोर्ड",
        mapview: "मानचित्र दृश्य",
        rechargepattern: "रिचार्ज पैटर्न",
        reportgeneration: "रिपोर्ट जनरेशन",
        comparison: "तुलना पेज",
        alerts: "अलर्ट पेज",
        anomalydetection: "असामान्यता पहचान पेज",
        chatbot: "चैट बॉट / एआई",
      },
      featuresDescriptions: {
        dashboard:
          "सभी प्रमुख मीट्रिक्स और त्वरित अंतर्दृष्टि के लिए केंद्रीय हब।",
        mapview: "क्षेत्रों में भूजल स्तर दिखाने वाले इंटरैक्टिव मानचित्र।",
        rechargepattern:
          "ऐतिहासिक और पूर्वानुमानित रिचार्ज पैटर्न का विश्लेषण।",
        reportgeneration: "भूजल डेटा पर अनुकूलन योग्य रिपोर्ट जनरेट करें।",
        comparison: "विभिन्न समय अवधियों या स्थानों में डेटा की तुलना।",
        alerts:
          "जल स्तरों में महत्वपूर्ण परिवर्तनों के लिए अधिसूचनाएं प्राप्त करें।",
        anomalydetection: "भूजल डेटा में असामान्य पैटर्न का पता लगाएं।",
        chatbot: "प्रश्नों और मार्गदर्शन के लिए एआई सहायक।",
      },
      websites: [
        {
          title: "सीजीडब्ल्यूबी आधिकारिक वेबसाइट",
          description: "केंद्रीय भूजल बोर्ड - भूजल डेटा और नीतियों के लिए आधिकारिक पोर्टल",
          category: "सरकारी पोर्टल",
        },
        {
          title: "जल शक्ति मंत्रालय",
          description: "भारत की जल सुरक्षा पहल और सतत जल प्रबंधन का नेतृत्व",
          category: "मंत्रालय",
        },
        {
          title: "भारत जल पोर्टल",
          description: "व्यापक जल संसाधन जानकारी और सामुदायिक ज्ञान प्लेटफॉर्म",
          category: "सूचना पोर्टल",
        },
        {
          title: "भूजल डेटा रिपॉजिटरी",
          description: "व्यापक भूजल निगरानी डेटा और विश्लेषणात्मक उपकरणों तक पहुंच",
          category: "डेटा रिपॉजिटरी",
        },
        {
          title: "जल गुणवत्ता पोर्टल",
          description: "वास्तविक समय जल गुणवत्ता निगरानी और मूल्यांकन प्लेटफॉर्म",
          category: "गुणवत्ता मूल्यांकन",
        },
        {
          title: "वर्षा जल संचयन पोर्टल",
          description: "वर्षा जल संचयन प्रणालियों के लिए दिशानिर्देश और सर्वोत्तम अभ्यास",
          category: "संचयन समाधान",
        },
      ],
    },
  };
  const t = (key) => translations[language][key] || key;
  const tf = (id) => translations[language].features[id] || id;
  const tw = (index, field) => translations[language].websites[index][field];

  // Static Data
  const websiteShowcase = [
    {
      id: "1",
      url: "https://cgwb.gov.in",
      logoUri: "https://cgwb.gov.in/images/logo.png",
      bannerUri: require("../assets/images/cgwb.png"),
    },
    {
      id: "2",
      url: "https://jalshakti.gov.in",
      logoUri:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Ministry_of_Jal_Shakti.svg/800px-Ministry_of_Jal_Shakti.svg.png",
      bannerUri: require("../assets/images/jal.png"),
    },
    {
      id: "3",
      url: "https://www.indiawaterportal.org",
      logoUri: "https://www.indiawaterportal.org/sites/default/files/logo.png",
      bannerUri: require("../assets/images/indianwaterportal.jpg"),
    },
    {
      id: "4",
      url: "https://gwdata.cgwb.gov.in/",
      logoUri: "https://www.freeiconspng.com/uploads/data-icon-png-8.png",
      bannerUri: require("../assets/images/misistryofjal.jpg"),
    },
    {
      id: "5",
      url: "https://cpcb.nic.in/water-quality-monitoring/",
      logoUri: "https://cdn-icons-png.flaticon.com/512/3531/3531234.png",
    },
    {
      id: "6",
      url: "https://www.india.gov.in/guide-lines-rain-water-harvesting",
      logoUri: "https://cdn-icons-png.flaticon.com/512/2446/2446376.png",
    },
  ];
  
  // UPDATED: Features data using local PNG assets
  const features = [
    {
      id: "1",
      title: "Dashboard",
      icon: require("../assets/images/dashboard.png"),
      color: "#6366F1",
      page: "dashboard",
    },
    {
      id: "2",
      title: "Map View",
      icon: require("../assets/images/map.png"),
      color: "#F59E0B",
      page: "mapview",
    },
    {
      id: "3",
      title: "Recharge Pattern",
      icon: require("../assets/images/rechargeable.png"),
      color: "#3B82F6",
      page: "rechargepattern",
    },
    {
      id: "4",
      title: "Report Generation",
      icon: require("../assets/images/report.png"),
      color: "#06B6D4",
      page: "reportgeneration",
    },
    {
      id: "5",
      title: "Comparison Page",
      icon: require("../assets/images/comparision.png"),
      color: "#10B981",
      page: "comparison",
    },
    {
      id: "6",
      title: "Alert Page",
      icon: require("../assets/images/message.png"),
      color: "#F59E0B",
      page: "alerts",
    },
    {
      id: "7",
      title: "Chat Bot / AI",
      icon: require("../assets/images/chatbot.png"),
      color: "#DC2626",
      page: "chatbot",
    },
    {
      id: "8",
      title: "Anomaly Detection Page",
      icon: require("../assets/images/exception (1).png"),
      color: "#059669",
      page: "anomalydetection",
    },
    {
      id: "9",
      title: "Raise Complaint",
      icon: require("../assets/images/jal.png"),
      color: "#059669",
      page: "Raise Complaint",
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeaderIndex((prev) => (prev + 1) % t("heroTitles").length);
    }, 4000);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const fetchNews = async () => {
      const API_PROXY_URL =
        "https://news.google.com/rss/search?q=groundwater+india+when:7d&hl=en-IN&gl=IN&ceid=IN:en";

      try {
        const response = await fetch(API_PROXY_URL);
        if (!response.ok) throw new Error("Network response was not ok.");
        const xml = await response.text();
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@_",
        });
        const result = parser.parse(xml);
        // Ensure result and channel exist before slicing
        const items = result.rss?.channel?.item?.slice(0, 8) || [];
        
        const news = items.map((item, index) => {
          // FIX: Use a cycling local placeholder image based on the item index
          const placeholderIndex = index % newsPlaceholders.length;
          const image = newsPlaceholders[placeholderIndex];
          
          const subtitle =
            item.description
              ?.replace(/<[^>]*>/g, "")
              .replace(/\s+/g, " ")
              .trim()
              .substring(0, 120) + "...";
              
          return {
            id: index.toString(),
            title: item.title,
            subtitle,
            image: image, // Assigned local require path (guaranteed to work)
            url: item.link,
            publishedAt: item.pubDate,
          };
        });
        setWaterNews(news);
      } catch (error) {
        console.error("Error fetching news:", error);
        // Fallback Data
        setWaterNews([
          {
            id: "1",
            title: "Groundwater Levels Rise in Key Areas",
            subtitle: "Recent monsoon rains have boosted groundwater recharge.",
            url: "#",
            publishedAt: "2025-09-25",
            image: newsPlaceholders[0],
          },
          {
            id: "2",
            title: "New Water Conservation Initiative",
            subtitle: "Government launches program for rural and urban areas.",
            url: "#",
            publishedAt: "2025-09-24",
            image: newsPlaceholders[1],
          },
          {
            id: "3",
            title: "Advancements in Water Purification",
            subtitle: "New technologies improve access to clean water.",
            url: "#",
            publishedAt: "2025-09-23",
            image: newsPlaceholders[2],
          },
          {
            id: "4",
            title: "Drought Mitigation Strategies",
            subtitle: "Experts share tips on managing water during dry spells.",
            url: "#",
            publishedAt: "2025-09-22",
            image: newsPlaceholders[3],
          },
        ]);
      }
    };

    fetchNews();
    return () => clearInterval(interval);
  }, [language]);

  const ResourcesModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showResourcesModal}
      onRequestClose={() => setShowResourcesModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t("modalTitle")}</Text>
            <TouchableOpacity onPress={() => setShowResourcesModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={websiteShowcase}
            renderItem={({ item, index }) => (
              <WebsiteCard item={item} index={index} tw={tw} />
            )}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalList}
          />
        </View>
      </View>
    </Modal>
  );

  const handleProfile = () => router.push("profile");
  const handleLanguage = () => setLanguage(language === "en" ? "hi" : "en");
  const handleSearch = () => router.push("search");
  const handleGetStarted = () => router.push("/featuresoverview");

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
      >
        <LinearGradient
          colors={["#004e92", "#00c5ff"]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <View style={styles.ourLogo}>
                  <Image
                    source={require("../assets/images/jal.png")}
                    style={{ width: 90, height: 50 }}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.appName}>{t("appName")}</Text>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleProfile}
                >
                  <Ionicons
                    name="person-circle-outline"
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleLanguage}
                >
                  <Ionicons name="language" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleSearch}
                >
                  <Ionicons name="search" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.heroSection}>
              <View style={styles.heroContent}>
                <Animated.View>
                  <Text style={styles.heroTitle}>
                    {t("heroTitles")[currentHeaderIndex]}
                  </Text>
                </Animated.View>
                <Text style={styles.heroSubtitle}>{t("heroSubtitle")}</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>5000+</Text>
                    <Text style={styles.statLabel}>{t("statWells")}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>24/7</Text>
                    <Text style={styles.statLabel}>{t("statRealtime")}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.heroImage}>
                <Image
                  source={require("../assets/images/bhujal_samiksha_logo.png")}
                  style={{ width: 120, height: 150 }}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={styles.pagination}>
              {t("heroTitles").map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentHeaderIndex ? styles.activeDot : null,
                  ]}
                />
              ))}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("sectionResourcesTitle")}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {t("sectionResourcesSubtitle")}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {websiteShowcase.slice(0, 3).map((item, index) => (
              <WebsiteCard key={item.id} item={item} index={index} tw={tw} />
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => setShowResourcesModal(true)}
          >
            <Text style={styles.exploreText}>{t("exploreAll")}</Text>
            <Ionicons name="arrow-forward" size={16} color="#6366F1" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("sectionFeaturesTitle")}</Text>
            <Text style={styles.sectionSubtitle}>
              {t("sectionFeaturesSubtitle")}
            </Text>
          </View>
          <View style={styles.categoriesGrid}>
            {features.map((item) => (
              <FeatureCard key={item.id} item={item} tf={tf} router={router} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("sectionNewsTitle")}</Text>
            <Text style={styles.sectionSubtitle}>
              {t("sectionNewsSubtitle")}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {waterNews.map((item) => (
              <NewsCard key={item.id} item={item} t={t} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.aboutHeader}>
            <Text style={styles.sectionTitle}>{t("sectionAboutTitle")}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>{t("seeAll")}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.aboutCards}>
            <TouchableOpacity style={styles.aboutCard}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#6366F1"
              />
              <Text style={styles.aboutCardText}>{t("about")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.aboutCard}>
              <Ionicons name="stats-chart" size={24} color="#6366F1" />
              <Text style={styles.aboutCardText}>{t("statistics")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              style={styles.getStartedGradient}
            >
              <Text style={styles.getStartedText}>{t("getStarted")}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      <ResourcesModal />
    </SafeAreaView>
  );
};

// Styles (UPDATED)
const styles = StyleSheet.create({
  // General Styles
  container: { flex: 1, backgroundColor: "#F8FAFC", marginBottom:40 }, 
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  sectionSubtitle: { fontSize: 13, color: "#6B7280" },
  horizontalScroll: { marginBottom: 12 },

  // Header Styles
  header: { paddingTop: 20, paddingBottom: 20, paddingHorizontal: 20 }, 
  headerContent: { flex: 1 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 35, 
    marginBottom: 20,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  ourLogo: {
    width: 100,
    height: 50,
    backgroundColor: "white",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: { fontSize: 20, fontWeight: "bold", color: "white" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  headerButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  // Hero Section Styles
  heroSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  heroContent: { flex: 1 },
  heroTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 6,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 12,
  },
  statsContainer: { flexDirection: "row", marginTop: 8 },
  statItem: { marginRight: 20 },
  statValue: { fontSize: 18, fontWeight: "bold", color: "white" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.8)" },
  heroImage: { marginLeft: 16 },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 4,
  },
  activeDot: { backgroundColor: "white", width: 24 },

  // Website Card Styles
  enhancedWebsiteCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginRight: 16,
    width: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  websiteBanner: { position: "relative", height: 180 },
  bannerImage: { width: "100%", height: "100%", resizeMode: "contain" },
  bannerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  websiteCardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    justifyContent: "flex-end",
    flex: 1,
  },
  websiteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  websiteDescription: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 10,
    lineHeight: 16,
  },
  visitButton: { flexDirection: "row", alignItems: "center" },
  visitButtonText: {
    color: "white",
    fontWeight: "600",
    marginRight: 6,
    fontSize: 13,
  },

  // Explore Button
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#6366F1",
  },
  exploreText: {
    color: "#6366F1",
    fontWeight: "600",
    marginRight: 6,
    fontSize: 15,
  },

  // Feature Grid Styles (UPDATED)
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",

  },
  categoryCardContainer: { width: "31%", marginBottom: 10 },
  categoryCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 100,
  },
  categoryIcon: {
    width: 50, // Slightly increased size for the container
    height: 50, // Slightly increased size for the container
    borderRadius: 22, // Half of size to keep it circular
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    marginTop: 5,
  },
  categoryImage: { // NEW STYLE for custom PNG
    width: 32,  
    height: 32,
    // Add tintColor if your icons are single-color vectors that you want to style:
    // tintColor: '#374151',
  },
  categoryTitle: {
    fontSize: 13, // Increased font size
    textAlign: "center",
    color: "#374151",
    fontWeight: "500",
  },

  // News Card Styles
  newsCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginRight: 16,
    width: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  newsImageContainer: { position: "relative", height: 100 },
  newsImage: { width: "100%", height: "100%", resizeMode: "cover" },
  newsImageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  newsContent: { padding: 10 },
  newsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  newsBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newsBadgeText: { color: "white", fontSize: 9, fontWeight: "bold" },
  newsDate: { fontSize: 9, color: "#6B7280" },
  newsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
    lineHeight: 18,
  },
  newsSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 15,
    marginBottom: 8,
  },
  readMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  readMoreText: {
    color: "#3B82F6",
    fontWeight: "600",
    marginRight: 4,
    fontSize: 12,
  },

  // About Section
  aboutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAllText: { color: "#6366F1", fontWeight: "600", fontSize: 14 },
  aboutCards: { flexDirection: "row", justifyContent: "space-between" },
  aboutCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  aboutCardText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },

  // Get Started Button
  buttonContainer: { paddingHorizontal: 20, paddingVertical: 20 },
  getStartedButton: { borderRadius: 30 },
  getStartedGradient: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 30, 
  },
  getStartedText: { color: "white", fontSize: 15, fontWeight: "bold" },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
  modalList: { paddingHorizontal: 20, paddingTop: 20 },
});

export default GroundwaterHome;

// ... (FeaturesOverview component remains unchanged)