import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PatientPortalProvider } from '../context/PatientPortalContext';
import { colors } from '../theme/colors';
import PatientNavbar from '../components/PatientNavbar';
import PortalToast from '../components/PortalToast';
import PatientMaterialTabs from '../navigation/PatientTabs';
import PaymentGatewayModal from '../components/PaymentGatewayModal';
import AppointmentReceiptModal from '../components/AppointmentReceiptModal';

function PatientPortalLayout() {
  return (
    <View style={styles.root}>
      <PatientNavbar />
      <PortalToast />
      <View style={{ flex: 1 }}>
        <PatientMaterialTabs />
      </View>
      <PaymentGatewayModal />
      <AppointmentReceiptModal />
    </View>
  );
}

export default function PatientPortalRoot() {
  return (
    <PatientPortalProvider>
      <PatientPortalLayout />
    </PatientPortalProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.slate50 },
});
