export type QRType = 'text' | 'url' | 'wifi' | 'email' | 'contact';

export type WiFiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface WiFiPayload {
  ssid: string;
  password?: string;
  encryption: WiFiEncryption;
  hidden?: boolean;
}

export interface EmailPayload {
  to: string;
  subject?: string;
  body?: string;
}

export interface ContactPayload {
  firstName: string;
  lastName?: string;
  phone?: string;
  email?: string;
  organization?: string;
  title?: string;
  note?: string;
}

export interface QRItemMetadata {
  wifi?: WiFiPayload;
  email?: EmailPayload;
  contact?: ContactPayload;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  fgColor?: string;
  bgColor?: string;
}

export interface QRItem {
  id: string;
  origin: 'scanned' | 'generated';
  type: QRType;
  rawContent: string;
  title: string;
  subtitle?: string;
  createdAt: number;
  metadata?: QRItemMetadata;
}

export interface AppSettings {
  themeMode: 'system' | 'light' | 'dark';
  hapticsEnabled: boolean;
  autoCopyOnScan: boolean;
  autoOpenUrls: boolean;
  defaultErrorCorrection: 'L' | 'M' | 'Q' | 'H';
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'system',
  hapticsEnabled: true,
  autoCopyOnScan: false,
  autoOpenUrls: false,
  defaultErrorCorrection: 'M',
};
