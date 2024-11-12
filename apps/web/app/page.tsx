"use client";
import { Dashboard } from './components/Dashboard';
import "./globals.css"
import "./page.module.css"
export default function HomePage() {
  return (
    <div className="p-6">
      <Dashboard userId={1} />
    </div>
  );
}
