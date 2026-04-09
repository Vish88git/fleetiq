# ⚡ FleetIQ — Intelligent EV Fleet Management

A B2B SaaS dashboard for managing electric vehicle fleets
with real-time data, AI-powered journey planning, and
intelligent fleet insights.

## 🔗 Live Demo

https://fleetiq-two.vercel.app

## 🎯 Product Context

Built to address the real-world needs of EV fleet managers
at 20€/vehicle/month price point. Directly addresses the
5 core user stories for fleet management:

1. Real-time vehicle location and battery status
2. AI-powered route and charge stop planning
3. Critical battery alerts and maintenance warnings
4. Driver efficiency monitoring
5. Energy cost analytics

## ✨ Features

### Fleet Dashboard

- Live map with 12 vehicles across Bangalore region
- Colour coded status — Active, Charging, Alert, Idle
- Battery level bars with range estimates
- Critical alerts — automatic detection of low battery vehicles
- Real-time KPI cards — total vehicles, en route, charging, alerts

### Journey Planner

- City-to-city route planning using OpenRouteService
- Weather-adjusted range calculation
- EV charging station locations along route
- AI-generated drive plan with specific charge stops
- Estimated journey time including charging duration

### AI Assistant

- Natural language fleet queries
- Context-aware responses using live fleet data
- Identifies critical vehicles by name and battery level
- Operational risk assessment and recommendations

## 🛠 Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- OpenWeatherMap API — weather data
- OpenRouteService API — routing and geocoding
- OpenChargeMap API — EV charging stations
- OpenAI GPT-4o-mini — AI assistant and drive plans
- Leaflet.js + OpenStreetMap — interactive maps
- Vercel Serverless Functions — secure API proxy
- GitHub + Vercel — CI/CD deployment

## 🏗 Architecture
