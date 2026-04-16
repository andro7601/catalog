# Redberry Bootcamp XI Course Catalog

A React + Vite implementation of the Redberry Bootcamp XI assignment.

This project is an online course platform UI with authentication, dashboard states, browse filters, course detail enrollment flow, profile completion flow, enrolled courses panel, and enrolled courses page.

## Stack

- React
- Vite
- React Router
- Plain CSS
- Redberry Internship API

## Features

- Authentication with sign up and log in modals
- Profile modal with validation and profile completion status
- Dashboard for guest and authenticated users
- Featured courses section
- Continue learning section with locked guest state
- Browse page with:
  - categories
  - topics
  - instructors
  - sorting
  - pagination
- Course detail page with:
  - weekly schedule selection
  - time slot selection
  - session type selection
  - dynamic total price
  - enrollment flow
  - schedule conflict handling
  - course completion
  - rating flow
- Enrolled courses sidebar
- Enrolled courses page

## API

Base API used by the app:

- `https://api.redclass.redberryinternship.ge/api`

Main API areas used:

- auth
- profile
- courses
- filters
- enrollments
- reviews

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Preview the production build:

```bash
npm run preview
```

## Scripts

- `npm run dev` starts the Vite dev server
- `npm run build` creates a production build
- `npm run preview` previews the production build locally
- `npm run lint` runs ESLint

## Project Structure

```txt
src/
  api/
  assets/
  components/
  modals/
  routes/
  App.jsx
  AppContext.jsx
  index.css
  main.jsx
```

## Notes

- The app uses a single-page React architecture.
- Authentication is token-based.
- Profile completion is required before enrollment.
- Some UI states depend on API data availability.

## Repository

GitHub repository:

- [https://github.com/andro7601/catalog](https://github.com/andro7601/catalog)
