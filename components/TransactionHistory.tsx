import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react-native';
import { Transaction } from '@/utils/storage';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const renderItem = ({ item }: { item: Transaction }) => {
    const isSuccess = item.status === 'SUCCESS';
    const isFailed = item.status === 'FAILED';
    const isPending = item.status === 'PENDING';

    return (
      <View style={styles.itemCard}>
        <View style={styles.iconContainer}>
          {isSuccess && <CheckCircle2 color="#22c55e" size={24} />}
          {isFailed && <XCircle color="#ef4444" size={24} />}
          {isPending && <Clock color="#f59e0b" size={24} />}
        </View>
        
        <View style={styles.details}>
          <Text style={styles.vpa}>{item.vpa}</Text>
          <View style={styles.metadataRow}>
            {item.location && <View style={styles.metaBadge}><Text style={styles.metaText}>📍 Geo</Text></View>}
            {item.deviceInfo && <View style={styles.metaBadge}><Text style={styles.metaText}>📱 {item.deviceInfo.model}</Text></View>}
          </View>
          <Text style={styles.utr}>UTR: {item.utr}</Text>
          <Text style={styles.time}>{new Date(item.timestamp).toLocaleString()}</Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: isSuccess ? '#22c55e' : '#0f172a' }]}>
            ₹{item.amount}
          </Text>
          <Text style={[styles.status, { color: isSuccess ? '#22c55e' : isFailed ? '#ef4444' : '#f59e0b' }]}>
            {item.status}
          </Text>
        </View>
      </View>
    );
  };

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyState}>
        <AlertCircle color="#64748b" size={48} />
        <Text style={styles.emptyText}>No recent simulations</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconContainer: {
    marginRight: 16,
  },
  details: {
    flex: 1,
  },
  vpa: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  metadataRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  metaBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  utr: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: '#94a3b8',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  status: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    opacity: 0.6,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
});
