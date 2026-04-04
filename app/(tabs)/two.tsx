import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Switch, 
  Alert,
  View,
  Text 
} from 'react-native';
import { Settings, Shield, Globe, Save, Trash2, CheckCircle2 } from 'lucide-react-native';
import { getSettings, saveSettings, AppSettings } from '@/utils/storage';

export default function TabTwoScreen() {
  const [settings, setSettings] = useState<AppSettings>({
    dailyLimit: '100000',
    txnLimit: '10000',
    apiEndpoint: 'https://example.com/api/report',
    apiKey: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getSettings();
    setSettings(data);
    setLoading(false);
  };

  const handleSave = async () => {
    const normalizedSettings = {
      ...settings,
      apiEndpoint: settings.apiEndpoint.trim(),
      apiKey: settings.apiKey.trim(),
    };

    await saveSettings(normalizedSettings);
    setSettings(normalizedSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    Alert.alert('Settings Saved', 'Your configuration has been updated successfully.');
  };

  const testConnection = async () => {
    const endpoint = settings.apiEndpoint.trim();

    if (endpoint.includes('0.0.0.0')) {
      Alert.alert(
        'Invalid Endpoint',
        '0.0.0.0 is only for the backend to listen on. Use 127.0.0.1, 10.0.2.2, or your computer LAN IP instead.'
      );
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'HEAD',
      });
      if (response.ok || response.status === 405) { // 405 is fine for HEAD
        Alert.alert('Success', 'Connected to the API endpoint successfully!');
      } else {
        Alert.alert('Error', `Connected but received status: ${response.status}`);
      }
    } catch (error) {
      Alert.alert('Connection Failed', 'Could not reach the API endpoint. Please check the URL.');
    }
  };

  if (loading) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Settings size={32} color="#0f172a" />
        <Text style={styles.headerTitle}>App Configuration</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={20} color="#64748b" />
          <Text style={styles.sectionTitle}>Transactional Limits</Text>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Max Amount Per Transaction (₹)</Text>
          <TextInput
            style={styles.input}
            value={settings.txnLimit}
            onChangeText={(text) => setSettings({ ...settings, txnLimit: text })}
            keyboardType="numeric"
            placeholder="10000"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Daily Spending Limit (₹)</Text>
          <TextInput
            style={styles.input}
            value={settings.dailyLimit}
            onChangeText={(text) => setSettings({ ...settings, dailyLimit: text })}
            keyboardType="numeric"
            placeholder="100000"
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Globe size={20} color="#64748b" />
          <Text style={styles.sectionTitle}>Reporting & API</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Live Site API Endpoint</Text>
          <TextInput
            style={styles.input}
            value={settings.apiEndpoint}
            onChangeText={(text) => setSettings({ ...settings, apiEndpoint: text })}
            placeholder="https://your-site.com/api/report"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.inputHelp}>Local examples:</Text>
          <Text style={styles.endpointHelp}>iOS simulator: `http://127.0.0.1:8000/report`</Text>
          <Text style={styles.endpointHelp}>Android emulator: `http://10.0.2.2:8000/report`</Text>
          <Text style={styles.endpointHelp}>Physical phone: `http://YOUR_COMPUTER_IP:8000/report`</Text>
          <TouchableOpacity style={styles.testBtn} onPress={testConnection}>
            <Text style={styles.testBtnText}>Test Connection</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dashboard API Key (Optional)</Text>
          <TextInput
            style={styles.input}
            value={settings.apiKey}
            onChangeText={(text) => setSettings({ ...settings, apiKey: text })}
            placeholder="your-secure-api-key"
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.inputHelp}>Used for Authorization: Bearer <Text style={{fontWeight: '700'}}>Key</Text></Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.saveBtn, isSaved && styles.savedBtn]} 
        onPress={handleSave}
      >
        {isSaved ? (
          <>
            <CheckCircle2 color="#ffffff" size={20} />
            <Text style={styles.saveBtnText}>Configuration Saved</Text>
          </>
        ) : (
          <>
            <Save color="#ffffff" size={20} />
            <Text style={styles.saveBtnText}>Save Settings</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>UPI Simulator v1.0.0</Text>
        <Text style={styles.footerSubtext}>Built for Fraud Analysis & Training</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
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
  },
  inputHelp: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
  },
  endpointHelp: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  testBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  testBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  savedBtn: {
    backgroundColor: '#22c55e',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 4,
  },
});
