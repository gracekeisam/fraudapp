import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Share } from 'react-native';
import { CheckCircle2, Share2, ArrowLeft } from 'lucide-react-native';
import { Transaction } from '@/utils/storage';

interface PaymentSuccessProps {
  transaction: Transaction;
  onClose: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ transaction, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Transaction info: \nUTR: ${transaction.utr}\nAmount: ₹${transaction.amount}\nTo: ${transaction.vpa}\nStatus: ${transaction.status}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
        <View style={styles.iconContainer}>
          <CheckCircle2 color="#22c55e" size={80} />
        </View>
        
        <Text style={styles.statusText}>Payment Successful</Text>
        <Text style={styles.amount}>₹{transaction.amount}</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>To:</Text>
            <Text style={styles.value}>{transaction.vpa}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>UTR (ID):</Text>
            <Text style={styles.value}>{transaction.utr}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>{new Date(transaction.timestamp).toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share2 color="#3b82f6" size={20} />
            <Text style={styles.shareText}>Share Details</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <TouchableOpacity style={styles.backButton} onPress={onClose}>
        <ArrowLeft color="#64748b" size={24} />
        <Text style={styles.backText}>Back to Simulator</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  iconContainer: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  amount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 24,
  },
  detailsContainer: {
    width: '100%',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  actions: {
    marginTop: 24,
    width: '100%',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  shareText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
});
