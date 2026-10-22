# AZ-900_Readiness_Tracker

An unofficial, full-stack web application designed to help students test their rediness for the Microsoft Azure Fundamentals (AZ-900) exam. 

# The Problem
Students taking the AZ-900 exam need a way to track their progress and identify which Azure domains they are struggling with, without paying for expensive practice test platforms.

# The Solution
This Readiness Tracker allows users to log their practice test scores and select their weakest domain from the official AZ-900 categories. The app automatically calculates their average score, displays a dynamic pass-rate badge (based on the 700/1000 passing threshold), and analyzes their data to tell them exactly what to study next.

# Features
*   **User Authentication:** Secure sign-up and login using Supabase Auth.
*   **Data Logging:** Input form to record test date, score, and weakest domain.
*   **Dynamic Dashboard:** Real-time calculation of average scores, best score, and pass rate.
*   **Smart Analytics:** Analyzes historical data to flag the most frequent "Area to Focus On."
*   **Session History:** A visual list of recent test attempts with pass/fail indicators.

# Tech Stack
*   **Frontend:** React, TypeScript, Tailwind CSS
*   **Backend/Database:** Supabase (PostgreSQL) via Bolt's built-in database integration.
*   **Security:** Row Level Security (RLS) implemented to ensure users can only view and modify their own data.

# Current Status / Known Issues

The database, authentication, core logic, and UI are **100% functional**. 
Currently, the Recharts line chart is not rendering on the live Bolt hosting environment due to a Vite dependency optimization conflict. The code for the chart is present in the repository (`src/components/Dashboard.tsx`), and the production build passes successfully without errors.

# ⚖️ Disclaimer
This is an unofficial tool created for study purposes. It is not affiliated with, endorsed by, or sponsored by Microsoft. It does not contain official AZ-900 exam content.

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-nm3kxy6p)
