import {
  Feather,
  Ionicons,
  MaterialCommunityIcons
} from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingOverlay from '../../components/LoadingOverlay';
import RecognitionSuccessResult from '../../components/RecognitionSuccessResult';
import { recognizeFace } from '../../services/lambdaService';
import { Student } from '../../types';

// --- Configuration ---
const { width } = Dimensions.get('window');

// --- Colors ---
const COLORS = {
  green50: '#f0fdf4',
  green100: '#dcfce7',
  green400: '#4ade80',
  green500: '#22c55e',
  green600: '#16a34a',
  blue50: '#eff6ff',
  blue100: '#dbeafe',
  blue200: '#bfdbfe',
  blue400: '#60a5fa',
  blue600: '#2563eb',
  yellow50: '#fefce8',
  yellow200: '#fef08a',
  yellow300: '#fde047',
  yellow400: '#facc15',
  yellow700: '#a16207',
  orange400: '#fb923c',
  pink200: '#fbcfe8',
  pink500: '#ec4899',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
  white: '#ffffff',
  bgMain: '#F0F9FF',
};

export default function HomeScreen() {
  const [time, setTime] = useState(new Date());
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [showMascotTip, setShowMascotTip] = useState(true);
  const [recognizedStudent, setRecognizedStudent] = useState<Student | null>(null);
  const [confidenceInfo, setConfidenceInfo] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState('');

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // Animation values
  const wiggleVal = useSharedValue(0);
  const pulseVal = useSharedValue(1);
  const bounceVal = useSharedValue(0);
  const scanVal = useSharedValue(0);
  const spinVal = useSharedValue(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);

    // Start ambient animations
    wiggleVal.value = withRepeat(withSequence(
      withTiming(-5, { duration: 1000 }),
      withTiming(5, { duration: 1000 })
    ), -1, true);

    pulseVal.value = withRepeat(withSequence(
      withTiming(0.5, { duration: 1000 }),
      withTiming(1, { duration: 1000 })
    ), -1, true);

    bounceVal.value = withRepeat(withSequence(
      withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
    ), -1, true);

    spinVal.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const handleSnap = async () => {
    if (!cameraRef.current) return;

    try {
      setStatus('scanning');

      // Scan animation (fast spin and scan line)
      scanVal.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );

      // Take picture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        skipProcessing: false,
      });

      if (photo?.uri) {
        // Send to recognition service
        const recognition = await recognizeFace(photo.uri);

        scanVal.value = 0; // Stop scan animation

        if (recognition.success && recognition.recognized && recognition.studentId) {
          const conf = recognition.confidence || 0;
          setConfidenceInfo(conf);

          // Mock student data lookup
          const MOCK_STUDENTS: { [key: string]: string } = {
            '1': 'Nisal Weerarathne',
            '2': 'Lakshan Chathuranga'
          };

          const studentName = MOCK_STUDENTS[recognition.studentId] || 'Student ' + recognition.studentId;

          const studentData: Student = {
            studentId: recognition.studentId,
            studentName: studentName,
            instituteId: 'default'
          };

          setRecognizedStudent(studentData);
          setStatus('success');
          Vibration.vibrate(100);

        } else {
          setErrorMessage(recognition.message || 'Face not recognized');
          setStatus('error');
          setTimeout(() => setStatus('idle'), 3000);
        }
      }
    } catch (error) {
      console.error('Snap error:', error);
      scanVal.value = 0;
      setErrorMessage('An error occurred during recognition');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  // --- Animated Styles ---
  const wiggleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wiggleVal.value}deg` }]
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseVal.value
  }));

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounceVal.value }]
  }));

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinVal.value}deg` }]
  }));

  const fastSpinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinVal.value * 6}deg` }] // Faster spin
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    top: `${scanVal.value * 100}%`,
    opacity: status === 'scanning' ? 1 : 0
  }));

  // --- Render Success Screen ---
  if (status === 'success' && recognizedStudent) {
    return (
      <RecognitionSuccessResult
        student={recognizedStudent}
        confidence={confidenceInfo}
        onDismiss={() => {
          setStatus('idle');
          setRecognizedStudent(null);
        }}
      />
    );
  }

  // --- Render Main Screen ---
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Loading Overlay */}
      {status === 'scanning' && (
        <LoadingOverlay visible={true} message="Finding your smile..." />
      )}

      {/* Background Elements */}
      <Animated.View style={[styles.bgCloud, bounceStyle]}>
        <Ionicons name="cloud" size={64} color={COLORS.blue200} />
      </Animated.View>
      <Animated.View style={[styles.bgSun, pulseStyle]}>
        <Ionicons name="sunny" size={80} color={COLORS.yellow300} />
      </Animated.View>

      {/* Particles */}
      <Animated.View style={[styles.particleStar1, spinStyle]}>
        <Ionicons name="star" size={24} color={COLORS.yellow200} />
      </Animated.View>
      <Animated.View style={[styles.particleHeart, bounceStyle]}>
        <Ionicons name="heart" size={20} color={COLORS.pink200} />
      </Animated.View>
      <Animated.View style={[styles.particleStar2, pulseStyle]}>
        <Ionicons name="star" size={16} color={COLORS.blue200} />
      </Animated.View>

      {/* Main Scroll Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Animated.View style={[styles.logoBox, wiggleStyle]}>
              <MaterialCommunityIcons name="school" size={32} color="white" />
            </Animated.View>
            <View>
              <Text style={styles.appTitle}>INFINITE MINDS</Text>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Ready to Play!</Text>
              </View>
            </View>
          </View>
          <View style={styles.timeBlock}>
            <Text style={styles.timeValue}>{formatTime(time)}</Text>
            <Text style={styles.dateValue}>{formatDate(time)}</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>

          {/* Welcome */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Hiya, Superstar! 🌟</Text>
            <Text style={styles.welcomeSubtitle}>Let's find your smile today!</Text>
          </View>

          {/* Mascot */}
          <View style={styles.mascotContainer}>
            {showMascotTip && (
              <Animated.View entering={FadeIn.delay(300)} style={[styles.mascotTooltip, bounceStyle]}>
                <Text style={styles.tooltipText}>Peek into the Magic Mirror, friend!</Text>
                <View style={styles.tooltipArrow} />
              </Animated.View>
            )}
            <TouchableOpacity
              onPress={() => setShowMascotTip(!showMascotTip)}
              activeOpacity={0.9}
            >
              <Animated.View style={[styles.mascotCircle, wiggleStyle]}>
                <MaterialCommunityIcons name="bird" size={48} color="white" />
                <View style={styles.mascotBadge}>
                  <Feather name="smile" size={12} color="white" />
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Magic Mirror (Camera) with Integrated Button */}
          <View style={styles.mirrorContainer}>
            <View style={styles.mirrorGlow} />

            <View style={styles.mirrorFrame}>

              {permission?.granted ? (
                <CameraView
                  style={StyleSheet.absoluteFill}
                  facing="front"
                  ref={cameraRef}
                />
              ) : (
                <LinearGradient
                  colors={[COLORS.slate800, COLORS.slate900]}
                  style={styles.mirrorInner}
                >
                  <View style={styles.placeholderContent}>
                    <TouchableOpacity onPress={requestPermission} style={{ alignItems: 'center' }}>
                      <View style={styles.cameraIconCircle}>
                        <Feather name="camera-off" size={40} color={COLORS.slate500} />
                      </View>
                      <Text style={styles.mirrorText}>Tap to Enable</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              )}

              {/* Overlays */}
              <View style={styles.overlayContainer} pointerEvents="none">
                <Animated.View style={[styles.dashedCircle, status === 'scanning' ? fastSpinStyle : spinStyle]} />
                <Animated.View style={[styles.scanLine, scanLineStyle]} />
              </View>

              {/* Decorative Corners */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />

            </View>

            {/* Action Button (Below Camera Frame) */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                onPress={handleSnap}
                disabled={status === 'scanning' || !permission?.granted}
                activeOpacity={0.8}
                style={[styles.snapButton, (status === 'scanning' || !permission?.granted) && styles.snapButtonDisabled]}
              >
                <LinearGradient
                  colors={[COLORS.blue400, COLORS.blue600]}
                  style={styles.snapButtonGradient}
                >
                  <Feather name="smile" size={28} color="white" />
                  <Text style={styles.snapButtonText}>SNAP MY PHOTO!</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </View>

          <TouchableOpacity style={styles.helpLink}>
            <Feather name="help-circle" size={18} color={COLORS.slate400} />
            <Text style={styles.helpLinkText}>Teacher, I need help!</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding for bottom navigation
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    zIndex: 10,
  },

  // Background Elements
  bgCloud: { position: 'absolute', top: 40, left: 40, opacity: 0.8 },
  bgSun: { position: 'absolute', top: 80, right: 40, opacity: 0.8 },
  particleStar1: { position: 'absolute', top: '15%', left: 20, opacity: 0.5 },
  particleHeart: { position: 'absolute', top: '20%', right: 32, opacity: 0.5 },
  particleStar2: { position: 'absolute', bottom: '30%', left: 40, opacity: 0.5 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 24,
    marginBottom: 20,
    width: '100%',
    zIndex: 20,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox: {
    width: 56, height: 56, backgroundColor: COLORS.orange400,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: 'white',
    shadowColor: COLORS.orange400, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  appTitle: { fontSize: 20, fontWeight: '900', color: COLORS.slate800, letterSpacing: -0.5 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statusDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.green400, borderWidth: 2, borderColor: 'white' },
  statusText: { fontSize: 10, fontWeight: '700', color: COLORS.green600, textTransform: 'uppercase', letterSpacing: 1 },
  timeBlock: { alignItems: 'flex-end' },
  timeValue: { fontSize: 24, fontWeight: '900', color: COLORS.slate800 },
  dateValue: { fontSize: 10, fontWeight: '700', color: COLORS.slate400, textTransform: 'uppercase', marginTop: 2 },

  // Welcome
  welcomeSection: { alignItems: 'center', marginBottom: 16 },
  welcomeTitle: { fontSize: 28, fontWeight: '900', color: COLORS.slate800, marginBottom: 4 },
  welcomeSubtitle: { fontSize: 14, fontWeight: '700', color: COLORS.slate500 },

  // Mascot
  mascotContainer: { alignItems: 'center', alignSelf: 'flex-end', marginRight: 30, marginBottom: 16, zIndex: 20 },
  mascotTooltip: {
    position: 'absolute', top: -50, backgroundColor: 'white', padding: 12,
    borderRadius: 20, borderWidth: 2, borderColor: COLORS.blue100,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  tooltipText: { fontSize: 11, fontWeight: '900', color: COLORS.blue600, textAlign: 'center' },
  tooltipArrow: {
    position: 'absolute', bottom: -8, left: 20, width: 16, height: 16,
    backgroundColor: 'white', borderBottomWidth: 2, borderRightWidth: 2,
    borderColor: COLORS.blue100, transform: [{ rotate: '45deg' }]
  },
  mascotCircle: {
    backgroundColor: COLORS.yellow400, padding: 12, borderRadius: 999,
    borderWidth: 4, borderColor: 'white',
    shadowColor: COLORS.yellow400, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8
  },
  mascotBadge: {
    position: 'absolute', bottom: -4, right: -4, backgroundColor: COLORS.pink500,
    padding: 6, borderRadius: 999, borderWidth: 2, borderColor: 'white'
  },

  // Mirror
  mirrorContainer: { position: 'relative', alignItems: 'center', marginBottom: 16 },
  mirrorGlow: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    bottom: 60, // Reduces height from bottom
    backgroundColor: COLORS.blue400,
    borderRadius: 50,
    opacity: 0.2,
    transform: [{ scale: 1.05 }]
  },
  mirrorFrame: {
    width: width - 48,
    height: (width - 48) * 1.2, // Portrait size - taller than wide
    maxWidth: 350, maxHeight: 420,
    backgroundColor: COLORS.slate900, borderRadius: 48,
    borderWidth: 12, borderColor: 'white',
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
    elevation: 10
  },
  mirrorInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderContent: { alignItems: 'center' },
  cameraIconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.slate700,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    borderWidth: 4, borderColor: COLORS.slate600
  },
  mirrorText: { fontSize: 10, fontWeight: '900', color: COLORS.slate400, textTransform: 'uppercase', letterSpacing: 1.5 },

  overlayContainer: { ...StyleSheet.absoluteFillObject, padding: 40, pointerEvents: 'none' },
  dashedCircle: {
    flex: 1, borderWidth: 4, borderColor: 'rgba(96, 165, 250, 0.3)',
    borderRadius: 999, borderStyle: 'dashed'
  },
  scanLine: {
    position: 'absolute', left: 0, right: 0, height: 8,
    backgroundColor: COLORS.blue400, opacity: 0.5,
    shadowColor: COLORS.blue400, shadowOpacity: 1, shadowRadius: 20
  },

  corner: { position: 'absolute', width: 40, height: 40, borderColor: COLORS.yellow400 },
  cornerTL: { top: 20, left: 20, borderTopWidth: 8, borderLeftWidth: 8, borderTopLeftRadius: 16 },
  cornerTR: { top: 20, right: 20, borderTopWidth: 8, borderRightWidth: 8, borderTopRightRadius: 16 },
  cornerBL: { bottom: 20, left: 20, borderBottomWidth: 8, borderLeftWidth: 8, borderBottomLeftRadius: 16 },
  cornerBR: { bottom: 20, right: 20, borderBottomWidth: 8, borderRightWidth: 8, borderBottomRightRadius: 16 },

  // Camera Controls (Inside Frame) - REMOVED
  /*
  cameraControls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  shutterButtonOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.blue600,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  shutterSpinner: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 3,
    borderColor: COLORS.blue400, borderTopColor: COLORS.blue600
  },
  */

  simpleStatus: { marginTop: 8, marginBottom: 8 },
  simpleStatusText: { fontSize: 12, fontWeight: '700', color: COLORS.slate400, textTransform: 'uppercase', letterSpacing: 1 },

  // Action Button (Below Camera Frame, Inside Mirror Container)
  actionContainer: {
    width: '100%',
    marginTop: 50, // Gap between camera and button
    marginBottom: -200, // Negative margin to eliminate space below button
    paddingHorizontal: 0,
    alignItems: 'center',
  },
  snapButton: {
    width: '85%', // Reduced from 100%
    borderRadius: 24,
    shadowColor: COLORS.blue600, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 6, elevation: 8
  },
  snapButtonDisabled: { opacity: 0.5, shadowOpacity: 0.2 },
  snapButtonGradient: {
    paddingVertical: 16, borderRadius: 24, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10
  },
  snapButtonText: { fontSize: 18, fontWeight: '900', color: 'white' },

  helpLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, padding: 8 },
  helpLinkText: { fontSize: 14, fontWeight: '900', color: COLORS.slate400 },
});
