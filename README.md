# Sales CRM Interaction Tracker

A comprehensive Sales CRM application for tracking customer interactions, managing pipelines, and generating reports.

## Features

### Customer Management
- Add, edit, and delete customers with full details (name, company, email, phone, industry, notes)
- Pipeline stage tracking: Prospect, Qualified Lead, Proposal Sent, Negotiation, Closed Won/Lost
- Deal value tracking per customer
- Tag support for customer categorization

### Interaction Logging
- Log interactions with date/time, type (Call, Email, Meeting, Demo, Follow-up), and duration
- Outcome tracking: Positive, Neutral, Needs Follow-up, Objection Raised
- Quick-add mode for fast entry
- Follow-up date scheduling

### Dashboard
- Calendar view and list view of monthly interactions
- Summary cards showing total interactions, customers contacted, pipeline value, deals
- Interaction breakdown by type with filtering
- Upcoming follow-ups list
- Top engaged customers ranking
- Pipeline stage distribution

### Report Generation
- Monthly summary reports with comprehensive metrics
- PDF export
- Printable report preview
- Activity timeline and customer details
- Insights and recommendations

### Data Persistence
- localStorage for automatic data persistence
- CSV import/export for backup
- JSON backup export and restore

### Additional Features
- Global search across customers and interaction notes
- Tag system for categorization
- Dark mode toggle
- Responsive design

## Tech Stack

- React 19
- Vite
- Tailwind CSS v4
- jsPDF (PDF generation)
- date-fns (date handling)
- lucide-react (icons)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Add Customers**: Navigate to the Customers tab and click "Add Customer" to create new customer records.

2. **Log Interactions**: Use the Interactions tab or click "Log Interaction" from a customer's detail page to record calls, emails, meetings, etc.

3. **Track Pipeline**: Update customer pipeline stages as deals progress through your sales process.

4. **View Dashboard**: The Dashboard provides an overview of your monthly activity, upcoming follow-ups, and key metrics.

5. **Generate Reports**: Use the Reports tab to preview and download monthly PDF reports.

6. **Export Data**: Go to Settings to export your data as CSV or JSON for backup purposes.
