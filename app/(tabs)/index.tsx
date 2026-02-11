import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons
} from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
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
import RecognitionUnknownResult from '../../components/RecognitionUnknownResult';
import { PALETTE } from '../../constants/Colors';
import { recognizeFace } from '../../services/lambdaService';
import { markAttendance } from '../../services/phpService';
import { Student } from '../../types';

// --- Configuration ---
const { width } = Dimensions.get('window');

// --- Playful Colors ---
const COLORS = {
  yellow: '#FCD34D', // Amber 300
  orange: '#fb923c', // Orange 400
  blue: '#60a5fa',   // Blue 400
  blueDark: '#2563eb', // Blue 600
  pink: '#f472b6',   // Pink 400
  green: '#4ade80',  // Green 400
  greenDark: '#16a34a', // Green 600
  green50: '#f0fdf4',
  purple: '#c084fc', // Purple 400
  white: '#ffffff',
  slateDark: '#1e293b',
  slateMedium: '#64748b',
  slate400: '#94a3b8',
  bgMain: '#F0F9FF', // Sky 50

  // Accents
  accentGradientStart: '#60a5fa',
  accentGradientEnd: '#2563eb',
};

const TAB_BAR_STYLES = {
  backgroundColor: '#ffffff',
  borderTopWidth: 0,
  elevation: 10,
  shadowColor: PALETTE.blue200,
  shadowOpacity: 0.3,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: -2 },
  height: Platform.OS === 'ios' ? 90 : 70,
  paddingBottom: Platform.OS === 'ios' ? 30 : 12,
  paddingTop: 12,
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const [time, setTime] = useState(new Date());
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error' | 'already_marked' | 'unknown_student_db' | 'unknown_face_aws'>('idle');
  const [showMascotTip, setShowMascotTip] = useState(true);
  const [recognizedStudent, setRecognizedStudent] = useState<Student | null>(null);
  const [confidenceInfo, setConfidenceInfo] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [facing, setFacing] = useState<'front' | 'back'>('front');

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
      withTiming(0.8, { duration: 1500 }),
      withTiming(1, { duration: 1500 })
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

          await processAttendance(recognition.studentId, conf);

        } else {
          // Face detected but not recognized in AWS collection
          setStatus('unknown_face_aws');
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

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'front' ? 'back' : 'front'));
  };

  const toggleTabBar = () => {
    const newState = !isTabBarVisible;
    setIsTabBarVisible(newState);
    navigation.setOptions({
      tabBarStyle: newState ? TAB_BAR_STYLES : { display: 'none' }
    });
  };

  const processAttendance = async (studentId: string, conf: number) => {
    try {
      const result = await markAttendance(studentId, conf);

      if (result.success) {
        Vibration.vibrate(200);

        const student: Student = {
          studentId: result.student?.id || studentId,
          studentName: result.student?.name || `Student ${studentId}`,
          photoUrl: result.student?.photo_url,
          isPartTimeToday: result.student?.is_part_time_today,
          checkInTime: result.student?.check_in_time
        };

        setRecognizedStudent(student);
        setStatus('success');

      } else if (result.already_marked) {
        Vibration.vibrate([100, 50, 100]);

        const student: Student = {
          studentId: result.student?.id || studentId,
          studentName: result.student?.name || `Student ${studentId}`,
          photoUrl: result.student?.photo_url,
          checkInTime: result.student?.first_check_in
        };

        setRecognizedStudent(student);
        setErrorMessage(result.message || 'Already checked in');
        setStatus('already_marked');

      } else {
        // Check if error implies student not found in PHP database
        const err = result.error || result.message || '';
        if (err.toLowerCase().includes('not found') || err.toLowerCase().includes('does not exist')) {
          setStatus('unknown_student_db');
        } else {
          setErrorMessage(result.error || 'Failed to mark attendance');
          setStatus('error');
          setTimeout(() => setStatus('idle'), 3000);
        }
      }

    } catch (error: any) {
      console.error('Attendance Error:', error);
      setErrorMessage('Failed to record attendance');
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
  if ((status === 'success' || status === 'already_marked') && recognizedStudent) {
    return (
      <RecognitionSuccessResult
        student={recognizedStudent}
        confidence={confidenceInfo}
        message="Attendance Marked Successfully!"
        alreadyMarked={status === 'already_marked'}
        isPartTime={recognizedStudent.isPartTimeToday}
        checkInTime={recognizedStudent.checkInTime}
        onDone={() => {
          setStatus('idle');
          setRecognizedStudent(null);
        }}
      />
    );
  }

  // --- Render Unknown Student Screen ---
  if (status === 'unknown_student_db' || status === 'unknown_face_aws') {
    const isDbMismatch = status === 'unknown_student_db';
    return (
      <RecognitionUnknownResult
        onRetry={() => setStatus('idle')}
        title={isDbMismatch ? "Unknown Student Profile" : "Who goes there?"}
        message={
          isDbMismatch
            ? "Your face is recognized, but your details are missing from the school database."
            : "I can see your face, but I don't know your name yet!"
        }
        iconName={isDbMismatch ? "account-question" : "robot-confused"}
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
        <Ionicons name="cloud" size={80} color={COLORS.blue} style={{ opacity: 0.2 }} />
      </Animated.View>
      <Animated.View style={[styles.bgSun, pulseStyle]}>
        <Ionicons name="sunny" size={100} color={COLORS.yellow} style={{ opacity: 0.8 }} />
      </Animated.View>

      {/* Particles */}
      <Animated.View style={[styles.particleStar1, spinStyle]}>
        <FontAwesome5 name="star" size={28} color={COLORS.yellow} />
      </Animated.View>
      <Animated.View style={[styles.particleHeart, bounceStyle]}>
        <FontAwesome5 name="heart" size={24} color={COLORS.pink} />
      </Animated.View>
      <Animated.View style={[styles.particleStar2, pulseStyle]}>
        <FontAwesome5 name="star" size={18} color={COLORS.blue} />
      </Animated.View>

      {/* Main Scroll Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Animated.View style={[styles.logoBox, wiggleStyle]}>
              <MaterialCommunityIcons name="rocket-launch" size={32} color="white" />
            </Animated.View>
            <View>
              <Text style={styles.appTitle}>Attendance Hero</Text>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Ready to Zoom!</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeValue}>{formatTime(time)}</Text>
              <Text style={styles.dateValue}>{formatDate(time)}</Text>
            </View>
            <TouchableOpacity
              style={styles.navToggleBtn}
              onPress={toggleTabBar}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isTabBarVisible ? "expand-outline" : "contract-outline"}
                size={24}
                color={COLORS.slateMedium}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentContainer}>

          {/* Welcome */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Hello, Explorer! 🚀</Text>
            <Text style={styles.welcomeSubtitle}>Show me your biggest smile!</Text>
          </View>

          {/* Mascot */}
          <View style={styles.mascotContainer}>
            {showMascotTip && (
              <Animated.View entering={FadeIn.delay(300)} style={[styles.mascotTooltip, bounceStyle]}>
                <Text style={styles.tooltipText}>Look here for magic!</Text>
                <View style={styles.tooltipArrow} />
              </Animated.View>
            )}
            <TouchableOpacity
              onPress={() => setShowMascotTip(!showMascotTip)}
              activeOpacity={0.9}
            >
              <Animated.View style={[styles.mascotCircle, wiggleStyle]}>
                <MaterialCommunityIcons name="robot-happy" size={48} color="white" />
                <View style={styles.mascotBadge}>
                  <Feather name="zap" size={14} color="white" />
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Magic Mirror (Camera) with Integrated Button */}
          <View style={styles.mirrorContainer}>
            {/* Glow Effect */}
            <View style={styles.mirrorGlow} />

            <View style={styles.mirrorFrame}>

              {permission?.granted ? (
                <CameraView
                  style={StyleSheet.absoluteFill}
                  facing={facing}
                  ref={cameraRef}
                />
              ) : (
                <LinearGradient
                  colors={[COLORS.slateDark, '#334155']}
                  style={styles.mirrorInner}
                >
                  <View style={styles.placeholderContent}>
                    <TouchableOpacity onPress={requestPermission} style={{ alignItems: 'center' }}>
                      <View style={styles.cameraIconCircle}>
                        <Feather name="camera-off" size={40} color={COLORS.slateMedium} />
                      </View>
                      <Text style={styles.mirrorText}>Tap to Start Magic</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              )}

              {/* Overlays */}
              <View style={styles.overlayContainer} pointerEvents="none">
                {/* Face Guide Frame */}
                <View style={styles.faceGuideFrame}>
                  <View style={[styles.guideCorner, { top: 0, left: 0, borderTopWidth: 6, borderLeftWidth: 6 }]} />
                  <View style={[styles.guideCorner, { top: 0, right: 0, borderTopWidth: 6, borderRightWidth: 6 }]} />
                  <View style={[styles.guideCorner, { bottom: 0, left: 0, borderBottomWidth: 6, borderLeftWidth: 6 }]} />
                  <View style={[styles.guideCorner, { bottom: 0, right: 0, borderBottomWidth: 6, borderRightWidth: 6 }]} />
                </View>
              </View>

              {/* Camera Switch Button */}
              {permission?.granted && (
                <TouchableOpacity
                  style={styles.cameraSwitchButton}
                  onPress={toggleCameraFacing}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera-reverse" size={22} color="white" />
                </TouchableOpacity>
              )}

            </View>

            {/* Action Button (Below Camera Frame) */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                onPress={handleSnap}
                disabled={status === 'scanning' || !permission?.granted}
                activeOpacity={0.85}
                style={[styles.snapButton, (status === 'scanning' || !permission?.granted) && styles.snapButtonDisabled]}
              >
                <LinearGradient
                  colors={[COLORS.blue, COLORS.blueDark]}
                  style={styles.snapButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Feather name="camera" size={32} color="white" />
                  <Text style={styles.snapButtonText}>TAKE PHOTO!</Text>
                </LinearGradient>
                {/* Button Shadow Layer */}
                <View style={styles.snapButtonShadow} />
              </TouchableOpacity>
            </View>

          </View>

          <TouchableOpacity style={styles.helpLink}>
            <View style={styles.helpIconBg}>
              <Feather name="life-buoy" size={16} color="white" />
            </View>
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
  bgCloud: { position: 'absolute', top: 40, left: 40 },
  bgSun: { position: 'absolute', top: 60, right: 30 },
  particleStar1: { position: 'absolute', top: '15%', left: 20, opacity: 0.6 },
  particleHeart: { position: 'absolute', top: '20%', right: 32, opacity: 0.6 },
  particleStar2: { position: 'absolute', bottom: '30%', left: 40, opacity: 0.6 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 24,
    marginBottom: 10,
    width: '100%',
    zIndex: 20,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox: {
    width: 60, height: 60, backgroundColor: COLORS.purple,
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: 'white',
    shadowColor: COLORS.purple, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  appTitle: { fontSize: 22, fontWeight: '900', color: COLORS.slateDark, letterSpacing: -0.5 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4,
    backgroundColor: COLORS.green50, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.green
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.green, borderWidth: 2, borderColor: 'white' },
  statusText: { fontSize: 11, fontWeight: '800', color: COLORS.greenDark, textTransform: 'uppercase', letterSpacing: 0.5 },
  timeBlock: { alignItems: 'flex-end' },
  timeValue: { fontSize: 20, fontWeight: '900', color: COLORS.slateDark },
  dateValue: { fontSize: 11, fontWeight: '700', color: COLORS.slateMedium, textTransform: 'uppercase', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navToggleBtn: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },

  // Welcome
  welcomeSection: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  welcomeTitle: { fontSize: 32, fontWeight: '900', color: COLORS.slateDark, marginBottom: 4, textAlign: 'center' },
  welcomeSubtitle: { fontSize: 16, fontWeight: '700', color: COLORS.slateMedium, textAlign: 'center' },

  // Mascot
  mascotContainer: { alignItems: 'center', alignSelf: 'flex-end', marginRight: 20, marginBottom: 10, zIndex: 30 },
  mascotTooltip: {
    position: 'absolute', top: -45, right: 10, backgroundColor: 'white', padding: 12,
    borderRadius: 20, borderWidth: 3, borderColor: COLORS.blue,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
    minWidth: 140,
  },
  tooltipText: { fontSize: 13, fontWeight: '800', color: COLORS.blueDark, textAlign: 'center' },
  tooltipArrow: {
    position: 'absolute', bottom: -8, right: 20, width: 16, height: 16,
    backgroundColor: 'white', borderBottomWidth: 3, borderRightWidth: 3,
    borderColor: COLORS.blue, transform: [{ rotate: '45deg' }]
  },
  mascotCircle: {
    backgroundColor: COLORS.orange, padding: 12, borderRadius: 999,
    borderWidth: 4, borderColor: 'white',
    shadowColor: COLORS.orange, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8
  },
  mascotBadge: {
    position: 'absolute', bottom: -4, right: -4, backgroundColor: COLORS.green,
    padding: 6, borderRadius: 999, borderWidth: 3, borderColor: 'white'
  },

  // Mirror
  mirrorContainer: { position: 'relative', alignItems: 'center', marginBottom: 20 },
  mirrorGlow: {
    position: 'absolute',
    top: -20, left: -20, right: -20, bottom: 250,
    backgroundColor: COLORS.blue,
    borderRadius: 60,
    opacity: 0.1,
    transform: [{ scale: 1.05 }]
  },
  mirrorFrame: {
    width: width - 48,
    height: (width - 48) * 1.25, // Portrait size
    maxWidth: 350, maxHeight: 440,
    backgroundColor: 'white', borderRadius: 48,
    borderWidth: 8, borderColor: 'white', // White inner border
    // External colored border handled by container or shadow
    shadowColor: COLORS.blue, shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    overflow: 'hidden',
  },
  mirrorInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderContent: { alignItems: 'center' },
  cameraIconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#f1f5f9',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    borderWidth: 4, borderColor: '#e2e8f0'
  },
  mirrorText: { fontSize: 14, fontWeight: '800', color: COLORS.slateMedium, textTransform: 'uppercase', letterSpacing: 1 },

  overlayContainer: { ...StyleSheet.absoluteFillObject, padding: 0, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },

  faceGuideFrame: {
    width: 200, height: 260,
    justifyContent: 'space-between'
  },
  guideCorner: {
    position: 'absolute', width: 40, height: 40, borderColor: 'rgba(255,255,255,0.6)', borderRadius: 8
  },

  // Camera Switch Button
  cameraSwitchButton: {
    position: 'absolute',
    top: 20, right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    width: 44, height: 44,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.5)',
  },

  // Action Button
  actionContainer: {
    width: '100%',
    marginTop: 35, // Overlap the frame slightly
    alignItems: 'center',
    zIndex: 20,
  },
  snapButton: {
    width: '80%',
    height: 72,
    borderRadius: 36,
    // Shadow handles separately for 3D effect
  },
  snapButtonDisabled: { opacity: 0.8 },
  snapButtonGradient: {
    flex: 1, borderRadius: 36, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 12,
    zIndex: 2,
    borderWidth: 3, borderColor: 'white'
  },
  snapButtonShadow: {
    position: 'absolute', bottom: -6, left: 4, right: 4, height: '100%',
    backgroundColor: '#1d4ed8', // Darker blue
    borderRadius: 36,
    zIndex: 1,
  },
  snapButtonText: { fontSize: 20, fontWeight: '900', color: 'white', letterSpacing: 1 },

  helpLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginTop: 40, padding: 12, borderRadius: 24, backgroundColor: 'white', borderWidth: 2, borderColor: '#e2e8f0'
  },
  helpIconBg: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.slate400,
    alignItems: 'center', justifyContent: 'center'
  },
  helpLinkText: { fontSize: 15, fontWeight: '800', color: COLORS.slateMedium },
});
