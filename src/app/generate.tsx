import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/app-context';
import { useToast } from '@/context/toast-context';
import { ContactPayload, EmailPayload, QRType, WiFiEncryption, WiFiPayload } from '@/types/qr';
import {
  encodeContact,
  encodeEmail,
  encodeURL,
  encodeWiFi,
} from '@/utils/qr-payload';
import { AppInput } from '@/components/ui/app-input';
import { AppButton } from '@/components/ui/app-button';
import { QRCardView } from '@/components/ui/qr-card-view';
import { MaxContentWidth } from '@/constants/theme';
import {
  IconCheck,
  IconEye,
  IconEyeOff,
  IconFileText,
  IconGlobe,
  IconMail,
  IconSparkles,
  IconUser,
  IconWifi,
} from '@/components/icons';

const TABS: { type: QRType; label: string; icon: (c: string, s: number) => React.ReactNode }[] = [
  { type: 'url', label: 'URL', icon: (c, s) => <IconGlobe size={s} color={c} /> },
  { type: 'wifi', label: 'Wi-Fi', icon: (c, s) => <IconWifi size={s} color={c} /> },
  { type: 'text', label: 'Text', icon: (c, s) => <IconFileText size={s} color={c} /> },
  { type: 'contact', label: 'Contact', icon: (c, s) => <IconUser size={s} color={c} /> },
  { type: 'email', label: 'Email', icon: (c, s) => <IconMail size={s} color={c} /> },
];

export default function GenerateScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ initialType?: string }>();
  const { theme, settings, triggerHaptic, addItem } = useApp();
  const { toast } = useToast();

  const [activeType, setActiveType] = useState<QRType>('url');

  // Form states
  const [urlInput, setUrlInput] = useState<string>('https://expo.dev');
  const [textInput, setTextInput] = useState<string>('');

  // Wi-Fi form
  const [wifiSsid, setWifiSsid] = useState<string>('MyHomeWiFi');
  const [wifiPassword, setWifiPassword] = useState<string>('SuperSecretPass');
  const [wifiEncryption, setWifiEncryption] = useState<WiFiEncryption>('WPA');
  const [wifiHidden, setWifiHidden] = useState<boolean>(false);
  const [showWifiPassword, setShowWifiPassword] = useState<boolean>(false);

  // Email form
  const [emailTo, setEmailTo] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');

  // Contact form
  const [contactFirst, setContactFirst] = useState<string>('');
  const [contactLast, setContactLast] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactOrg, setContactOrg] = useState<string>('');
  const [contactTitle, setContactTitle] = useState<string>('');

  // QR Options
  const [ecl, setEcl] = useState<'L' | 'M' | 'Q' | 'H'>(settings.defaultErrorCorrection || 'M');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Update type if navigated with param
  useEffect(() => {
    if (params.initialType && TABS.some((t) => t.type === params.initialType)) {
      setActiveType(params.initialType as QRType);
    }
  }, [params.initialType]);

  // Compute live encoded payload & preview title
  const { rawValue, previewTitle, previewSubtitle } = (() => {
    switch (activeType) {
      case 'url': {
        const full = urlInput.trim() ? encodeURL(urlInput) : '';
        return {
          rawValue: full,
          previewTitle: urlInput.trim() || 'Empty URL',
          previewSubtitle: full,
        };
      }
      case 'wifi': {
        const payload: WiFiPayload = {
          ssid: wifiSsid.trim(),
          password: wifiPassword,
          encryption: wifiEncryption,
          hidden: wifiHidden,
        };
        const encoded = wifiSsid.trim() ? encodeWiFi(payload) : '';
        return {
          rawValue: encoded,
          previewTitle: wifiSsid.trim() || 'Wi-Fi Network',
          previewSubtitle: `${wifiEncryption.toUpperCase()} • ${
            wifiPassword ? 'Protected' : 'Open'
          }`,
        };
      }
      case 'email': {
        const payload: EmailPayload = {
          to: emailTo.trim(),
          subject: emailSubject.trim(),
          body: emailBody.trim(),
        };
        const encoded = emailTo.trim() ? encodeEmail(payload) : '';
        return {
          rawValue: encoded,
          previewTitle: emailTo.trim() || 'Email Recipient',
          previewSubtitle: emailSubject ? `Subject: ${emailSubject}` : undefined,
        };
      }
      case 'contact': {
        const payload: ContactPayload = {
          firstName: contactFirst.trim(),
          lastName: contactLast.trim(),
          phone: contactPhone.trim(),
          email: contactEmail.trim(),
          organization: contactOrg.trim(),
          title: contactTitle.trim(),
        };
        const hasData = Boolean(contactFirst || contactLast || contactPhone);
        const encoded = hasData ? encodeContact(payload) : '';
        const name = [contactFirst, contactLast].filter(Boolean).join(' ');
        return {
          rawValue: encoded,
          previewTitle: name || 'Contact Card',
          previewSubtitle: [contactPhone, contactEmail, contactOrg].filter(Boolean).join(' • '),
        };
      }
      case 'text':
      default: {
        const trimmed = textInput.trim();
        return {
          rawValue: trimmed,
          previewTitle: trimmed ? (trimmed.length > 40 ? `${trimmed.slice(0, 38)}...` : trimmed) : 'Plain Text',
          previewSubtitle: trimmed ? `${trimmed.length} characters` : undefined,
        };
      }
    }
  })();

  const handleTabChange = (type: QRType) => {
    triggerHaptic('light');
    setActiveType(type);
    setIsSaved(false);
  };

  const handleSaveLocally = async () => {
    if (!rawValue || !rawValue.trim()) {
      toast.error('Please enter content first');
      return;
    }
    triggerHaptic('success');
    await addItem({
      origin: 'generated',
      type: activeType,
      rawContent: rawValue,
      title: previewTitle,
      subtitle: previewSubtitle,
      metadata: {
        errorCorrectionLevel: ecl,
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    toast.success('Saved successfully');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16) + 12,
            paddingBottom: insets.bottom + 92,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.masthead}>
            <Text style={[styles.heading, { color: theme.text }]}>
              QR GENERATOR
            </Text>
            <Text style={[styles.subheading, { color: theme.textSecondary }]}>
              Create standards-compliant QR payloads offline
            </Text>
          </View>

          {/* Type Selector Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}>
            {TABS.map((tab) => {
              const isSelected = activeType === tab.type;
              return (
                <Pressable
                  key={tab.type}
                  onPress={() => handleTabChange(tab.type)}
                  style={({ pressed }) => [
                    styles.tabButton,
                    {
                      backgroundColor: isSelected
                        ? theme.accent
                        : theme.surface,
                      borderColor: isSelected ? theme.accent : theme.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}>
                  {tab.icon(
                    isSelected ? theme.accentContrast : theme.textSecondary,
                    14
                  )}
                  <Text
                    style={[
                      styles.tabLabel,
                      {
                        color: isSelected ? theme.accentContrast : theme.text,
                      },
                    ]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Live QR Preview Card */}
          <QRCardView
            value={rawValue}
            size={180}
            type={activeType}
            title={previewTitle}
            subtitle={previewSubtitle}
            errorCorrectionLevel={ecl}
            showActions={Boolean(rawValue)}
            onSavedLocally={handleSaveLocally}
            saveLabel={isSaved ? 'Saved Locally ✓' : 'Save to History'}
          />

          {/* Type-Specific Input Form */}
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}>
            <Text style={[styles.formTitle, { color: theme.text }]}>
              {activeType.toUpperCase()} DATA FIELDS
            </Text>

            {/* URL Form */}
            {activeType === 'url' && (
              <AppInput
                label="Target Web URL"
                placeholder="https://example.com"
                value={urlInput}
                onChangeText={(t) => {
                  setUrlInput(t);
                  setIsSaved(false);
                }}
                keyboardType="url"
                autoCapitalize="none"
                helperText="Enter a domain or full URL"
              />
            )}

            {/* Wi-Fi Form */}
            {activeType === 'wifi' && (
              <View style={styles.formFields}>
                <AppInput
                  label="Network Name (SSID)"
                  placeholder="e.g. Office_5G"
                  value={wifiSsid}
                  onChangeText={(t) => {
                    setWifiSsid(t);
                    setIsSaved(false);
                  }}
                />

                <AppInput
                  label="Password"
                  placeholder="Network password"
                  value={wifiPassword}
                  onChangeText={(t) => {
                    setWifiPassword(t);
                    setIsSaved(false);
                  }}
                  secureTextEntry={!showWifiPassword}
                  rightElement={
                    <Pressable
                      onPress={() => setShowWifiPassword((p) => !p)}
                      hitSlop={8}>
                      {showWifiPassword ? (
                        <IconEyeOff size={16} color={theme.textMuted} />
                      ) : (
                        <IconEye size={16} color={theme.textMuted} />
                      )}
                    </Pressable>
                  }
                />

                {/* Encryption selector */}
                <View style={styles.optionGroup}>
                  <Text style={[styles.optionLabel, { color: theme.textSecondary }]}>
                    SECURITY ENCRYPTION
                  </Text>
                  <View style={styles.encPillsRow}>
                    {(['WPA', 'WEP', 'nopass'] as WiFiEncryption[]).map((enc) => {
                      const sel = wifiEncryption === enc;
                      return (
                        <Pressable
                          key={enc}
                          onPress={() => {
                            triggerHaptic('light');
                            setWifiEncryption(enc);
                            setIsSaved(false);
                          }}
                          style={[
                            styles.encPill,
                            {
                              backgroundColor: sel
                                ? theme.accent
                                : theme.surfaceSecondary,
                              borderColor: sel ? theme.accent : theme.border,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.encPillText,
                              {
                                color: sel ? theme.accentContrast : theme.text,
                              },
                            ]}>
                            {enc === 'nopass' ? 'Open' : enc}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Hidden Network Toggle */}
                <Pressable
                  onPress={() => {
                    triggerHaptic('light');
                    setWifiHidden((p) => !p);
                    setIsSaved(false);
                  }}
                  style={styles.toggleRow}>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: wifiHidden ? theme.accent : theme.border,
                        backgroundColor: wifiHidden
                          ? theme.accent
                          : 'transparent',
                      },
                    ]}>
                    {wifiHidden && (
                      <IconCheck size={12} color={theme.accentContrast} />
                    )}
                  </View>
                  <Text style={[styles.toggleLabel, { color: theme.text }]}>
                    Hidden network SSID
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Email Form */}
            {activeType === 'email' && (
              <View style={styles.formFields}>
                <AppInput
                  label="Recipient Email"
                  placeholder="contact@domain.com"
                  value={emailTo}
                  onChangeText={(t) => {
                    setEmailTo(t);
                    setIsSaved(false);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <AppInput
                  label="Subject Line (Optional)"
                  placeholder="Meeting follow up"
                  value={emailSubject}
                  onChangeText={(t) => {
                    setEmailSubject(t);
                    setIsSaved(false);
                  }}
                />

                <AppInput
                  label="Pre-filled Body (Optional)"
                  placeholder="Hi, I wanted to reach out regarding..."
                  value={emailBody}
                  onChangeText={(t) => {
                    setEmailBody(t);
                    setIsSaved(false);
                  }}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}

            {/* Contact Form */}
            {activeType === 'contact' && (
              <View style={styles.formFields}>
                <View style={styles.splitRow}>
                  <View style={styles.flexHalf}>
                    <AppInput
                      label="First Name"
                      placeholder="Jane"
                      value={contactFirst}
                      onChangeText={(t) => {
                        setContactFirst(t);
                        setIsSaved(false);
                      }}
                    />
                  </View>
                  <View style={styles.flexHalf}>
                    <AppInput
                      label="Last Name"
                      placeholder="Doe"
                      value={contactLast}
                      onChangeText={(t) => {
                        setContactLast(t);
                        setIsSaved(false);
                      }}
                    />
                  </View>
                </View>

                <AppInput
                  label="Phone Number"
                  placeholder="+1 (555) 234-5678"
                  value={contactPhone}
                  onChangeText={(t) => {
                    setContactPhone(t);
                    setIsSaved(false);
                  }}
                  keyboardType="phone-pad"
                />

                <AppInput
                  label="Email Address"
                  placeholder="jane.doe@work.com"
                  value={contactEmail}
                  onChangeText={(t) => {
                    setContactEmail(t);
                    setIsSaved(false);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <View style={styles.splitRow}>
                  <View style={styles.flexHalf}>
                    <AppInput
                      label="Company / Org"
                      placeholder="Studio Inc."
                      value={contactOrg}
                      onChangeText={(t) => {
                        setContactOrg(t);
                        setIsSaved(false);
                      }}
                    />
                  </View>
                  <View style={styles.flexHalf}>
                    <AppInput
                      label="Job Title"
                      placeholder="Principal"
                      value={contactTitle}
                      onChangeText={(t) => {
                        setContactTitle(t);
                        setIsSaved(false);
                      }}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Text Form */}
            {activeType === 'text' && (
              <AppInput
                label="Raw Text Content"
                placeholder="Enter any note, code, or payload here..."
                value={textInput}
                onChangeText={(t) => {
                  setTextInput(t);
                  setIsSaved(false);
                }}
                multiline
                numberOfLines={4}
                helperText="Plain text is encoded verbatim without transformations"
              />
            )}

            {/* Error correction setting */}
            <View style={styles.eclBlock}>
              <Text style={[styles.optionLabel, { color: theme.textSecondary }]}>
                ERROR CORRECTION LEVEL (ECL)
              </Text>
              <View style={styles.eclRow}>
                {(['L', 'M', 'Q', 'H'] as const).map((level) => {
                  const sel = ecl === level;
                  return (
                    <Pressable
                      key={level}
                      onPress={() => {
                        triggerHaptic('light');
                        setEcl(level);
                      }}
                      style={[
                        styles.eclChip,
                        {
                          backgroundColor: sel
                            ? theme.accent
                            : theme.surfaceSecondary,
                          borderColor: sel ? theme.accent : theme.border,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.eclChipText,
                          {
                            color: sel ? theme.accentContrast : theme.text,
                          },
                        ]}>
                        Level {level}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: 18,
  },
  masthead: {
    gap: 2,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subheading: {
    fontSize: 13,
  },
  tabsRow: {
    gap: 8,
    paddingRight: 10,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  formCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  formTitle: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  formFields: {
    gap: 14,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flexHalf: {
    flex: 1,
  },
  optionGroup: {
    gap: 8,
  },
  optionLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  encPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  encPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  encPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  eclBlock: {
    gap: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: 12,
  },
  eclRow: {
    flexDirection: 'row',
    gap: 8,
  },
  eclChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eclChipText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});
