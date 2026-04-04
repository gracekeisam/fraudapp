import { Transaction, getSettings } from './storage';

type ReportResult = {
  ok: boolean;
  message?: string;
};

export const reportTransaction = async (txn: Transaction): Promise<ReportResult> => {
  let apiEndpoint = '';

  try {
    const settings = await getSettings();
    apiEndpoint = settings.apiEndpoint.trim();

    if (!apiEndpoint || apiEndpoint === 'https://example.com/api/report') {
      const message = 'API endpoint is not configured, so live reporting was skipped.';
      console.warn(message);
      return { ok: false, message };
    }

    if (apiEndpoint.includes('0.0.0.0')) {
      const message =
        'Invalid API endpoint: 0.0.0.0 is only for the backend to listen on. Use 127.0.0.1, 10.0.2.2, or your computer LAN IP instead.';
      console.error(message);
      return { ok: false, message };
    }

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(settings.apiKey ? { 'Authorization': `Bearer ${settings.apiKey}` } : {}),
      },
      body: JSON.stringify({
        transaction_id: txn.id,
        utr: txn.utr,
        amount: txn.amount,
        vpa: txn.vpa,
        status: txn.status,
        timestamp: new Date(txn.timestamp).toISOString(),
        location: txn.location,
        device_info: txn.deviceInfo || {
          model: 'Expo UPI Simulator',
          brand: 'Simulator',
          osName: 'Unknown',
          osVersion: '1.0.0'
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to report transaction: ${response.status} ${response.statusText}`);
    }

    console.log('Transaction reported successfully');
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Network request failed while reporting the transaction.';

    console.error(`Error reporting transaction to ${apiEndpoint || 'unknown endpoint'}:`, error);

    if (message.includes('Network request failed')) {
      const networkHint =
        apiEndpoint && (apiEndpoint.includes('localhost') || apiEndpoint.includes('127.0.0.1'))
          ? ` Could not reach ${apiEndpoint}. If you are using a physical phone, replace localhost with your computer's LAN IP.`
          : ` Could not reach ${apiEndpoint || 'the configured endpoint'}. Make sure the backend is running and the device can access it on the same network.`;

      return { ok: false, message: `Network request failed.${networkHint}` };
    }

    return { ok: false, message };
  }
};
