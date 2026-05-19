import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Vibration,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePatientPortal } from '../../context/PatientPortalContext';
import { colors } from '../../theme/colors';

export default function HistoryTab() {
  const { history, fetchHistory } = usePatientPortal();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      void fetchHistory();
    }, [fetchHistory])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [history]);

  const onCardPress = () => {
    Vibration.vibrate(25);
  };

  return (
    <View style={styles.root}>
      {/* Background Ambient Glows */}
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.head}>
          <Text style={styles.pageTitle}>Visit History</Text>
          <Text style={styles.subTitle}>Aapki purani visit ki mukammal tafseelaat.</Text>
        </View>

        {history.length === 0 ? (
          <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <LinearGradient
              colors={['#111827', '#0b0f19']}
              style={styles.emptyCard}
            >
              <View style={styles.emptyIconContainer}>
                <Ionicons name="calendar-outline" size={32} color={colors.primary500} />
              </View>
              <Text style={styles.emptyTitle}>No past visits</Text>
              <Text style={styles.emptySub}>
                Aapki completed aur cancelled appointments ki history yahan par zahir hogi.
              </Text>
            </LinearGradient>
          </Animated.View>
        ) : (
          <Animated.View style={[styles.listWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {history.map((item, idx) => {
              const isCancelled = item.status === 'cancelled';
              const isLast = idx === history.length - 1;

              return (
                <Pressable key={item._id} onPress={onCardPress} style={styles.rowPressable}>
                  <View style={styles.timelineRow}>
                    {/* Left Timeline Channel */}
                    <View style={styles.timelineLeft}>
                      {/* Vertical line connector */}
                      {!isLast && <View style={styles.verticalLine} />}
                      
                      {/* Glowing Node Dot */}
                      <View
                        style={[
                          styles.statusNode,
                          isCancelled ? styles.nodeCancelled : styles.nodeCompleted,
                        ]}
                      >
                        <Ionicons
                          name={isCancelled ? 'close' : 'checkmark'}
                          size={14}
                          color={isCancelled ? colors.red500 : colors.primary500}
                        />
                      </View>
                    </View>

                    {/* Right Timeline Card Content */}
                    <View style={styles.cardContainer}>
                      <LinearGradient
                        colors={['#111827', '#0b0f19']}
                        style={styles.historyCard}
                      >
                        <View style={styles.cardHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.drName}>Dr. {item.serviceName}</Text>
                            <Text style={styles.specTxt}>Specialist Doctor</Text>
                          </View>
                          
                          {/* Modern Status Badge */}
                          <View
                            style={[
                              styles.statusBadge,
                              isCancelled ? styles.badgeCancelled : styles.badgeCompleted,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                isCancelled ? styles.textCancelled : styles.textCompleted,
                              ]}
                            >
                              {isCancelled ? 'Cancelled' : 'Completed'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Card Details Footer */}
                        <View style={styles.cardFooter}>
                          <View style={styles.footerItem}>
                            <Ionicons name="calendar-outline" size={13} color="#64748b" />
                            <Text style={styles.footerText}>
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </Text>
                          </View>

                          <View style={styles.footerItem}>
                            <Ionicons name="ticket-outline" size={13} color="#64748b" />
                            <Text style={styles.footerText}>Token #{item.tokenNumber}</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#070a13', position: 'relative' },
  flex: { flex: 1 },
  glowTop: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(20, 184, 166, 0.05)',
    opacity: 0.8,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
    opacity: 0.8,
  },
  content: { padding: 20, paddingBottom: 40 },
  head: { marginBottom: 24, marginTop: 10 },
  pageTitle: { fontSize: 24, fontWeight: '900', color: '#f8fafc', letterSpacing: -0.5 },
  subTitle: { color: '#64748b', fontSize: 13, marginTop: 4, fontWeight: '500' },
  
  // Empty State
  emptyContainer: { flex: 1, marginTop: 40 },
  emptyCard: {
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.15)',
  },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#f8fafc' },
  emptySub: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontSize: 13,
    fontWeight: '500',
    maxWidth: 260,
  },

  // Timeline & List
  listWrapper: { paddingLeft: 4 },
  rowPressable: { marginBottom: 16 },
  timelineRow: { flexDirection: 'row', position: 'relative' },
  
  timelineLeft: {
    width: 32,
    alignItems: 'center',
    position: 'relative',
    marginRight: 8,
  },
  verticalLine: {
    position: 'absolute',
    top: 32,
    bottom: -16,
    left: 15,
    width: 2,
    backgroundColor: '#1e293b',
  },
  statusNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodeCompleted: {
    backgroundColor: 'rgba(20, 184, 166, 0.08)',
    borderColor: 'rgba(20, 184, 166, 0.25)',
  },
  nodeCancelled: {
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderColor: 'rgba(220, 38, 38, 0.25)',
  },

  // Card Content
  cardContainer: { flex: 1 },
  historyCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drName: { fontSize: 16, fontWeight: '900', color: '#f8fafc' },
  specTxt: { fontSize: 11, color: '#64748b', fontWeight: '600', marginTop: 2 },
  
  // Status Badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeCompleted: {
    backgroundColor: 'rgba(20, 184, 166, 0.06)',
    borderColor: 'rgba(20, 184, 166, 0.15)',
  },
  badgeCancelled: {
    backgroundColor: 'rgba(220, 38, 38, 0.06)',
    borderColor: 'rgba(220, 38, 38, 0.15)',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textCompleted: { color: colors.primary500 },
  textCancelled: { color: colors.red500 },

  // Card Footer Info
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
});
