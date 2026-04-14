import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  step = 1;

  name = '';
  age = '';
  gender = '';

  selectedFile!: File;
  imagePreview: any = null;

  prediction = '';
  confidence = 0;
  doctor = '';

  loading = false;

  history: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    const data = localStorage.getItem('scanHistory');
    this.history = data ? JSON.parse(data) : [];
  }

  // ================= STEP FLOW =================
  startUpload() {
    if (!this.name || !this.age || !this.gender) {
      alert('Fill all details');
      return;
    }
    this.step = 2;
  }

  // ================= FILE SELECT =================
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => this.imagePreview = reader.result;
    reader.readAsDataURL(file);
  }

  // ================= DOCTOR MAPPING =================
  setDoctor(pred: string) {
    const p = pred.toLowerCase();

    if (p.includes('brain')) this.doctor = 'Neurologist 🧠';
    else if (p.includes('bone')) this.doctor = 'Orthopedic 🦴';
    else if (p.includes('chest')) this.doctor = 'Pulmonologist 🫁';
    else if (p.includes('kidney')) this.doctor = 'Nephrologist 🧬';
    else if (p.includes('liver')) this.doctor = 'Hepatologist 🏥';
    else this.doctor = 'General Physician 👨‍⚕️';
  }

  // ================= API CALL =================
  onUpload() {
    if (!this.selectedFile) return;

    this.loading = true;

    this.api.predict(this.selectedFile).subscribe((res: any) => {

      this.prediction = res.prediction;
      this.confidence = res.confidence;
      this.loading = false;

      this.setDoctor(this.prediction);

      const record = {
        prediction: this.prediction,
        confidence: this.confidence,
        image: this.imagePreview,
        doctor: this.doctor,
        date: new Date()
      };

      this.history.unshift(record);
      localStorage.setItem('scanHistory', JSON.stringify(this.history));
    });
  }

  // ================= DOWNLOAD BUTTON =================
  downloadPDF() {
    if (!this.prediction) {
      alert('No report available');
      return;
    }

    this.generateReport();
  }

  // ================= PDF GENERATION =================
  generateReport() {

  const doc = new jsPDF();
  const date = new Date().toLocaleString();

  // ================= HEADER =================
  doc.setFillColor(0, 114, 255);
  doc.rect(0, 0, 210, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('Healthcare Scan Assessment Platform', 15, 15);

  doc.setFontSize(11);
  doc.text('AI Diagnostic Report', 150, 15);

  doc.setTextColor(0, 0, 0);

  // ================= PATIENT BOX =================
  doc.setDrawColor(0, 114, 255);
  doc.rect(15, 35, 180, 40);

  doc.setFontSize(13);
  doc.text('Patient Details', 20, 43);

  doc.setFontSize(10);
  doc.text(`Name: ${this.name}`, 20, 52);
  doc.text(`Age: ${this.age}`, 20, 58);
  doc.text(`Gender: ${this.gender}`, 20, 64);
  doc.text(`Date: ${date}`, 120, 52);
  doc.text(`Scan Type: Image Analysis`, 120, 58);

  // ================= RESULT BOX =================
  let risk = '';
  if (this.confidence < 40) risk = 'Low Risk';
  else if (this.confidence < 70) risk = 'Moderate Risk';
  else risk = 'High Risk';

  doc.setDrawColor(34, 197, 94);
  doc.rect(15, 85, 180, 50);

  doc.setFontSize(13);
  doc.text('Prediction Result', 20, 93);

  doc.setFontSize(10);
  doc.text(`Diagnosis: ${this.prediction}`, 20, 103);
  doc.text(`Confidence: ${this.confidence}%`, 20, 110);
  doc.text(`Risk Level: ${risk}`, 20, 117);
  doc.text(`Recommended Doctor: ${this.doctor}`, 20, 124);

  // Highlight result
  if (this.prediction.toLowerCase() === 'normal') {
    doc.setTextColor(34, 197, 94);
  } else {
    doc.setTextColor(220, 38, 38);
  }
  doc.setFontSize(12);
  doc.text(`Result: ${this.prediction}`, 120, 110);
  doc.setTextColor(0, 0, 0);

  // ================= MODEL TABLE =================
  doc.setFontSize(13);
  doc.text('Model Information', 20, 150);

  doc.setFontSize(10);

  doc.rect(20, 155, 170, 30);

  doc.text('Model', 25, 165);
  doc.text('MobileNetV2', 100, 165);

  doc.text('Evolution', 25, 173);
  doc.text('SVM -> VGG16 -> MobileNetV2', 100, 173);

  doc.text('Accuracy', 25, 181);
  doc.text('~94%', 100, 181);

  // ================= ANALYSIS BOX =================
  doc.setDrawColor(0, 0, 0);
  doc.rect(15, 195, 180, 35);

  doc.setFontSize(13);
  doc.text('Analysis Summary', 20, 203);

  doc.setFontSize(10);
  doc.text('- Image preprocessing', 20, 212);
  doc.text('- Feature extraction using CNN', 20, 218);
  doc.text('- Pattern recognition & classification', 20, 224);

  // ================= INTERPRETATION =================
  doc.setFontSize(13);
  doc.text('Interpretation', 20, 245);

  doc.setFontSize(10);

  if (this.prediction.toLowerCase() === 'normal') {
    doc.text('- No abnormality detected', 20, 252);
    doc.text('- Maintain healthy lifestyle', 20, 258);
  } else {
    doc.text('- Possible disease detected', 20, 252);
    doc.text('- Consult specialist doctor', 20, 258);
  }

  // ================= FOOTER =================
  doc.setFontSize(9);
  doc.setTextColor(120);

  doc.text(
    'Disclaimer: This is an AI-generated report and should not replace professional medical advice.',
    15,
    280
  );

  doc.text('Generated by MediAI System', 15, 287);

  // ================= SAVE =================
  doc.save('Healthcare_Report.pdf');
}
}
