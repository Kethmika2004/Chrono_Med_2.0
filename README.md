<div align="center">

<img src="https://img.shields.io/badge/ChronoMed-Your%20Time.%20Your%20Health.%20Perfected.-0D7A6B?style=for-the-badge&logoColor=white" alt="ChronoMed" />

# ChronoMed
### *Your Time. Your Health. Perfected.*

An AI-powered intelligent medical channeling and queue management system - built for the future of healthcare in Sri Lanka.

<br/>

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

<br/>

</div>

---

## What is ChronoMed?

ChronoMed is a next generation intelligent medical channeling platform that goes far beyond simple appointment booking. It provides real-time queue tracking, AI-powered wait time predictions, digital prescriptions, SMS/email notifications, and a full digital health record system - all under one roof.

Three dedicated portals serve three distinct users:

| Portal | Who Uses It | Key Capability |
|---|---|---|
| 🧑‍⚕️ **Patient Portal** | Patients | Book, track queue live, manage health records |
| 👨‍⚕️ **Doctor Portal** | Doctors | Manage sessions, call patients, write prescriptions |
| 🏥 **Hospital Portal** | Hospital Admins | Oversee operations, analytics, broadcast alerts |

---

## Features

### Core Features
- 📅 **Smart Appointment Booking** - multi-step flow with real-time slot availability
- 🔢 **Live Queue Tracker** - real-time token position, wait time, and session status
- 💳 **PayHere Payment Integration** - LKR payments with sandbox & production support
- 📧 **Email Notifications** - beautiful HTML emails via Resend for every appointment event
- 📱 **SMS Alerts** - Twilio-powered SMS for reminders, delays, and queue updates
- 🔔 **Push Notifications** - Firebase FCM for browser/mobile push
- 🔐 **Role-Based Access Control** - Patient / Doctor / Hospital / Superadmin roles with Supabase RLS

### Advanced / Exclusive Features
- 🤖 **AI Wait Time Prediction** - ML model estimates queue wait time with confidence score
- 🏥 **Digital Health Passport** - Patient health record: conditions, medications, allergies, history
- 📋 **E-Prescription System** - Doctor builds digital prescriptions, QR-verified PDF sent to patient
- 🔄 **Intelligent Waitlist** - Auto-promotes waitlisted patients with 15-min acceptance window
- 🌐 **Multi-Language** - English, Sinhala (සිංහල), Tamil (தமிழ்) support via i18next
- ⭐ **Reviews & Ratings** - Post-consultation ratings per doctor, wait time, and facility
- 🚨 **Emergency Fast-Track** - Emergency appointments reviewed and moved to front of queue
- 📊 **Hospital Analytics** - Revenue reports, session utilisation, patient no-show rates, AI arrival forecast heatmap
- 📡 **Session Broadcasts** - Hospital sends instant alerts to all patients in a queue (in-app + SMS)
- 🔁 **Recurring Sessions** - Doctor schedules weekly/fortnightly session patterns
- 🚶 **Walk-In Token Management** - Register walk-in patients from hospital kiosk
- 🔍 **QR Code Check-In** - Patient scans QR at arrival, auto-marks as arrived
- 📁 **Medical Document Upload** - Patient uploads lab results, scans; doctor views and adds remarks

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | Zustand |
| Data Fetching | TanStack Query (React Query) |
| Forms & Validation | React Hook Form + Zod |
| Database | PostgreSQL 15 via Supabase |
| Authentication | Supabase Auth (Email OTP + Phone OTP) |
| Real-time | Supabase Realtime (postgres_changes) |
| File Storage | Supabase Storage |
| Backend Logic | Supabase Edge Functions (Deno) |
| Email | Resend API |
| SMS | Twilio SMS API |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Payment Gateway | PayHere (LKR) |
| Charts | Recharts |
| PDF Generation | react-pdf |
| Internationalisation | i18next |
| Icons | Lucide React |

---

## Project Structure

```
chronomed/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── patient/         # Patient-specific components
│   │   ├── doctor/          # Doctor-specific components
│   │   └── hospital/        # Hospital-specific components
│   ├── pages/
│   │   ├── landing/         # Public landing page
│   │   ├── auth/            # Login, Register, OTP Verify
│   │   ├── patient/         # Patient portal pages
│   │   ├── doctor/          # Doctor portal pages
│   │   └── hospital/        # Hospital admin portal pages
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   ├── utils.ts         # Utility functions
│   │   └── validations/     # Zod schemas
│   ├── store/               # Zustand state stores
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   └── i18n/                # Translation files (en, si, ta)
├── supabase/
│   ├── migrations/          # SQL migration files
│   └── functions/           # Edge Functions
│       ├── send-notification/
│       ├── payment-verify/
│       ├── expire-unpaid-slots/
│       ├── ml-predict/
│       └── generate-prescription-pdf/
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20 LTS
- Git
- A [Supabase](https://supabase.com) account (free tier works)
- A [Resend](https://resend.com) account (email notifications)
- A [Twilio](https://twilio.com) account (SMS notifications — free trial available)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ChronoMed.git
cd ChronoMed
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration files in `supabase/migrations/` in order
3. Go to **Storage** and create the following buckets:
   - `avatars` (public)
   - `medical-documents` (private)
   - `prescriptions` (private)
   - `hospital-assets` (public)

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Then fill in your `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> ⚠️ Never put Twilio, Resend, PayHere, or service role keys in the frontend `.env`. Those go in **Supabase Edge Function secrets** only.

### 5. Set up Edge Function secrets

In your Supabase dashboard → **Edge Functions → Secrets**, add:

```
RESEND_API_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
FCM_SERVER_KEY
PAYHERE_MERCHANT_ID
PAYHERE_SECRET
INTERNAL_SERVICE_TOKEN
SUPABASE_SERVICE_ROLE_KEY
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Database Schema

ChronoMed uses 13 PostgreSQL tables with full Row-Level Security:

```
auth.users              ← Supabase managed
user_profiles           ← Extended profile for all roles
hospitals               ← Hospital accounts
doctors                 ← Doctor profiles
doctor_hospital         ← Many-to-many affiliation
sessions                ← Scheduled consultation blocks
appointments            ← Patient bookings with token numbers
medical_documents       ← Patient uploaded files
notifications           ← All notification records
reviews                 ← Post-consultation ratings
health_records          ← Patient digital health passport
prescriptions           ← Digital prescriptions
ml_predictions          ← AI wait time & arrival forecasts
waitlist                ← Waitlist queue management
audit_log               ← Immutable audit trail
```

---

## Notification System

| Event | Email | SMS | Push | In-App |
|---|:---:|:---:|:---:|:---:|
| Registration welcome | ✅ | | | ✅ |
| Appointment confirmed | ✅ | ✅ | ✅ | ✅ |
| 24-hour reminder | ✅ | ✅ | | ✅ |
| 30-minute reminder | | ✅ | ✅ | ✅ |
| Session delayed | ✅ | ✅ | ✅ | ✅ |
| You're next in queue | | ✅ | ✅ | ✅ |
| Session cancelled | ✅ | ✅ | | ✅ |
| Payment receipt | ✅ | | | ✅ |
| Prescription ready | ✅ | | ✅ | ✅ |

---

## Security

- ✅ Row-Level Security (RLS) on all Supabase tables
- ✅ JWT validation on all protected routes
- ✅ Secrets stored in Edge Function environment only — never in frontend
- ✅ Medical documents in private storage with signed URL access
- ✅ Payment card data never stored — transaction reference only
- ✅ OTP expires in 10 minutes
- ✅ Full audit trail on all sensitive operations
- ✅ Input validation with Zod on all form submissions

---

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Pharmacy QR prescription verification portal
- [ ] Telemedicine (video consultation integration)
- [ ] Insurance claim integration
- [ ] Government hospital integration (MOH API)
- [ ] Wearable device health data sync
- [ ] AI symptom checker at booking stage

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ in Sri Lanka 🇱🇰

**ChronoMed** - *Your Time. Your Health. Perfected.*

</div>
