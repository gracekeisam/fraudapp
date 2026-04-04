import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  View,
  Text 
} from 'react-native';
import { Send, Download, History as HistoryIcon, MapPin, Tablet } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import { PaymentSuccess } from '@/components/PaymentSuccess';
import { TransactionHistory } from '@/components/TransactionHistory';
import { Transaction, saveTransaction, getHistory, getSettings } from '@/utils/storage';
import { reportTransaction } from '@/utils/api';

export default function TabOneScreen() {
  const [vpa, setVpa] = useState('');
  const [amount, setAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [currentTxn, setCurrentTxn] = useState<Transaction | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'simulator' | 'history'>('simulator');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  const generateUTR = () => {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  };

  const validateLimits = async (amt: string) => {
    const settings = await getSettings();
    const numAmt = parseFloat(amt);
    const txnLimit = parseFloat(settings.txnLimit);
    
    if (numAmt > txnLimit) {
      Alert.alert('Limit Exceeded', `Maximum transaction limit is ₹${txnLimit}`);
      return false;
    }
    return true;
  };

  const handleSimulateSuccess = async () => {
    if (!vpa || !amount) {
      Alert.alert('Missing Info', 'Please enter a UPI ID and Amount');
      return;
    }

    if (!(await validateLimits(amount))) return;

    let locationData = undefined;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        locationData = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
      }
    } catch (e) {
      console.warn('Could not fetch location:', e);
    }

    const deviceInfo = {
      model: Device.modelName || 'Unknown',
      brand: Device.brand || 'Unknown',
      osName: Device.osName || 'Unknown',
      osVersion: Device.osVersion || 'Unknown',
    };

    const newTxn: Transaction = {
      id: Date.now().toString(),
      utr: generateUTR(),
      amount,
      vpa,
      status: 'SUCCESS',
      timestamp: Date.now(),
      location: locationData,
      deviceInfo,
    };

    setCurrentTxn(newTxn);
    setShowSuccess(true);
    await saveTransaction(newTxn);
    const reportResult = await reportTransaction(newTxn);
    if (!reportResult.ok && reportResult.message) {
      Alert.alert('Reporting Issue', reportResult.message);
    }
    loadHistory();
  };

  if (showSuccess && currentTxn) {
    return <PaymentSuccess transaction={currentTxn} onClose={() => setShowSuccess(false)} />;
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>UPI Simulator</Text>
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'simulator' && styles.activeTab]}
            onPress={() => setActiveTab('simulator')}
          >
            <Send size={20} color={activeTab === 'simulator' ? '#0f172a' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'simulator' && styles.activeTabText]}>Simulator</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <HistoryIcon size={20} color={activeTab === 'history' ? '#0f172a' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'simulator' ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formCard}>
            <Text style={styles.label}>Recipient UPI ID</Text>
            <TextInput
              style={styles.input}
              placeholder="example@upi"
              value={vpa}
              onChangeText={setVpa}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Amount (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <View style={styles.actionGrid}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.successBtn]} 
                onPress={handleSimulateSuccess}
              >
                <View style={styles.btnIconContainer}>
                   <Download color="#ffffff" size={24} />
                </View>
                <Text style={styles.btnText}>Simulate Success</Text>
                <Text style={styles.btnSubtext}>Auto-reports Geo & Device Info</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoCard}>
             <Text style={styles.infoTitle}>How it works</Text>
             <Text style={styles.infoDesc}>
               Use this simulator to train users on identifying legitimate vs fraudulent payment scenarios. Data is logged and shared with your analysis dashboard.
             </Text>
          </View>
        </ScrollView>
      ) : (
        <TransactionHistory transactions={history} />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 20,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#f1f5f9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#0f172a',
  },
  scrollContent: {
    padding: 20,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  successBtn: {
    backgroundColor: '#22c55e',
  },
  requestBtn: {
    backgroundColor: '#0f172a',
  },
  btnIconContainer: {
    marginBottom: 8,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  btnSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoDesc: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
    opacity: 0.8,
  },
});
