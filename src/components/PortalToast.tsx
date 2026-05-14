import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePatientPortal } from '../context/PatientPortalContext';
import { colors } from '../theme/colors';

export default function PortalToast() {
  const { message, error, dismissToast } = usePatientPortal();
  if (!message && !error) return null;
  const isOk = !!message;
  return (
    <Pressable onPress={dismissToast} style={styles.wrap}>
      <View style={[styles.pill, isOk ? styles.pillOk : styles.pillErr]}>
        <Ionicons
          name={isOk ? 'checkmark-circle' : 'alert-circle'}
          size={18}
          color="#fff"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.text}>{message || error}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 50,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    maxWidth: '100%',
  },
  pillOk: { backgroundColor: 'rgba(34,197,94,0.95)' },
  pillErr: { backgroundColor: 'rgba(239,68,68,0.95)' },
  text: { color: '#fff', fontWeight: '600', fontSize: 13, flexShrink: 1 },
});
