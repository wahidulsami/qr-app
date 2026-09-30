import { Alert, Linking, Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Copies text to device clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (err) {
    console.warn('[QR Actions] Copy to clipboard failed:', err);
    return false;
  }
}

/**
 * Opens a URL in the default browser safely
 */
export async function openURLSafe(rawUrl: string): Promise<boolean> {
  try {
    const formatted = /^https?:\/\//i.test(rawUrl.trim())
      ? rawUrl.trim()
      : `https://${rawUrl.trim()}`;
    const supported = await Linking.canOpenURL(formatted);
    if (supported) {
      await Linking.openURL(formatted);
      return true;
    } else {
      Alert.alert('Cannot Open URL', `No app available to open: ${formatted}`);
      return false;
    }
  } catch (err) {
    console.warn('[QR Actions] Open URL failed:', err);
    Alert.alert('Open URL Error', 'Could not open the specified web address.');
    return false;
  }
}

/**
 * Shares text content via system share sheet
 */
export async function shareContent(message: string, title: string = 'QR Code'): Promise<boolean> {
  try {
    const result = await Share.share({
      message,
      title,
    });
    return result.action === Share.sharedAction;
  } catch (err) {
    console.warn('[QR Actions] Share failed:', err);
    return false;
  }
}

/**
 * Extracts PNG base64 from react-native-qrcode-svg ref and saves as local file
 */
export async function exportQRAsImageFile(
  svgRef: any,
  filename: string = 'qr_code.png'
): Promise<string | null> {
  return new Promise((resolve) => {
    if (!svgRef) {
      resolve(null);
      return;
    }

    try {
      svgRef.toDataURL(async (data: string) => {
        if (!data) {
          resolve(null);
          return;
        }

        try {
          if (Platform.OS === 'web') {
            // For web, create download trigger
            if (typeof document !== 'undefined') {
              const link = document.createElement('a');
              link.download = filename;
              link.href = `data:image/png;base64,${data}`;
              link.click();
              resolve('downloaded');
              return;
            }
            resolve(null);
            return;
          }

          // For native iOS / Android, save to local cache file
          const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
          if (!cacheDir) {
            resolve(null);
            return;
          }

          const fileUri = `${cacheDir}${Date.now()}_${filename}`;
          await FileSystem.writeAsStringAsync(fileUri, data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          resolve(fileUri);
        } catch (innerErr) {
          console.warn('[QR Actions] Error writing image file:', innerErr);
          resolve(null);
        }
      });
    } catch (err) {
      console.warn('[QR Actions] Failed to export QR to dataURL:', err);
      resolve(null);
    }
  });
}

/**
 * Shares QR code as an image file via native share sheet
 */
export async function shareQRAsImage(
  svgRef: any,
  filename: string = 'qr_code.png',
  fallbackText?: string
): Promise<boolean> {
  try {
    const imageUri = await exportQRAsImageFile(svgRef, filename);
    if (imageUri && imageUri !== 'downloaded') {
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(imageUri, {
          mimeType: 'image/png',
          dialogTitle: 'Share QR Code',
          UTI: 'public.png',
        });
        return true;
      }
    }

    // Fallback to sharing text payload if image sharing isn't available
    if (fallbackText) {
      return await shareContent(fallbackText);
    }
    return false;
  } catch (err) {
    console.warn('[QR Actions] Share QR as image failed:', err);
    if (fallbackText) {
      return await shareContent(fallbackText);
    }
    return false;
  }
}
