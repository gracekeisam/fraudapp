import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
  DAILY_LIMIT: 'upi_daily_limit',
  TXN_LIMIT: 'upi_txn_limit',
  API_ENDPOINT: 'upi_api_endpoint',
  API_KEY: 'upi_api_key',
  HISTORY: 'upi_txn_history',
};

export interface AppSettings {
  dailyLimit: string;
  txnLimit: string;
  apiEndpoint: string;
  apiKey: string;
}

export interface Transaction {
  id: string;
  utr: string;
  amount: string;
  vpa: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  deviceInfo?: {
    model: string;
    brand: string;
    osName: string;
    osVersion: string;
  };
}

export const saveSettings = async (settings: AppSettings) => {
  await SecureStore.setItemAsync(STORAGE_KEYS.DAILY_LIMIT, settings.dailyLimit);
  await SecureStore.setItemAsync(STORAGE_KEYS.TXN_LIMIT, settings.txnLimit);
  await SecureStore.setItemAsync(STORAGE_KEYS.API_ENDPOINT, settings.apiEndpoint);
  await SecureStore.setItemAsync(STORAGE_KEYS.API_KEY, settings.apiKey);
};

export const getSettings = async (): Promise<AppSettings> => {
  const dailyLimit = await SecureStore.getItemAsync(STORAGE_KEYS.DAILY_LIMIT) || '100000';
  const txnLimit = await SecureStore.getItemAsync(STORAGE_KEYS.TXN_LIMIT) || '10000';
  const apiEndpoint = await SecureStore.getItemAsync(STORAGE_KEYS.API_ENDPOINT) || 'https://example.com/api/report';
  const apiKey = await SecureStore.getItemAsync(STORAGE_KEYS.API_KEY) || '';
  
  return { dailyLimit, txnLimit, apiEndpoint, apiKey };
};

export const saveTransaction = async (txn: Transaction) => {
  const historyRaw = await SecureStore.getItemAsync(STORAGE_KEYS.HISTORY);
  const history: Transaction[] = historyRaw ? JSON.parse(historyRaw) : [];
  history.unshift(txn);
  // Keep only last 50 transactions
  const updatedHistory = history.slice(0, 50);
  await SecureStore.setItemAsync(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));
};

export const getHistory = async (): Promise<Transaction[]> => {
  const historyRaw = await SecureStore.getItemAsync(STORAGE_KEYS.HISTORY);
  return historyRaw ? JSON.parse(historyRaw) : [];
};
