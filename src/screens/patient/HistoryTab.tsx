import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePatientPortal } from '../../context/PatientPortalContext';
import { colors } from '../../theme/colors';

export default function HistoryTab() {
  const { history, fetchHistory } = usePatientPortal();

  useFocusEffect(
    useCallback(() => {
      void fetchHistory();
    }, [fetchHistory])
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Visit History</Text>
      {history.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="time-outline" size={56} color={colors.slate300} />
          <Text style={styles.emptyTitle}>No past visits</Text>
          <Text style={styles.emptySub}>
            Your completed and cancelled appointments will appear here.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {history.map((item) => (
            <View key={item._id} style={styles.rowCard}>
              <View style={styles.iconWrap}>
                <Ionicons name="calendar" size={22} color={colors.slate500} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dr}>Dr. {item.serviceName}</Text>
                <Text style={styles.date}>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—'}
                </Text>
                <Text style={styles.token}>Token: #{item.tokenNumber}</Text>
              </View>
              <View
                style={[
                  styles.badge,
                  item.status === 'cancelled' ? styles.badgeRed : styles.badgeGreen,
                ]}
              >
                <Text
                  style={[
                    styles.badgeTxt,
                    item.status === 'cancelled' ? styles.badgeTxtR : styles.badgeTxtG,
                  ]}
                >
                  {item.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.slate50 },
  content: { padding: 16, paddingBottom: 32 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: colors.slate800, marginBottom: 18 },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.slate800, marginTop: 12 },
  emptySub: { color: colors.slate500, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.slate50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dr: { fontSize: 17, fontWeight: '700', color: colors.slate800 },
  date: { color: colors.slate500, fontSize: 13, fontWeight: '500', marginTop: 4 },
  token: { color: colors.slate400, fontSize: 12, marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeRed: { backgroundColor: colors.red50 },
  badgeGreen: { backgroundColor: colors.green50 },
  badgeTxt: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  badgeTxtR: { color: colors.red600 },
  badgeTxtG: { color: colors.green600 },
});
