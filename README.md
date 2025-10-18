# Retirement Calculator Suite

A simple and somewhat naive client-side financial planning application built with React, TypeScript, and modern web technologies. This project provides four specialized calculators to help users explore different aspects of financial planning and retirement scenarios.

## 🎯 Project Goals

This project demonstrates modern React with TypeScript development practices, financial calculation algorithms (at a novice level), interactive visualizations and some basic user experience design (mostly just tasteful choices). Mainly wanted to do something fun in the vein of finance and with interactive forms and charts

## 🧮 Calculators Included

- **Retirement Calculator**: Comprehensive retirement planning with accumulation and retirement phases, showing optimal vs. actual contribution scenarios
- **FIRE Calculator**: Financial Independence, Retire Early planning with multiple withdrawal rate scenarios (2%, 3%, 4%)
- **Compound Interest Calculator**: Visualize the power of compound interest with monthly contributions over time
- **Road to Millionaire Calculator**: Track progress toward millionaire status with milestone achievements

## ⚠️ Important Disclaimers

**This is NOT financial advice.** This application is for educational and exploratory purposes only. The calculations are based on simplified financial models and should not be used as the sole basis for financial decisions. Please consult with qualified financial professionals before making any significant financial choices. There may also be issues with my implementations of interest calculations that leads to large or subtle drift over time.

**Technical Limitations**: This is a client-side only application with no backend or data persistence. Results may contain subtle inaccuracies due to JavaScript floating-point precision limitations. All calculations are performed in the browser and no financial data is stored or transmitted.

## 🛠️ Technical Stack

- **Frontend**: React 18 with TypeScript
- **Visualizations**: Tremor UI
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: TailwindCSS with Tremor UI components
- **Form Management**: React Hook Form with custom validation
- **Routing**: React Router DOM
- **Icons**: Heroicons
- **Code Quality**: ESLint with TypeScript rules

## 📊 Other Features

- **Real-time Calculations**: Debounced form inputs for smooth user experience
- **Interactive Charts**: Visualize financial projections
- **Input Validation**: Basic validation for all financial inputs

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```
