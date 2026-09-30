import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BarcodeScanningResult, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/app-context';
import { useToast } from '@/context/toast-context';
import { parseQRPayload } from '@/utils/qr-payload';
import { copyToClipboard, openURLSafe } from '@/utils/qr-actions';
import { ScanResultModal } from '@/components/ui/scan-result-modal';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import {
  IconCameraFlip,
  IconClose,
  IconFileText,
  IconQrCode,
  IconShieldCheck,
  IconTorch,
} from '@/components/icons';

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const { theme, settings, triggerHaptic, addItem } = useApp();
  const { toast } = useToast();
  const [permission, requestPermission] = useCameraPermissions();

  const [facing, setFacing] = useState<CameraType>('back');
  const [torch, setTorch] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isScanningActive, setIsScanningActive] = useState<boolean>(true);
  const [manualInput, setManualInput] = useState<string>('');
  const [showManualTester, setShowManualTester] = useState<boolean>(false);

  // Scanning laser animation
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    if (isScanningActive) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
    } else {
      laserAnim.stopAnimation();
    }

    return () => {
      anim?.stop();
    };
  }, [isScanningActive, laserAnim]);

  const processScanResult = async (data: string) => {
    if (!data || !isScanningActive) return;
    setIsScanningActive(false);
    triggerHaptic('success');
    toast.scan('Scan completed');

    const parsed = parseQRPayload(data);

    // Save to local storage history
    await addItem({
      origin: 'scanned',
      type: parsed.type,
      rawContent: data,
      title: parsed.title,
      subtitle: parsed.subtitle,
      metadata: {
        wifi: parsed.wifi,
        email: parsed.email,
        contact: parsed.contact,
      },
    });

    // Check scanner preferences
    if (settings.autoCopyOnScan) {
      copyToClipboard(data);
    }
    if (settings.autoOpenUrls && parsed.url) {
      openURLSafe(parsed.url);
    }

    setScannedData(data);
  };

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (result.data) {
      processScanResult(result.data);
    }
  };

  const handleScanAnother = () => {
    setScannedData(null);
    setIsScanningActive(true);
  };

  const toggleTorch = () => {
    triggerHaptic('light');
    setTorch((prev) => !prev);
  };

  const toggleFacing = () => {
    triggerHaptic('light');
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  // Permission screen
  if (!permission) {
    return (
      <View style={[styles.centerScreen, { backgroundColor: theme.background }]}>
        <Text style={[styles.permText, { color: theme.textSecondary }]}>
          Initializing camera hardware...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        style={[
          styles.permissionContainer,
          {
            backgroundColor: theme.background,
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 40,
          },
        ]}>
        <View
          style={[
            styles.permIconCircle,
            { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
          ]}>
          <IconShieldCheck size={36} color={theme.text} />
        </View>

        <Text style={[styles.permHeading, { color: theme.text }]}>
          Camera Access Required
        </Text>
        <Text style={[styles.permBody, { color: theme.textSecondary }]}>
          To scan QR codes with your device camera, grant camera permissions.
          All visual processing is handled 100% on your device with zero server
          calls.
        </Text>

        <View style={styles.permActions}>
          <AppButton
            variant="primary"
            size="lg"
            label="Enable Camera"
            onPress={requestPermission}
            fullWidth
          />

          <AppButton
            variant="secondary"
            size="md"
            label={showManualTester ? 'Hide Manual Input' : 'Test with Manual / Paste Code'}
            onPress={() => setShowManualTester((p) => !p)}
            fullWidth
          />
        </View>

        {showManualTester && (
          <View
            style={[
              styles.manualBox,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}>
            <AppInput
              label="Paste QR payload to test"
              placeholder="e.g. https://example.com or WIFI:S:MyNetwork;P:pass;T:WPA;;"
              value={manualInput}
              onChangeText={setManualInput}
              multiline
              numberOfLines={2}
            />
            <AppButton
              variant="primary"
              size="md"
              label="Process Code"
              disabled={!manualInput.trim()}
              onPress={() => processScanResult(manualInput.trim())}
            />
          </View>
        )}

        <ScanResultModal
          visible={Boolean(scannedData)}
          rawContent={scannedData || ''}
          onScanAnother={handleScanAnother}
          onClose={() => setScannedData(null)}
        />
      </View>
    );
  }

  // Camera Ready View
  const translateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 216],
  });

  return (
    <View style={styles.cameraScreen}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={isScanningActive ? handleBarcodeScanned : undefined}
      />

      {/* Dark overlay with transparent viewfinder cutout */}
      <View style={styles.overlayLayer}>
        {/* Top Controls Bar */}
        <View
          style={[
            styles.topControls,
            {
              paddingTop: Math.max(insets.top, 16) + 8,
            },
          ]}>
          <View style={styles.topPill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>READY TO SCAN</Text>
          </View>

          <View style={styles.controlButtons}>
            <Pressable
              onPress={toggleTorch}
              style={[
                styles.iconButton,
                torch && styles.iconButtonActive,
              ]}>
              <IconTorch
                size={18}
                color={torch ? '#000000' : '#FFFFFF'}
                active={torch}
              />
            </Pressable>

            <Pressable onPress={toggleFacing} style={styles.iconButton}>
              <IconCameraFlip size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Viewfinder Center Frame */}
        <View style={styles.viewfinderCenter}>
          <View style={styles.viewfinderFrame}>
            {/* Viewfinder corner brackets */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Scanning Laser Beam */}
            {isScanningActive && (
              <Animated.View
                style={[
                  styles.laserBeam,
                  {
                    transform: [{ translateY }],
                  },
                ]}
              />
            )}
          </View>

          <Text style={styles.viewfinderHint}>
            Align QR code within the frame
          </Text>
        </View>

        {/* Bottom Manual Test Option */}
        <View
          style={[
            styles.bottomBar,
            {
              paddingBottom: Math.max(insets.bottom, 16) + 84,
            },
          ]}>
          <Pressable
            onPress={() => setShowManualTester((prev) => !prev)}
            style={styles.manualToggleBtn}>
            <IconFileText size={14} color="#FFFFFF" />
            <Text style={styles.manualToggleText}>
              {showManualTester ? 'Hide Paste Tester' : 'Manual / Paste Code'}
            </Text>
          </Pressable>

          {showManualTester && (
            <View
              style={[
                styles.manualCardFloating,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}>
              <View style={styles.manualCardHeader}>
                <Text style={[styles.manualCardTitle, { color: theme.text }]}>
                  Manual Payload Input
                </Text>
                <Pressable onPress={() => setShowManualTester(false)}>
                  <IconClose size={16} color={theme.textMuted} />
                </Pressable>
              </View>

              <AppInput
                placeholder="Paste or type raw QR payload..."
                value={manualInput}
                onChangeText={setManualInput}
                multiline
                numberOfLines={2}
              />

              <AppButton
                variant="primary"
                size="md"
                label="Process Payload"
                disabled={!manualInput.trim()}
                onPress={() => {
                  processScanResult(manualInput.trim());
                  setShowManualTester(false);
                }}
              />
            </View>
          )}
        </View>
      </View>

      {/* Result Modal */}
      <ScanResultModal
        visible={Boolean(scannedData)}
        rawContent={scannedData || ''}
        onScanAnother={handleScanAnother}
        onClose={() => setScannedData(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cameraScreen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 16,
  },
  permIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  permHeading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  permBody: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 340,
  },
  permActions: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
    marginTop: 8,
  },
  manualBox: {
    width: '100%',
    maxWidth: 360,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginTop: 10,
  },
  overlayLayer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  topPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  liveText: {
    color: '#FAFAFA',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  viewfinderCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  viewfinderFrame: {
    width: 240,
    height: 240,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#FFFFFF',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  laserBeam: {
    height: 2,
    backgroundColor: '#4ADE80',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  viewfinderHint: {
    color: '#FAFAFA',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bottomBar: {
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  manualToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  manualToggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  manualCardFloating: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  manualCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  manualCardTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
});
