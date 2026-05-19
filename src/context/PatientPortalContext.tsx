import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Alert, Vibration } from 'react-native';
import {
  cancelQueue,
  createPayment,
  getAllDoctors,
  getMyReports,
  getQueueHistory,
  getQueueStatus,
  joinQueue,
} from '../api/client';
import { useAuth } from './AuthContext';
import type {
  Doctor,
  JoinFormState,
  MedicalReportItem,
  PaymentMethod,
  QueueStatus,
  ReceiptData,
} from '../types';
import { localDateInputValue } from '../utils/dateInput';
import { socketService } from '../api/socket';
import {
  registerForPushNotificationsAsync,
  scheduleQueueNotification,
  dismissActiveQueueNotification,
} from '../utils/notifications';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  easypaisa: 'Easypaisa',
  jazzcash: 'JazzCash',
  card: 'Online Card',
};

type HistoryRow = {
  _id: string;
  tokenNumber: number;
  serviceName: string;
  status: string;
  createdAt?: string;
};

export type InAppNotificationData = { title: string; body: string } | null;

type PatientPortalContextValue = {
  userName: string;
  doctors: Doctor[];
  queueStatus: QueueStatus | null;
  history: HistoryRow[];
  reports: MedicalReportItem[];
  loading: boolean;
  message: string;
  error: string;
  joinForm: JoinFormState;
  setJoinForm: React.Dispatch<React.SetStateAction<JoinFormState>>;
  showGateway: boolean;
  gatewayStep: 'phone' | 'otp' | 'processing' | 'success';
  gatewayPhone: string;
  setGatewayPhone: (s: string) => void;
  gatewayOtp: string;
  setGatewayOtp: (s: string) => void;
  showReceipt: boolean;
  receiptData: ReceiptData | null;
  setShowReceipt: (v: boolean) => void;
  fetchQueueStatus: () => Promise<void>;
  fetchDoctors: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  fetchReports: () => Promise<void>;
  handleJoinQueue: () => Promise<void>;
  handleCancelQueue: () => void;
  clearGateway: () => void;
  handleGatewayNext: () => void;
  gatewayBackToPhone: () => void;
  dismissToast: () => void;
  inAppNotification: InAppNotificationData;
  setInAppNotification: React.Dispatch<React.SetStateAction<InAppNotificationData>>;
};

const PatientPortalContext = createContext<PatientPortalContextValue | null>(null);

export function PatientPortalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [reports, setReports] = useState<MedicalReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [joinForm, setJoinForm] = useState<JoinFormState>({
    serviceName: '',
    priority: 'normal',
    appointmentDate: localDateInputValue(),
    notes: '',
    totalAmount: '',
    paymentMethod: 'card',
  });
  const [showGateway, setShowGateway] = useState(false);
  const [gatewayStep, setGatewayStep] = useState<
    'phone' | 'otp' | 'processing' | 'success'
  >('phone');
  const [gatewayPhone, setGatewayPhone] = useState('');
  const [gatewayOtp, setGatewayOtp] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [inAppNotification, setInAppNotification] = useState<InAppNotificationData>(null);
  const pendingBookingRef = useRef<JoinFormState | null>(null);
  const gatewayTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const prevPeopleAheadRef = useRef<number | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    if (user) {
      socketService.connect();
      socketService.on('queueUpdated', () => {
        void fetchQueueStatus();
      });
      socketService.on('queueCompleted', () => {
        void fetchQueueStatus();
      });
    } else {
      socketService.disconnect();
      void dismissActiveQueueNotification();
    }
    return () => {
      socketService.disconnect();
    };
  }, [user]);

  const clearGatewayTimers = useCallback(() => {
    gatewayTimersRef.current.forEach((id) => clearTimeout(id));
    gatewayTimersRef.current = [];
  }, []);

  const dismissToast = useCallback(() => {
    setMessage('');
    setError('');
  }, []);

  useEffect(() => {
    if (!message && !error) return;
    const t = setTimeout(dismissToast, 5000);
    return () => clearTimeout(t);
  }, [message, error, dismissToast]);

  const fetchDoctors = useCallback(async () => {
    try {
      const res = await getAllDoctors();
      setDoctors(res.data as Doctor[]);
    } catch {
      setDoctors([]);
    }
  }, []);

  const fetchQueueStatus = useCallback(async () => {
    try {
      const res = await getQueueStatus();
      const newStatus = res.data as QueueStatus;
      
      if (
        newStatus &&
        typeof newStatus.peopleAhead === 'number' &&
        prevPeopleAheadRef.current !== null &&
        prevPeopleAheadRef.current > newStatus.peopleAhead
      ) {
        if (newStatus.peopleAhead <= 4 && newStatus.peopleAhead >= 0) {
          if (prevPeopleAheadRef.current > 4 || newStatus.peopleAhead === 0) {
            setInAppNotification({
              title: newStatus.peopleAhead === 0 ? "It's your turn!" : "Queue Update",
              body: newStatus.peopleAhead === 0 
                ? "Please proceed to the doctor's room now."
                : `Only ${newStatus.peopleAhead} people ahead. Approx ${newStatus.estimatedTime} mins wait.`,
            });
            setTimeout(() => setInAppNotification(null), 8000);
          }
        }
      }
      
      if (newStatus) {
        // Trigger/Update Foreground Persistent Notification
        void scheduleQueueNotification(
          newStatus.yourToken,
          newStatus.peopleAhead,
          newStatus.estimatedTime,
          newStatus.serviceName,
          newStatus.currentServing
        );

        // Sound/Vibration near turn: Vibrate when peopleAhead <= 3 (critical area)
        if (newStatus.peopleAhead <= 3 && newStatus.peopleAhead >= 0) {
          Vibration.vibrate([0, 500, 200, 500]);
        }

        prevPeopleAheadRef.current = newStatus.peopleAhead;
      }
      setQueueStatus(newStatus);
    } catch (e: unknown) {
      if ((e as { response?: { status?: number } }).response?.status === 404) {
        setQueueStatus(null);
        prevPeopleAheadRef.current = null;
        // Dismiss foreground notification if queue does not exist
        void dismissActiveQueueNotification();
      }
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await getQueueHistory();
      setHistory((res.data?.history as HistoryRow[]) || []);
    } catch {
      setHistory([]);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const res = await getMyReports();
      setReports((res.data?.reports as MedicalReportItem[]) || []);
    } catch {
      setReports([]);
    }
  }, []);

  useEffect(() => {
    void fetchDoctors();
    void fetchQueueStatus();
    const id = setInterval(() => void fetchQueueStatus(), 30000);
    return () => clearInterval(id);
  }, [fetchDoctors, fetchQueueStatus]);

  useEffect(() => {
    return () => clearGatewayTimers();
  }, [clearGatewayTimers]);

  const processJoinQueue = async (form: JoinFormState) => {
    const doctorObj = doctors.find((d) => d.name === form.serviceName);
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const queueRes = await joinQueue({
        serviceName: form.serviceName,
        priority: form.priority,
        appointmentDate: form.appointmentDate,
        notes: form.notes,
      });

      const data = queueRes.data as {
        _id: string;
        tokenNumber: number;
        message?: string;
      };
      const newQueueId = data._id;
      const fee =
        typeof form.totalAmount === 'number' && form.totalAmount > 0
          ? form.totalAmount
          : Number(doctorObj?.consultationFee) > 0
            ? Number(doctorObj?.consultationFee)
            : 1000;

      if (newQueueId && doctorObj) {
        const pm = form.paymentMethod;
        const isWallet = pm === 'easypaisa' || pm === 'jazzcash';
        try {
          await createPayment({
            queueId: newQueueId,
            doctorId: doctorObj._id,
            totalAmount: fee,
            paymentMethod: isWallet ? 'online' : pm,
            ...(isWallet ? { walletChannel: pm } : {}),
          });
        } catch (payErr) {
          try {
            await cancelQueue();
          } catch {
            /* ignore */
          }
          throw payErr;
        }
      }

      const bookedAt = new Date();
      const pm = form.paymentMethod;
      setReceiptData({
        tokenNumber: data.tokenNumber,
        patientName: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        doctorName: form.serviceName,
        appointmentDate: form.appointmentDate,
        bookingTime: bookedAt.toLocaleString('en-PK', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        priority: form.priority,
        notes: form.notes,
        totalAmount: fee,
        paymentMethod: pm,
        paymentMethodLabel: PAYMENT_LABELS[pm] || pm,
        paidViaLastDigits: form.paidViaLastDigits || null,
      });
      setShowReceipt(true);
      setMessage('Appointment booked successfully!');
      await fetchQueueStatus();
      setJoinForm({
        serviceName: '',
        priority: 'normal',
        appointmentDate: localDateInputValue(),
        notes: '',
        totalAmount: '',
        paymentMethod: 'card',
      });
    } catch (err: unknown) {
      const apiMsg = (err as { response?: { data?: { message?: unknown } } }).response?.data
        ?.message;
      const line =
        typeof apiMsg === 'string' ? apiMsg : (apiMsg as { message?: string })?.message;
      setError(line || (err as Error).message || 'Booking failed');
      await fetchQueueStatus();
    } finally {
      pendingBookingRef.current = null;
      setLoading(false);
      setShowGateway(false);
      setGatewayStep('phone');
      setGatewayPhone('');
      setGatewayOtp('');
      clearGatewayTimers();
    }
  };

  const handleJoinQueue = async () => {
    setError('');
    setMessage('');
    try {
      await getQueueStatus();
      setError(
        'You are already in an active queue. Please wait for your turn or cancel your current queue first.'
      );
      return;
    } catch (err: unknown) {
      if ((err as { response?: { status?: number } }).response?.status !== 404) {
        const apiMsg = (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
        setError(typeof apiMsg === 'string' ? apiMsg : 'Status check failed');
        return;
      }
    }

    if (!joinForm.serviceName || !joinForm.appointmentDate) {
      setError('Please select a doctor and appointment date.');
      return;
    }

    const snapshot: JoinFormState = { ...joinForm };
    pendingBookingRef.current = snapshot;

    if (['easypaisa', 'jazzcash', 'card'].includes(joinForm.paymentMethod)) {
      clearGatewayTimers();
      setGatewayStep('phone');
      setGatewayPhone('');
      setGatewayOtp('');
      setShowGateway(true);
    } else {
      await processJoinQueue(snapshot);
    }
  };

  const handleGatewayNext = () => {
    if (gatewayStep === 'phone') {
      if (!gatewayPhone.trim()) {
        setError('Please enter your details');
        return;
      }
      setError('');
      setGatewayStep('otp');
      return;
    }
    if (gatewayStep === 'otp') {
      setError('');
      const locked =
        pendingBookingRef.current && pendingBookingRef.current.serviceName
          ? { ...pendingBookingRef.current }
          : { ...joinForm };
      if (!locked.serviceName || !locked.appointmentDate) {
        setError('Missing details. Please check the form again.');
        return;
      }
      setGatewayStep('processing');
      clearGatewayTimers();

      const digits = String(gatewayPhone).replace(/\D/g, '');
      let paidViaLastDigits: string | null = null;
      if (locked.paymentMethod === 'easypaisa' || locked.paymentMethod === 'jazzcash') {
        paidViaLastDigits = digits.slice(-4) || null;
      } else if (locked.paymentMethod === 'card') {
        paidViaLastDigits = digits.slice(-4) || null;
      }
      const payload = paidViaLastDigits ? { ...locked, paidViaLastDigits } : locked;

      const t1 = setTimeout(() => {
        setGatewayStep('success');
        const t2 = setTimeout(() => {
          void processJoinQueue(payload);
        }, 1500);
        gatewayTimersRef.current.push(t2);
      }, 2000);
      gatewayTimersRef.current.push(t1);
    }
  };

  const clearGateway = useCallback(() => {
    clearGatewayTimers();
    pendingBookingRef.current = null;
    setShowGateway(false);
    setGatewayStep('phone');
    setGatewayPhone('');
    setGatewayOtp('');
  }, [clearGatewayTimers]);

  const gatewayBackToPhone = useCallback(() => {
    setError('');
    setGatewayStep('phone');
  }, []);

  const handleCancelQueue = useCallback(() => {
    Alert.alert('Cancel queue?', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await cancelQueue();
            setMessage('Queue cancelled successfully');
            setQueueStatus(null);
            await fetchQueueStatus();
          } catch (e: unknown) {
            const apiMsg = (e as { response?: { data?: { message?: string } } }).response?.data
              ?.message;
            setError(typeof apiMsg === 'string' ? apiMsg : 'Failed to cancel');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }, [fetchQueueStatus]);

  const value: PatientPortalContextValue = {
    userName: user?.name || 'Patient',
    doctors,
    queueStatus,
    history,
    reports,
    loading,
    message,
    error,
    joinForm,
    setJoinForm,
    showGateway,
    gatewayStep,
    gatewayPhone,
    setGatewayPhone,
    gatewayOtp,
    setGatewayOtp,
    showReceipt,
    receiptData,
    setShowReceipt,
    fetchQueueStatus,
    fetchDoctors,
    fetchHistory,
    fetchReports,
    handleJoinQueue,
    handleCancelQueue,
    clearGateway,
    handleGatewayNext,
    gatewayBackToPhone,
    dismissToast,
    inAppNotification,
    setInAppNotification,
  };

  return (
    <PatientPortalContext.Provider value={value}>{children}</PatientPortalContext.Provider>
  );
}

export function usePatientPortal() {
  const ctx = useContext(PatientPortalContext);
  if (!ctx) throw new Error('usePatientPortal must be used within PatientPortalProvider');
  return ctx;
}
