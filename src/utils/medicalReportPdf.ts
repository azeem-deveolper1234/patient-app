import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { CLINIC_BRAND } from '../constants/app';
import type { MedicalReportItem } from '../types';

function formatDate(raw: string | undefined) {
  if (!raw) return '—';
  const d = new Date(raw);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(text: string) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildMedicalReportHtml(
  report: MedicalReportItem,
  patientName?: string,
  patientEmail?: string,
  patientPhone?: string
) {
  const name = report.patient?.name || patientName || 'Patient';
  const email = report.patient?.email || patientEmail || '—';
  const phone = report.patient?.phone || patientPhone || '—';
  const reportId = report._id ? `MR-${report._id.slice(-8).toUpperCase()}` : 'MR-LOCAL';

  const prescriptionRows =
    report.prescription && report.prescription.length > 0
      ? report.prescription
          .map(
            (med) => `
        <tr>
          <td>${escapeHtml(med.medicineName || '—')}</td>
          <td>${escapeHtml(med.dosage || '—')}</td>
          <td>${escapeHtml(med.frequency || '—')}</td>
          <td style="text-align:center">${escapeHtml(med.duration || '—')}</td>
        </tr>`
          )
          .join('')
      : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 24px; }
    .header { background: linear-gradient(135deg, #1e1b4b, #312e81); color: white; padding: 28px; text-align: center; border-radius: 12px 12px 0 0; }
    .header h1 { margin: 0; font-size: 22px; }
    .header p { margin: 8px 0 0; font-size: 11px; opacity: 0.85; }
    .badge { display: inline-block; margin-top: 14px; padding: 6px 16px; border-radius: 999px; background: rgba(255,255,255,0.15); font-size: 10px; letter-spacing: 1px; text-transform: uppercase; font-weight: bold; }
    .body { padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; }
    .meta { display: flex; justify-content: space-between; background: #f8fafc; padding: 14px; border-radius: 10px; margin-bottom: 20px; }
    .meta span { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; display: block; }
    .meta strong { font-size: 13px; }
    .grid { display: flex; gap: 20px; margin-bottom: 20px; }
    .col { flex: 1; }
    .section-title { font-size: 11px; font-weight: bold; color: #312e81; text-transform: uppercase; border-bottom: 1px solid #e0e7ff; padding-bottom: 6px; margin-bottom: 10px; }
    .field { margin-bottom: 8px; }
    .field label { font-size: 9px; color: #94a3b8; text-transform: uppercase; display: block; }
    .field p { margin: 2px 0 0; font-size: 13px; font-weight: 600; }
    .vitals { display: flex; gap: 10px; margin-bottom: 20px; }
    .vital { flex: 1; text-align: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 8px; }
    .vital label { font-size: 8px; color: #94a3b8; text-transform: uppercase; display: block; }
    .vital strong { font-size: 14px; }
    .diagnosis { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 10px; padding: 14px; margin-bottom: 16px; }
    .diagnosis label { font-size: 9px; color: #4338ca; text-transform: uppercase; }
    .diagnosis p { margin: 6px 0 0; font-size: 15px; font-weight: bold; color: #312e81; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 8px; }
    th { background: #f1f5f9; text-align: left; padding: 8px; font-size: 9px; text-transform: uppercase; color: #64748b; }
    td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
    .notes { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px; margin-top: 14px; font-size: 12px; }
    .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(CLINIC_BRAND.fullName)}</h1>
    <p>Smart Health Center & Virtual Queue Management</p>
    <div class="badge">Official Diagnostic & Prescription Report</div>
  </div>
  <div class="body">
    <div class="meta">
      <div><span>Report ID</span><strong>${reportId}</strong></div>
      <div style="text-align:right"><span>Date of Issue</span><strong>${formatDate(report.createdAt)}</strong></div>
    </div>
    <div class="grid">
      <div class="col">
        <div class="section-title">Patient Details</div>
        <div class="field"><label>Full Name</label><p>${escapeHtml(name)}</p></div>
        <div class="field"><label>Email</label><p>${escapeHtml(email)}</p></div>
        <div class="field"><label>Phone</label><p>${escapeHtml(phone)}</p></div>
      </div>
      <div class="col">
        <div class="section-title">Attending Consultant</div>
        <div class="field"><label>Doctor Name</label><p>Dr. ${escapeHtml(report.doctor?.name || 'Specialist')}</p></div>
        <div class="field"><label>Specialization</label><p>${escapeHtml(report.doctor?.specialization || 'Consultant')}</p></div>
        ${report.queue?.tokenNumber ? `<div class="field"><label>Token</label><p>#${report.queue.tokenNumber}</p></div>` : ''}
      </div>
    </div>
    <div class="section-title">Patient Vitals</div>
    <div class="vitals">
      <div class="vital"><label>Blood Pressure</label><strong>${escapeHtml(report.bloodPressure || '—')}</strong></div>
      <div class="vital"><label>Temperature</label><strong>${escapeHtml(report.temperature || '—')}</strong></div>
      <div class="vital"><label>Weight</label><strong>${escapeHtml(report.weight || '—')}</strong></div>
    </div>
    ${report.symptoms ? `<div class="field"><label>Symptoms</label><p>${escapeHtml(report.symptoms)}</p></div>` : ''}
    <div class="diagnosis"><label>Clinical Diagnosis</label><p>${escapeHtml(report.diagnosis || '—')}</p></div>
    ${
      prescriptionRows
        ? `<div class="section-title">Prescription (Rx)</div>
    <table><thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead><tbody>${prescriptionRows}</tbody></table>`
        : ''
    }
    ${report.doctorNotes ? `<div class="notes"><strong>Advice & Directives</strong><br/>${escapeHtml(report.doctorNotes)}</div>` : ''}
    ${
      report.followUp && report.nextAppointment
        ? `<p style="margin-top:14px;font-size:12px;"><strong>Follow-up:</strong> ${formatDate(report.nextAppointment)}</p>`
        : ''
    }
    <div class="footer">
      Electronically generated by ${escapeHtml(CLINIC_BRAND.fullName)} Smart Queue System.<br/>
      ${escapeHtml(CLINIC_BRAND.fullName)} • Lahore, Pakistan
    </div>
  </div>
</body>
</html>`;
}

export async function generateReportPdfUri(
  report: MedicalReportItem,
  patientName?: string,
  patientEmail?: string,
  patientPhone?: string
) {
  const html = buildMedicalReportHtml(report, patientName, patientEmail, patientPhone);
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export async function shareMedicalReportPdf(
  report: MedicalReportItem,
  patientName?: string,
  patientEmail?: string,
  patientPhone?: string
) {
  const uri = await generateReportPdfUri(report, patientName, patientEmail, patientPhone);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: 'Share medical report',
    });
  }
  return uri;
}

export async function saveMedicalReportToPhone(
  report: MedicalReportItem,
  patientName?: string,
  patientEmail?: string,
  patientPhone?: string
) {
  const uri = await generateReportPdfUri(report, patientName, patientEmail, patientPhone);
  const safeName = (report.diagnosis || 'report').replace(/[^\w\-]+/g, '_').slice(0, 40);
  const fileName = `MedicalReport_${safeName}_${Date.now()}.pdf`;
  const dest = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}
