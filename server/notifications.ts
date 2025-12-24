import { storage } from './storage';

interface ExpoPushMessage {
  to: string;
  sound?: 'default' | null;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: {
    error?: string;
  };
}

interface ExpoPushReceipt {
  status: 'ok' | 'error';
  message?: string;
  details?: {
    error?: string;
  };
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export async function sendPushNotification(
  businessId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
  try {
    const tokens = await storage.getPushTokens(businessId);
    
    if (tokens.length === 0) {
      return { success: true, sentCount: 0, errors: [] };
    }

    const messages: ExpoPushMessage[] = tokens.map(token => ({
      to: token.token,
      sound: 'default',
      title,
      body,
      data: data || {},
      priority: 'high',
    }));

    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Expo Push API error:', errorText);
      return { success: false, sentCount: 0, errors: [errorText] };
    }

    const result = await response.json();
    const tickets: ExpoPushTicket[] = result.data || [];
    const errors: string[] = [];
    let sentCount = 0;

    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      const token = tokens[i];

      if (ticket.status === 'ok') {
        sentCount++;
      } else {
        const errorMessage = ticket.message || ticket.details?.error || 'Unknown error';
        errors.push(`Token ${token.token.substring(0, 20)}...: ${errorMessage}`);
        
        if (ticket.details?.error === 'DeviceNotRegistered') {
          await storage.deactivatePushToken(token.token);
        }
      }
    }

    return { success: errors.length === 0, sentCount, errors };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, sentCount: 0, errors: [(error as Error).message] };
  }
}

export async function sendBookingNotification(
  businessId: string,
  customerName: string,
  serviceName: string,
  date: string,
  time: string
): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
  const title = 'New Booking';
  const body = `${customerName} booked ${serviceName} for ${date} at ${time}`;
  
  return sendPushNotification(businessId, title, body, {
    type: 'new_booking',
    customerName,
    serviceName,
    date,
    time,
  });
}

export async function sendBookingConfirmedNotification(
  businessId: string,
  customerName: string,
  serviceName: string,
  date: string,
  time: string
): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
  const title = 'Booking Confirmed';
  const body = `${customerName}'s ${serviceName} on ${date} at ${time} has been confirmed`;
  
  return sendPushNotification(businessId, title, body, {
    type: 'booking_confirmed',
    customerName,
    serviceName,
    date,
    time,
  });
}

export async function sendBookingCancelledNotification(
  businessId: string,
  customerName: string,
  serviceName: string,
  date: string,
  time: string
): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
  const title = 'Booking Cancelled';
  const body = `${customerName}'s ${serviceName} on ${date} at ${time} has been cancelled`;
  
  return sendPushNotification(businessId, title, body, {
    type: 'booking_cancelled',
    customerName,
    serviceName,
    date,
    time,
  });
}

export async function sendReminderNotification(
  businessId: string,
  customerName: string,
  serviceName: string,
  time: string
): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
  const title = 'Upcoming Appointment';
  const body = `Reminder: ${customerName} has ${serviceName} at ${time} today`;
  
  return sendPushNotification(businessId, title, body, {
    type: 'reminder',
    customerName,
    serviceName,
    time,
  });
}

export async function sendTestNotification(
  businessId: string
): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
  const title = 'Test Notification';
  const body = 'This is a test notification from BookFlow. If you received this, push notifications are working correctly!';
  
  return sendPushNotification(businessId, title, body, {
    type: 'test',
  });
}
