# GRINE RESTAURANT POS

Production-oriented restaurant point of sale built with React, TypeScript, Vite, Tailwind CSS, Netlify Functions, Netlify Database, and Netlify Identity.

## Local development

```bash
npm install
npm run dev
```

For database and Identity emulation use:

```bash
netlify dev --port 8889
```

## Production build

```bash
npm run build
```

The deploy output is `dist`. Netlify configuration, SPA routing, database migrations, and functions are included.

## Default local POS accounts

| Role | Username | PIN |
| --- | --- | --- |
| Admin | admin | 1234 |
| Manager | manager | 2222 |
| Cashier | cashier | 3333 |
| Kitchen | kitchen | 4444 |

Change these accounts immediately in production. Netlify Identity is enabled for hosted account management.

## Thermal printer

Install the manufacturer’s Windows driver, select 80 mm paper, margins `None`, scale `100%`, headers and footers off, then choose the printer from the browser print dialog. Kitchen tickets and customer receipts use dedicated 80 mm print CSS; invoices use A4.
