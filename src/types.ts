export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
};

export type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  consultationFee?: number;
  slotDuration?: number;
  maxPatientsPerDay?: number;
  degree?: string;
  experience?: number;
  specializedFrom?: string;
  about?: string;
  schedule?: Array<{
    day: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
};

export type QueueStatus = {
  _id: string;
  serviceName?: string;
  currentServing: number;
  yourToken: number;
  peopleAhead: number;
  estimatedTime: number;
  status: string;
  priority: string;
  appointmentDate?: string;
  notes?: string;
};

/** Web Book tab: card, easypaisa, jazzcash only */
export type PaymentMethod = 'card' | 'easypaisa' | 'jazzcash';

export type JoinFormState = {
  serviceName: string;
  priority: 'normal' | 'emergency';
  appointmentDate: string;
  notes: string;
  totalAmount: number | '';
  paymentMethod: PaymentMethod;
  paidViaLastDigits?: string | null;
};

export type ReceiptData = {
  tokenNumber: number;
  patientName: string;
  email: string;
  phone: string;
  doctorName: string;
  appointmentDate: string;
  bookingTime: string;
  priority: string;
  notes: string;
  totalAmount: number;
  paymentMethod: string;
  paymentMethodLabel: string;
  paidViaLastDigits?: string | null;
};

export type MedicalReportItem = {
  _id: string;
  diagnosis: string;
  symptoms?: string;
  doctorNotes?: string;
  bloodPressure?: string;
  temperature?: string;
  weight?: string;
  followUp?: boolean;
  nextAppointment?: string;
  createdAt: string;
  patient?: { name?: string; email?: string; phone?: string };
  doctor?: { name?: string; specialization?: string; phone?: string };
  queue?: { serviceName?: string; tokenNumber?: number; appointmentDate?: string };
  prescription?: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
};
