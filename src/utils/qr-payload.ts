import { ContactPayload, EmailPayload, QRType, WiFiPayload } from '@/types/qr';

/**
 * Escapes characters for Wi-Fi QR strings (standard ZXing format)
 */
function escapeWiFi(text: string): string {
  return text.replace(/([\\;,:"])/g, '\\$1');
}

function unescapeWiFi(text: string): string {
  return text.replace(/\\([\\;,:"])/g, '$1');
}

/**
 * Generates standard WIFI: QR code string
 */
export function encodeWiFi(payload: WiFiPayload): string {
  const { ssid, password, encryption, hidden } = payload;
  const parts: string[] = [
    `T:${encryption}`,
    `S:${escapeWiFi(ssid)}`,
  ];
  if (password && encryption !== 'nopass') {
    parts.push(`P:${escapeWiFi(password)}`);
  }
  if (hidden) {
    parts.push('H:true');
  }
  return `WIFI:${parts.join(';')};;`;
}

/**
 * Generates standard mailto: QR code string
 */
export function encodeEmail(payload: EmailPayload): string {
  const { to, subject, body } = payload;
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return `mailto:${to.trim()}${query}`;
}

/**
 * Generates vCard 3.0 QR code string
 */
export function encodeContact(payload: ContactPayload): string {
  const { firstName, lastName, phone, email, organization, title, note } = payload;
  const fullName = [firstName.trim(), lastName?.trim()].filter(Boolean).join(' ');
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName?.trim() || ''};${firstName.trim()};;;`,
    `FN:${fullName || 'Contact'}`,
  ];
  if (phone) lines.push(`TEL;TYPE=CELL:${phone.trim()}`);
  if (email) lines.push(`EMAIL:${email.trim()}`);
  if (organization) lines.push(`ORG:${organization.trim()}`);
  if (title) lines.push(`TITLE:${title.trim()}`);
  if (note) lines.push(`NOTE:${note.trim()}`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

/**
 * Sanitizes URL
 */
export function encodeURL(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export interface ParsedQR {
  type: QRType;
  title: string;
  subtitle?: string;
  url?: string;
  wifi?: WiFiPayload;
  email?: EmailPayload;
  contact?: ContactPayload;
}

/**
 * Parses any raw QR code string into typed structured data
 */
export function parseQRPayload(raw: string): ParsedQR {
  if (!raw || typeof raw !== 'string') {
    return { type: 'text', title: 'Empty QR' };
  }

  const trimmed = raw.trim();

  // 1. Wi-Fi pattern: WIFI:T:WPA;S:Network;P:password;;
  if (/^WIFI:/i.test(trimmed)) {
    try {
      const match = trimmed.slice(5);
      const tokens = match.split(';');
      let ssid = '';
      let password = '';
      let encryption: 'WPA' | 'WEP' | 'nopass' = 'WPA';
      let hidden = false;

      for (const token of tokens) {
        if (!token) continue;
        const [key, ...rest] = token.split(':');
        const val = rest.join(':');
        const upperKey = key.toUpperCase();
        if (upperKey === 'S') ssid = unescapeWiFi(val);
        else if (upperKey === 'P') password = unescapeWiFi(val);
        else if (upperKey === 'T') {
          const enc = val.toUpperCase();
          if (enc === 'WEP') encryption = 'WEP';
          else if (enc === 'NOPASS') encryption = 'nopass';
          else encryption = 'WPA';
        } else if (upperKey === 'H') {
          hidden = val.toLowerCase() === 'true';
        }
      }

      return {
        type: 'wifi',
        title: ssid || 'Wi-Fi Network',
        subtitle: `${encryption.toUpperCase()} • ${password ? 'Password Protected' : 'Open'}`,
        wifi: { ssid, password, encryption, hidden },
      };
    } catch {
      return { type: 'wifi', title: 'Wi-Fi Network', subtitle: trimmed };
    }
  }

  // 2. vCard or MeCard Contact
  if (/BEGIN:VCARD/i.test(trimmed)) {
    try {
      const lines = trimmed.split(/\r?\n/);
      let fn = '';
      let phone = '';
      let email = '';
      let org = '';
      let title = '';
      let note = '';
      let firstName = '';
      let lastName = '';

      for (const line of lines) {
        if (/^FN:/i.test(line)) fn = line.slice(3).trim();
        else if (/^N:/i.test(line)) {
          const parts = line.slice(2).split(';');
          lastName = parts[0]?.trim() || '';
          firstName = parts[1]?.trim() || '';
        } else if (/^TEL[^:]*:/i.test(line)) {
          phone = line.replace(/^TEL[^:]*:/i, '').trim();
        } else if (/^EMAIL[^:]*:/i.test(line)) {
          email = line.replace(/^EMAIL[^:]*:/i, '').trim();
        } else if (/^ORG:/i.test(line)) {
          org = line.slice(4).trim();
        } else if (/^TITLE:/i.test(line)) {
          title = line.slice(6).trim();
        } else if (/^NOTE:/i.test(line)) {
          note = line.slice(5).trim();
        }
      }

      const display = fn || [firstName, lastName].filter(Boolean).join(' ') || 'Contact Card';
      return {
        type: 'contact',
        title: display,
        subtitle: [phone, email, org].filter(Boolean).join(' • '),
        contact: {
          firstName: firstName || display,
          lastName,
          phone,
          email,
          organization: org,
          title,
          note,
        },
      };
    } catch {
      return { type: 'contact', title: 'Contact Card', subtitle: trimmed };
    }
  }

  // MeCard format: MECARD:N:Name;TEL:Phone;EMAIL:Email;;
  if (/^MECARD:/i.test(trimmed)) {
    try {
      const body = trimmed.slice(7);
      const tokens = body.split(';');
      let name = '';
      let phone = '';
      let email = '';
      let note = '';

      for (const t of tokens) {
        if (!t) continue;
        const [k, ...v] = t.split(':');
        const val = v.join(':');
        const key = k.toUpperCase();
        if (key === 'N') name = val;
        else if (key === 'TEL') phone = val;
        else if (key === 'EMAIL') email = val;
        else if (key === 'NOTE') note = val;
      }

      return {
        type: 'contact',
        title: name || 'Contact',
        subtitle: [phone, email].filter(Boolean).join(' • '),
        contact: {
          firstName: name || 'Contact',
          phone,
          email,
          note,
        },
      };
    } catch {
      return { type: 'contact', title: 'Contact Card', subtitle: trimmed };
    }
  }

  // 3. Email (mailto: or email-like)
  if (/^mailto:/i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const to = url.pathname;
      const subject = url.searchParams.get('subject') || '';
      const body = url.searchParams.get('body') || '';

      return {
        type: 'email',
        title: to,
        subtitle: subject ? `Subject: ${subject}` : 'Email',
        email: { to, subject, body },
      };
    } catch {
      const emailOnly = trimmed.replace(/^mailto:/i, '');
      return {
        type: 'email',
        title: emailOnly,
        subtitle: 'Email',
        email: { to: emailOnly },
      };
    }
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return {
      type: 'email',
      title: trimmed,
      subtitle: 'Email Address',
      email: { to: trimmed },
    };
  }

  // 4. URL
  if (/^(https?:\/\/|www\.)/i.test(trimmed) || /^[a-z0-9-]+(\.[a-z0-9-]+)+\/[^\s]*$/i.test(trimmed)) {
    const fullUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    let displayTitle = trimmed;
    try {
      const parsed = new URL(fullUrl);
      displayTitle = parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : '');
    } catch {
      displayTitle = trimmed;
    }

    return {
      type: 'url',
      title: displayTitle,
      subtitle: fullUrl,
      url: fullUrl,
    };
  }

  // 5. Plain Text
  const firstLine = trimmed.split('\n')[0].trim();
  const title = firstLine.length > 50 ? `${firstLine.slice(0, 47)}...` : firstLine;
  const subtitle = trimmed.length > firstLine.length ? `${trimmed.length} characters` : undefined;

  return {
    type: 'text',
    title: title || 'Plain Text',
    subtitle,
  };
}
