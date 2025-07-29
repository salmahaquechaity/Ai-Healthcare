// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medical_ai';

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Schemas
const PatientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  symptoms: String,
  history: String
});
const DoctorSchema = new mongoose.Schema({
  name: String,
  specialization: String,
  address: String,
  available_time: [String]
});
const AppointmentSchema = new mongoose.Schema({
  patient: String,
  doctorId: mongoose.Schema.Types.ObjectId,
  time: String,
  date: String
});

const Patient = mongoose.model('Patient', PatientSchema);
const Doctor = mongoose.model('Doctor', DoctorSchema);
const Appointment = mongoose.model('Appointment', AppointmentSchema);

// Dummy medical knowledge (in-memory)
const medicalKnowledge = {
  conditions: {
    diabetes: {
      medicines: [{ name: 'Metformin', dosage: '500mg twice daily' }],
      specialists: ['Endocrinologist']
    },
    hypertension: {
      medicines: [{ name: 'Lisinopril', dosage: '10mg daily' }],
      specialists: ['Cardiologist']
    }
  },
  symptoms: {
    'frequent urination': ['diabetes'],
    'headache': ['hypertension']
  }
};

// Routes

// GET all patients
app.get('/api/patients', async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

// POST new patient
app.post('/api/patients', async (req, res) => {
  const patient = new Patient(req.body);
  await patient.save();
  res.status(201).json(patient);
});

// GET all doctors
app.get('/api/doctors', async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
});

// POST new doctor
app.post('/api/doctors', async (req, res) => {
  const doctor = new Doctor(req.body);
  await doctor.save();
  res.status(201).json(doctor);
});

// POST new appointment
app.post('/api/appointments', async (req, res) => {
  const apt = new Appointment(req.body);
  await apt.save();
  res.status(201).json(apt);
});

// GET all appointments
app.get('/api/appointments', async (req, res) => {
  const appts = await Appointment.find();
  res.json(appts);
});

// POST analysis for all patients
app.post('/api/analysis', async (req, res) => {
  const patients = await Patient.find();
  const results = patients.map(analyzePatient);
  res.json(results);
});

// --- Analysis Logic ---
function analyzePatient(patient) {
  let riskScore = 0;
  let conditions = [];
  let meds = [];
  let docs = [];

  if (patient.age > 45) riskScore += 2;

  for (let c in medicalKnowledge.conditions) {
    if (patient.history.includes(c) || patient.symptoms.includes(c)) {
      conditions.push(c);
      meds.push(...medicalKnowledge.conditions[c].medicines);
      docs.push(...medicalKnowledge.conditions[c].specialists);
      riskScore += 2;
    }
  }

  for (let s in medicalKnowledge.symptoms) {
    if (patient.symptoms.includes(s)) {
      const related = medicalKnowledge.symptoms[s];
      related.forEach(c => {
        if (!conditions.includes(c)) {
          conditions.push(c);
          if (medicalKnowledge.conditions[c]) {
            meds.push(...medicalKnowledge.conditions[c].medicines);
            docs.push(...medicalKnowledge.conditions[c].specialists);
            riskScore += 1;
          }
        }
      });
    }
  }

  const level = riskScore >= 5 ? 'high' : riskScore >= 3 ? 'medium' : 'low';

  return {
    patient,
    level,
    conditions,
    meds,
    docs: [...new Set(docs)]
  };
}

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
