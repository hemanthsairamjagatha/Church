# Mizpah Ministries - Church Portal & Administration System

A modern, responsive web portal for **Mizpah Ministries**, featuring an interactive public church website, integrated Supabase database, cloud storage, real-time contact form processing, and a comprehensive administration dashboard.

---

## 🌟 Key Features

### Public Website (`index.html`)
- **Hero Banner:** Customizable welcome banner with video background and high-impact messaging.
- **Mission Pathways:** Cards guiding visitors to "Know God", "Grow in Community", and "Make a Difference".
- **Our Pastor:** Pastoral introduction and quotes with responsive portrait framing.
- **Sermon Catalog:** Featured sermons with scripture references and online media streaming.
- **Photo Gallery:** Lightbox-enabled photo gallery organized into Worship, Community, Sanctuary, and Outreach categories.
- **Community Testimonials:** Inspiring stories of faith from church members.
- **Interactive Contact Form:** Validated submission form wired directly to Supabase with real-time feedback.

### Church Administration Portal (`admin.html` & `login.html`)
- **Secure Authentication:** Protected admin access using Supabase GoTrue Auth.
- **Live Inquiries Inbox:** Real-time stream of contact form messages, unread badge counters, message details viewer, and one-click "Reply via Email" (`mailto:`) action.
- **Full Section CRUD:**
  - **Hero Customization:** Edit headings, subtitles, button links, and upload background imagery.
  - **Pathway Cards:** Create, edit, reorder, and upload custom card photos.
  - **Our Pastor Section:** Update bio quotes, titles, and pastor photographs.
  - **Sermons Archive:** Manage sermon series, dates, preachers, and video/audio links.
  - **Gallery Manager:** Upload high-resolution photos directly into Supabase Storage with category filters.
  - **Testimonials:** Add and curate member testimonies.
  - **Church Settings:** Update church contact info, address, service times, and social media links.

---

## 🛠 Tech Stack

- **Frontend:** HTML5, CSS3 (Modern Flexbox & CSS Grid, Custom Properties), Vanilla JavaScript (ES6+)
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Supabase Storage, Supabase Auth)
- **Icons & Fonts:** Font Awesome 6, Google Fonts (*Cinzel*, *Plus Jakarta Sans*, *Playfair Display*)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/hemanthsairamjagatha/Church.git
cd Church
```

### 2. Run Locally
Open `index.html` in your web browser, or use a local dev server (such as VS Code's **Live Server** or `npx serve`):
```bash
npx serve .
```

### 3. Access the Admin Dashboard
- Navigate to `login.html` (or click the **Admin** button in the header of `index.html`).
- **Default Email:** `admin@mizpahministries.org`
- **Default Password:** `admin123456`

---

## 📄 License
This project is licensed under the MIT License.
