# LifePulse — Blood Donor, Receiver & Community Volunteer Bridge

**LifePulse** is a responsive web application designed to eliminate emergency delays in critical blood requisition by bridging **Blood Donors**, **Receivers (Patients & Families)**, and **Community Volunteers**.

---

## 🌟 Key Pillars & Features

### 1. 🩸 Blood Receivers (Patients & Families)
- **Urgent Requisition Portal:** Submit emergency blood requests with blood type, units required, urgency rating (`CRITICAL < 2hrs`, `HIGH`, `NORMAL`), hospital name, ward, and attendant contact number.
- **Dynamic Matching:** Automatically maps matching blood types and local active donors for direct outreach.
- **Real-Time Status Tracking:** Track verification and fulfillment lifecycle (`OPEN` -> `ASSIGNED` -> `COMPLETED`).

### 2. 💖 Voluntary Blood Donors
- **Donor Directory & Search:** Filter by blood group (A+, A-, B+, B-, O+, O-, AB+, AB-) and city.
- **Quick Registration:** Register donor details (age, gender, locality, last donation date, standby availability).
- **Hero Recognition & Badges:** Displays milestone recognition badges (e.g., *Gold Donor*, *Universal Hero (O-)*, *Life Champion*).
- **Direct Calling & Distress Alerts:** Immediate contact options for hospital coordinators.

### 3. 🛡️ Community Volunteers Desk
- **Hospital Verification Queue:** Volunteers authenticate requisition details directly with hospitals to weed out spam and verify urgent ICU requirements.
- **Dispatcher & Coordinator Role:** Assign volunteers to handle patient transit, navigate blood bank queues, and resolve bottlenecks.
- **Volunteer Roster:** Dedicated team directory with ratings, active cases, and contact lines.

### 4. 🧬 Blood Compatibility Matrix
- Interactive cross-matching chart demonstrating who can safely donate to and receive from each blood type.

### 5. 🎪 Community Donation Camps
- Discover and register for civic and college blood donation drives with live registration counters and capacity bars.

---

## 🚀 Running the Project

```bash
# Start development server
npm run dev

# Build for production
npm run build
```

- **Local URL:** `http://localhost:5173/`
