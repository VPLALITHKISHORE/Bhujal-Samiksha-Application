import { GoogleGenerativeAI } from "@google/generative-ai";
import NetInfo from '@react-native-community/netinfo';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BarChart3,
  Droplets,
  MapPin,
  Send,
  TrendingUp,
  User,
  Waves,
  Wifi,
  WifiOff
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// --- TYPE DEFINITIONS ---
export enum ChatRole {
  USER = 'user',
  MODEL = 'model',
}

export interface ChatMessage {
  role: ChatRole;
  text: string;
  timestamp: Date;
  id: string;
  type?: 'info' | 'warning' | 'success' | 'normal';
}

// --- CONSTANTS ---
const SYSTEM_INSTRUCTION = `You are "BHUJAL SAMIKSHA" - a professional groundwater analysis assistant. You are an expert hydrologist and water resource specialist helping with groundwater assessment, monitoring, and management.

IMPORTANT FORMATTING GUIDELINES:
1. Always structure your responses clearly with proper sections
2. Use markdown formatting for better readability:
   - Use ## for main headings
   - Use ### for subheadings  
   - Use **bold** for key terms and important data
   - Use bullet points with • for lists
   - Use numbered lists for step-by-step processes
   - Use --- for visual separators between sections

3. Include relevant data points and metrics when discussing:
   - Groundwater levels (in meters below ground level - mbgl)
   - Recharge rates (mm/year)
   - Water quality parameters (pH, TDS, etc.)
   - Extraction rates (liters/second or cubic meters/day)

4. Always provide structured responses in this format:
   ## [Topic Title]
   
   ### Key Findings
   • Point 1
   • Point 2
   
   ### Analysis
   [Detailed explanation]
   
   ### Recommendations
   1. First recommendation
   2. Second recommendation
   
   ---
   💧 *Professional Groundwater Insight*

Your expertise covers:
- Groundwater level monitoring and trend analysis
- Aquifer characterization and hydrogeology
- Water quality assessment and contamination analysis
- Sustainable groundwater management strategies
- Climate impact on groundwater resources
- Well design and pumping optimization
- Regulatory compliance and environmental impact

Always maintain a professional, scientific tone while being accessible to various stakeholders including engineers, policymakers, and researchers.`;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// --- API SERVICE ---
let genAI: GoogleGenerativeAI | null = null;
let chatInstance: any = null;

// Store API key securely - consider using react-native-keychain or similar
const API_KEY = 'GEMINI_API_KEU'; // Move this to environment variables

const initializeChat = async () => {
  try {
    console.log('Initializing chat...');
    
    if (!genAI) {
      genAI = new GoogleGenerativeAI(API_KEY);
      console.log('GoogleGenerativeAI initialized');
    }

    if (!chatInstance) {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_INSTRUCTION 
      });
      chatInstance = await model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 1500,
          temperature: 0.7,
        },
      });
      console.log('Chat instance created');
    }
    return chatInstance;
  } catch (error) {
    console.error('Error initializing chat:', error);
    throw error;
  }
};

const runChat = async (prompt: string): Promise<string> => {
  try {
    console.log('Sending message:', prompt);
    
    // Check internet connectivity first
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return "## Connection Error\n\n**No internet connection detected.** Please check your network settings and try again.\n\n### Troubleshooting Steps\n• Enable Wi-Fi or mobile data\n• Check network signal strength\n• Restart the application\n• Contact IT support if issue persists\n\n---\n⚠️ *System Status: Offline*";
    }
    
    const chat = await initializeChat();
    const result = await chat.sendMessage(prompt);
    const response = result.response.text();
    console.log('Response received:', response.substring(0, 100) + '...');
    return response;
  } catch (error) {
    console.error("Error running chat:", error);
    
    // More specific error handling
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as any).message;
      
      if (errorMessage.includes('API key')) {
        return "## Authentication Error\n\n**API authentication failed.** Please check your API key configuration.\n\n### Next Steps\n• Verify API key is valid\n• Check API quota and billing\n• Contact system administrator\n\n---\n🔑 *Authentication Required*";
      }
      
      if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        return "## Service Limit\n\n**API quota exceeded.** Please try again later or contact support.\n\n### Information\n• Daily/monthly limits reached\n• Try again after some time\n• Consider upgrading service plan\n\n---\n⏰ *Rate Limited*";
      }
      
      if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('INTERNET_DISCONNECTED')) {
        return "## Network Error\n\n**Connection issue detected.** Please check your internet connection.\n\n### Troubleshooting\n• Verify network connectivity\n• Try switching between Wi-Fi and mobile data\n• Check firewall/proxy settings\n• Restart the application\n\n---\n📡 *Network Issue*";
      }
    }
    
    return "## System Error\n\n**Technical difficulty encountered.** Our groundwater analysis system is temporarily unavailable.\n\n### Support Options\n• Wait a moment and try again\n• Check system status\n• Contact technical support\n• Report this issue\n\n---\n🔧 *System Maintenance*";
  }
};

// --- COMPONENTS ---
const AnimatedMessage: React.FC<{ message: ChatMessage; index: number }> = ({ message, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let key = 0;

    lines.forEach((line, lineIndex) => {
      if (line.trim() === '') {
        elements.push(<View key={key++} style={styles.lineSpacing} />);
        return;
      }

      // Main headings (##)
      if (line.startsWith('## ')) {
        elements.push(
          <Text key={key++} style={styles.mainHeading}>
            {line.substring(3)}
          </Text>
        );
      }
      // Sub headings (###)
      else if (line.startsWith('### ')) {
        elements.push(
          <Text key={key++} style={styles.subHeading}>
            {line.substring(4)}
          </Text>
        );
      }
      // Bullet points
      else if (line.trim().startsWith('• ')) {
        elements.push(
          <View key={key++} style={styles.bulletContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>
              {formatInlineText(line.substring(2))}
            </Text>
          </View>
        );
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(line.trim())) {
        const match = line.match(/^(\d+\.\s)(.*)/);
        if (match) {
          elements.push(
            <View key={key++} style={styles.numberedContainer}>
              <Text style={styles.numberedPoint}>{match[1]}</Text>
              <Text style={styles.numberedText}>
                {formatInlineText(match[2])}
              </Text>
            </View>
          );
        }
      }
      // Separator
      else if (line.trim() === '---') {
        elements.push(
          <View key={key++} style={styles.separator} />
        );
      }
      // Italic emphasis lines
      else if (/^[💧⚠️🔧🌊📊📡🔑⏰]\s\*.*\*$/.test(line.trim())) {
        elements.push(
          <Text key={key++} style={styles.emphasisText}>
            {line.trim()}
          </Text>
        );
      }
      // Regular paragraph
      else if (line.trim()) {
        elements.push(
          <Text key={key++} style={styles.regularText}>
            {formatInlineText(line)}
          </Text>
        );
      }

      // Add spacing after each line except the last
      if (lineIndex < lines.length - 1) {
        elements.push(<View key={key++} style={styles.lineSpacing} />);
      }
    });

    return elements;
  };

  const formatInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    const elements: React.ReactNode[] = [];
    let key = 0;

    parts.forEach((part) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        elements.push(
          <Text key={key++} style={styles.boldText}>
            {part.slice(2, -2)}
          </Text>
        );
      } else if (part) {
        elements.push(
          <Text key={key++} style={styles.inlineText}>
            {part}
          </Text>
        );
      }
    });

    return elements;
  };

  return (
    <Animated.View 
      style={[
        styles.messageContainer,
        message.role === ChatRole.USER ? styles.userMessageContainer : styles.botMessageContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          transform: [{ scale: message.role === ChatRole.USER ? 1 : 0.98 }], // Subtle scale for bot messages
        }
      ]}
    >
      <View style={[
        styles.messageRow,
        message.role === ChatRole.USER ? styles.userMessageRow : styles.botMessageRow
      ]}>
        {message.role === ChatRole.MODEL && (
          <View style={styles.botAvatar}>
            <LinearGradient
              colors={['#0ea5e9', '#0369a1']}
              style={styles.avatarGradient}
            >
              <Droplets color="white" size={18} />
            </LinearGradient>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          message.role === ChatRole.USER ? styles.userBubble : styles.botBubble,
          message.type === 'warning' && styles.warningBubble,
          message.type === 'success' && styles.successBubble,
        ]}>
          {message.role === ChatRole.USER ? (
            <LinearGradient
              colors={['#2563eb', '#1e40af']}
              style={styles.userBubbleGradient}
            >
              <Text style={styles.userMessageText}>{message.text}</Text>
              <View style={styles.userTimestamp}>
                <Text style={styles.timestampText}>{formatTime(message.timestamp)}</Text>
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.botBubbleContainer}>
              <View style={styles.botMessageContent}>
                {renderFormattedText(message.text)}
              </View>
              <View style={styles.botTimestamp}>
                <Text style={styles.timestampText}>{formatTime(message.timestamp)}</Text>
              </View>
            </View>
          )}
        </View>

        {message.role === ChatRole.USER && (
          <View style={styles.userAvatar}>
            <LinearGradient
              colors={['#10b981', '#047857']}
              style={styles.avatarGradient}
            >
              <User color="white" size={18} />
            </LinearGradient>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const TypingIndicator: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      const animations = [dot1, dot2, dot3].map((dot, index) =>
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.loop(
            Animated.sequence([
              Animated.timing(dot, { toValue: 1, duration: 500, useNativeDriver: true }),
              Animated.timing(dot, { toValue: 0.3, duration: 500, useNativeDriver: true }),
            ])
          ),
        ])
      );
      Animated.parallel(animations).start();
    };
    animate();
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.typingContainer}>
      <View style={styles.botAvatar}>
        <LinearGradient colors={['#0ea5e9', '#0369a1']} style={styles.avatarGradient}>
          <Droplets color="white" size={18} />
        </LinearGradient>
      </View>
      <View style={styles.typingBubble}>
        <Text style={styles.typingText}>Analyzing...</Text>
        <View style={styles.typingDots}>
          <Animated.View style={[styles.typingDot, { opacity: dot1 }]} />
          <Animated.View style={[styles.typingDot, { opacity: dot2 }]} />
          <Animated.View style={[styles.typingDot, { opacity: dot3 }]} />
        </View>
      </View>
    </View>
  );
};

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: ChatRole.MODEL,
      text: `## Welcome to BHUJAL SAMIKSHA 💧

### Professional Groundwater Analysis System

I'm your specialized hydrogeological assistant for groundwater resource assessment.

### Core Capabilities
• **Groundwater Level Analysis** - Monitor water table fluctuations
• **Aquifer Assessment** - Evaluate sustainability and properties
• **Water Quality Analysis** - Contamination and treatment assessment
• **Resource Planning** - Management recommendations
• **Climate Impact Studies** - Environmental effects analysis

### Quick Start
Select a category below or describe your groundwater challenge.

---
🌊 *Ready for Analysis*`,
      timestamp: new Date(),
      id: '1',
      type: 'info'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // Network connectivity monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isLoading]);

  const quickQuestions = [
    {
      icon: TrendingUp,
      title: "Level Trends",
      question: "Analyze groundwater level trends and seasonal variations",
      color: '#0ea5e9'
    },
    {
      icon: Waves,
      title: "Aquifer Health", 
      question: "Assess aquifer sustainability and recharge potential",
      color: '#8b5cf6'
    },
    {
      icon: BarChart3,
      title: "Quality Analysis",
      question: "Evaluate groundwater quality and contamination risks",
      color: '#ef4444'
    },
    {
      icon: MapPin,
      title: "Site Assessment",
      question: "Provide site assessment and well placement recommendations",
      color: '#10b981'
    }
  ];

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    if (!isConnected) {
      Alert.alert('No Connection', 'Please check your internet connection.');
      return;
    }

    const userMessage: ChatMessage = {
      role: ChatRole.USER,
      text: inputText.trim(),
      timestamp: new Date(),
      id: `user-${Date.now()}`,
      type: 'normal'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      const response = await runChat(currentInput);
      const botMessage: ChatMessage = {
        role: ChatRole.MODEL,
        text: response,
        timestamp: new Date(),
        id: `bot-${Date.now()}`,
        type: response.includes('Error') ? 'warning' : 'info'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      const errorMessage: ChatMessage = {
        role: ChatRole.MODEL,
        text: "## System Error\n\n**Analysis system temporarily unavailable.** Please try again.\n\n---\n⚠️ *System requires attention*",
        timestamp: new Date(),
        id: `error-${Date.now()}`,
        type: 'warning'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Enhanced Header with Logo */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#1e3a8a', '#1e293b']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Image 
              source={require('../assets/images/WhatsApp Image 2025-09-21 at 22.54.09_d3871fbb.png')} // Placeholder path - replace with your actual logo path
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>BHUJAL SAMIKSHA</Text>
              <Text style={styles.headerSubtitle}>Groundwater Analysis</Text>
            </View>
            <View style={styles.connectionStatus}>
              {isConnected ? (
                <Wifi color="#10b981" size={22} />
              ) : (
                <WifiOff color="#ef4444" size={22} />
              )}
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={Platform.OS === 'android'}
        >
          {messages.map((message, index) => (
            <AnimatedMessage key={message.id} message={message} index={index} />
          ))}
          
          {isLoading && <TypingIndicator />}
          
          {/* Quick Actions - Only show for welcome message */}
          {messages.length === 1 && !isLoading && (
            <View style={styles.quickActionsContainer}>
              <Text style={styles.quickActionsTitle}>Analysis Categories</Text>
              <View style={styles.quickActionsGrid}>
                {quickQuestions.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.quickActionCard, !isConnected && styles.quickActionDisabled]}
                      onPress={() => handleQuickQuestion(item.question)}
                      disabled={!isConnected}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={[item.color + '20', item.color + '10']}
                        style={styles.quickActionIcon}
                      >
                        <IconComponent color={item.color} size={20} />
                      </LinearGradient>
                      <View style={styles.quickActionContent}>
                        <Text style={styles.quickActionTitle}>{item.title}</Text>
                        <Text style={styles.quickActionDescription} numberOfLines={2}>
                          {item.question}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <LinearGradient
            colors={['#1e293b', '#0f172a']}
            style={styles.inputWrapperGradient}
          >
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                placeholder={isConnected ? "Ask about groundwater analysis..." : "No connection..."}
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                editable={!isLoading && isConnected}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isLoading || !isConnected) && styles.sendButtonDisabled
                ]}
                onPress={handleSendMessage}
                disabled={!inputText.trim() || isLoading || !isConnected}
              >
                <LinearGradient
                  colors={['#0ea5e9', '#0369a1']}
                  style={styles.sendButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Send color="white" size={20} />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    backgroundColor: '#1e3a8a',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  headerGradient: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  connectionStatus: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#111827',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 120,
  },
  messageContainer: {
    marginBottom: 20,
    width: '100%',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: screenWidth - 32,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  botMessageRow: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    marginRight: 10,
    marginBottom: 6,
  },
  userAvatar: {
    marginLeft: 10,
    marginBottom: 6,
  },
  avatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  messageBubble: {
    maxWidth: screenWidth - 80,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  botBubble: {
    alignSelf: 'flex-start',
  },
  warningBubble: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  successBubble: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  userBubbleGradient: {
    padding: 16,
    paddingBottom: 10,
    borderBottomRightRadius: 4,
  },
  userMessageText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  userTimestamp: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  botBubbleContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomLeftRadius: 4,
    padding: 16,
    paddingBottom: 10,
  },
  botMessageContent: {
    // Content styling handled by format functions
  },
  botTimestamp: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  timestampText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  // Text formatting styles
  mainHeading: {
    color: '#38bdf8',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 6,
  },
  subHeading: {
    color: '#0ea5e9',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingRight: 12,
  },
  bulletPoint: {
    color: '#0ea5e9',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 2,
  },
  bulletText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  numberedContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingRight: 12,
  },
  numberedPoint: {
    color: '#0ea5e9',
    fontWeight: '600',
    marginRight: 8,
    fontSize: 15,
    lineHeight: 22,
    minWidth: 20,
  },
  numberedText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  regularText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 15,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: '600',
    color: '#38bdf8',
  },
  inlineText: {
    fontSize: 15,
    lineHeight: 22,
  },
  emphasisText: {
    color: '#94a3b8',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 12,
  },
  lineSpacing: {
    height: 6,
  },
  // Typing indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  typingBubble: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 14,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  typingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    marginRight: 10,
    fontWeight: '500',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
    marginHorizontal: 3,
  },
  // Quick actions
  quickActionsContainer: {
    marginTop: 20,
    marginBottom: 32,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  quickActionsTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (screenWidth - 48) / 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionDisabled: {
    opacity: 0.4,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionContent: {
    // No specific styles needed
  },
  quickActionTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  quickActionDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 18,
  },
  // Input area
  inputContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  inputWrapperGradient: {
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    minHeight: 48,
    maxHeight: 140,
    paddingVertical: 14,
    fontWeight: '500',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'transparent',
    opacity: 0.4,
  },
});

export default ChatBot;
