'use client';

import React from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { LiquidGlassProvider } from './components/LiquidGlassProvider';

export default function EggNSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        /* Override any parent styles */
        * {
          box-sizing: border-box;
        }
        
        /* Force full viewport coverage with higher z-index for independence */
        .eggns-app {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 99999 !important;
          background: linear-gradient(135deg, #020617 0%, #111827 50%, #020617 100%) !important;
          color: white !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          overflow: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          transition: all 0.5s ease-in-out !important;
          isolation: isolate !important;
        }
        
        /* Enhanced independence for liquid glass mode */
        .eggns-app.liquid-glass {
          z-index: 999999 !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          position: fixed !important;
          inset: 0 !important;
          transform: none !important;
          contain: layout style paint !important;
        }
        
        /* Light mode background */
        .eggns-app.light {
          background: linear-gradient(135deg, #f9fafb 0%, #ffffff 50%, #f3f4f6 100%) !important;
          color: #111827 !important;
        }
        
        /* Dark mode background */
        .eggns-app.dark {
          background: linear-gradient(135deg, #020617 0%, #111827 50%, #020617 100%) !important;
          color: white !important;
        }
        
        /* Independent Liquid Glass Mode Backgrounds */
        .eggns-app.liquid-glass {
          background: linear-gradient(135deg, #020617 0%, #0f1629 50%, #020617 100%) !important;
          position: fixed !important;
        }
        
        .eggns-app.liquid-glass.light {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%) !important;
        }
        
        /* Force hide parent elements when EggNS is active */
        body:has(.eggns-app) {
          overflow: hidden !important;
        }
        
        /* Hide all siblings when liquid glass is active */
        .eggns-app.liquid-glass ~ * {
          display: none !important;
        }
        
        /* Ensure complete isolation from parent styles */
        .eggns-app.liquid-glass * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        
        /* Dark mode class */
        .dark {
          color-scheme: dark;
        }
        
        /* Light mode class */
        .light {
          color-scheme: light;
        }
        
        /* Independent Liquid Glass Utilities */
        .liquid-glass-bg {
          background: rgba(255, 255, 255, 0.08) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          box-shadow: 
            0 8px 32px rgba(31, 38, 135, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
          will-change: backdrop-filter !important;
          transform: translate3d(0, 0, 0) !important;
          position: relative !important;
          isolation: isolate !important;
        }
        
        .liquid-glass-bg.light {
          background: rgba(255, 255, 255, 0.25) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
        }
        
        .liquid-glass-bg:hover {
          background: rgba(255, 255, 255, 0.12) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          transition: all 0.3s ease !important;
        }
        
        .liquid-glass-bg.light:hover {
          background: rgba(255, 255, 255, 0.35) !important;
          border: 1px solid rgba(255, 255, 255, 0.25) !important;
        }
        
        .liquid-glass-inner-highlight {
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 8px 32px rgba(31, 38, 135, 0.15) !important;
        }
        
        .liquid-glass-text {
          color: white !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
        }
        
        .liquid-glass-text-secondary {
          color: #e2e8f0 !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
        }
        
        .liquid-glass-text.light {
          color: #1e293b !important;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.1) !important;
        }
        
        .liquid-glass-text-secondary.light {
          color: #475569 !important;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.1) !important;
        }
        
        /* Independent Gradient Overlay System */
        .gradient-overlay-left {
          position: absolute;
          left: 0;
          top: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, 
            rgba(30, 58, 138, 0.25) 0%, 
            rgba(15, 23, 42, 0.5) 50%, 
            rgba(15, 23, 42, 0.7) 100%);
          pointer-events: none;
          z-index: 5;
          isolation: isolate;
        }
        
        .gradient-overlay-right {
          position: absolute;
          right: 0;
          top: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(to left, 
            rgba(88, 28, 135, 0.25) 0%, 
            rgba(15, 23, 42, 0.5) 50%, 
            rgba(15, 23, 42, 0.7) 100%);
          pointer-events: none;
          z-index: 5;
          isolation: isolate;
        }
        
        .gradient-overlay-left.light {
          background: linear-gradient(to right, 
            rgba(59, 130, 246, 0.12) 0%, 
            rgba(248, 250, 252, 0.4) 50%, 
            rgba(241, 245, 249, 0.5) 100%);
        }
        
        .gradient-overlay-right.light {
          background: linear-gradient(to left, 
            rgba(147, 51, 234, 0.12) 0%, 
            rgba(248, 250, 252, 0.4) 50%, 
            rgba(241, 245, 249, 0.5) 100%);
        }
        
        .radial-overlay-left {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at 25% 50%, rgba(59, 130, 246, 0.2), transparent 70%);
          pointer-events: none;
          z-index: 6;
          isolation: isolate;
        }
        
        .radial-overlay-right {
          position: absolute;
          right: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at 75% 50%, rgba(147, 51, 234, 0.2), transparent 70%);
          pointer-events: none;
          z-index: 6;
          isolation: isolate;
        }
        
        .dark-base-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          pointer-events: none;
          z-index: 7;
          isolation: isolate;
        }
        
        .dark-base-overlay.light {
          background: rgba(255, 255, 255, 0.4);
        }
        
        /* Enhanced liquid glass effects */
        .liquid-glass-container {
          backdrop-filter: blur(20px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          border-radius: 16px !important;
          box-shadow: 
            0 8px 32px rgba(31, 38, 135, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
          position: relative !important;
          overflow: hidden !important;
          isolation: isolate !important;
        }
        
        .liquid-glass-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.1) 0%, 
            rgba(255, 255, 255, 0.05) 50%, 
            rgba(255, 255, 255, 0.1) 100%);
          pointer-events: none;
          z-index: -1;
        }
        
        /* Tailwind-like utilities enhanced for independence */
        .min-h-screen { min-height: 100vh !important; }
        .w-full { width: 100% !important; }
        .h-full { height: 100% !important; }
        .bg-gray-900 { background-color: #111827 !important; }
        .bg-gray-50 { background-color: #f9fafb !important; }
        .bg-white { background-color: #ffffff !important; }
        .bg-gray-100 { background-color: #f3f4f6 !important; }
        .bg-gray-200 { background-color: #e5e7eb !important; }
        .bg-gray-300 { background-color: #d1d5db !important; }
        .bg-gray-700 { background-color: #374151 !important; }
        .bg-gray-800 { background-color: #1f2937 !important; }
        .text-white { color: white !important; }
        .text-gray-900 { color: #111827 !important; }
        .text-gray-800 { color: #1f2937 !important; }
        .text-gray-700 { color: #374151 !important; }
        .text-gray-600 { color: #4b5563 !important; }
        .text-gray-500 { color: #6b7280 !important; }
        .text-gray-400 { color: #9ca3af !important; }
        .text-gray-300 { color: #d1d5db !important; }
        .text-gray-100 { color: #f3f4f6 !important; }
        .relative { position: relative !important; }
        .absolute { position: absolute !important; }
        .fixed { position: fixed !important; }
        .flex { display: flex !important; }
        .flex-col { flex-direction: column !important; }
        .items-center { align-items: center !important; }
        .justify-center { justify-content: center !important; }
        .justify-between { justify-content: space-between !important; }
        .space-x-3 > * + * { margin-left: 0.75rem !important; }
        .space-x-4 > * + * { margin-left: 1rem !important; }
        .space-x-6 > * + * { margin-left: 1.5rem !important; }
        .text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
        .text-3xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
        .text-6xl { font-size: 3.75rem !important; line-height: 1 !important; }
        .text-xl { font-size: 1.25rem !important; line-height: 1.75rem !important; }
        .text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
        .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
        .font-bold { font-weight: 700 !important; }
        .font-semibold { font-weight: 600 !important; }
        .font-medium { font-weight: 500 !important; }
        .font-light { font-weight: 300 !important; }
        .mb-8 { margin-bottom: 2rem !important; }
        .mb-16 { margin-bottom: 4rem !important; }
        .mb-20 { margin-bottom: 5rem !important; }
        .p-6 { padding: 1.5rem !important; }
        .px-3 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
        .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
        .px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
        .py-5 { padding-top: 1.25rem !important; padding-bottom: 1.25rem !important; }
        .px-8 { padding-left: 2rem !important; padding-right: 2rem !important; }
        .py-6 { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
        .pl-16 { padding-left: 4rem !important; }
        .pr-10 { padding-right: 2.5rem !important; }
        .p-3 { padding: 0.75rem !important; }
        .rounded-full { border-radius: 9999px !important; }
        .rounded-2xl { border-radius: 1rem !important; }
        .rounded-3xl { border-radius: 1.5rem !important; }
        .rounded-xl { border-radius: 0.75rem !important; }
        .bg-green-500 { background-color: #10b981 !important; }
        .bg-green-600 { background-color: #059669 !important; }
        .border { border-width: 1px !important; }
        .border-gray-700 { border-color: #374151 !important; }
        .border-gray-300 { border-color: #d1d5db !important; }
        .border-gray-200 { border-color: #e5e7eb !important; }
        .hover\\:text-white:hover { color: white !important; }
        .hover\\:text-gray-900:hover { color: #111827 !important; }
        .hover\\:text-gray-800:hover { color: #1f2937 !important; }
        .hover\\:bg-green-600:hover { background-color: #059669 !important; }
        .hover\\:bg-green-700:hover { background-color: #047857 !important; }
        .hover\\:bg-gray-700:hover { background-color: #374151 !important; }
        .hover\\:bg-gray-300:hover { background-color: #d1d5db !important; }
        .hover\\:bg-gray-50:hover { background-color: #f9fafb !important; }
        .transition-colors { transition: color 0.3s ease-in-out !important; }
        .transition-all { transition: all 0.3s ease-in-out !important; }
        .duration-300 { transition-duration: 300ms !important; }
        .duration-500 { transition-duration: 500ms !important; }
        .ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important; }
        .cursor-pointer { cursor: pointer !important; }
        .overflow-hidden { overflow: hidden !important; }
        .pointer-events-none { pointer-events: none !important; }
        .z-10 { z-index: 10 !important; }
        .z-20 { z-index: 20 !important; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important; }
        .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important; }
        .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important; }
        .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important; }
        .backdrop-blur-md { backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important; }
        .backdrop-blur-xl { backdrop-filter: blur(24px) !important; -webkit-backdrop-filter: blur(24px) !important; }
        .max-w-6xl { max-width: 72rem !important; }
        .max-w-2xl { max-width: 42rem !important; }
        .max-w-4xl { max-width: 56rem !important; }
        .mx-auto { margin-left: auto !important; margin-right: auto !important; }
        .text-center { text-align: center !important; }
        .leading-tight { line-height: 1.25 !important; }
        .leading-relaxed { line-height: 1.625 !important; }
        .inset-0 { top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important; }
        .blur-3xl { filter: blur(64px) !important; }
        .bg-blue-500 { background-color: #3b82f6 !important; }
        .bg-blue-400 { background-color: #60a5fa !important; }
        .bg-purple-500 { background-color: #8b5cf6 !important; }
        .bg-purple-400 { background-color: #a78bfa !important; }
        .bg-green-400 { background-color: #4ade80 !important; }
        .opacity-10 { opacity: 0.1 !important; }
        .opacity-5 { opacity: 0.05 !important; }
        .opacity-30 { opacity: 0.3 !important; }
        .opacity-0 { opacity: 0 !important; }
        .w-80 { width: 20rem !important; }
        .h-80 { height: 20rem !important; }
        .w-96 { width: 24rem !important; }
        .h-96 { height: 24rem !important; }
        .w-64 { width: 16rem !important; }
        .h-64 { height: 16rem !important; }
        .w-12 { width: 3rem !important; }
        .h-12 { height: 3rem !important; }
        .w-4 { width: 1rem !important; }
        .h-4 { height: 1rem !important; }
        .w-5 { width: 1.25rem !important; }
        .h-5 { height: 1.25rem !important; }
        .w-6 { width: 1.5rem !important; }
        .h-6 { height: 1.5rem !important; }
        .w-1\\/2 { width: 50% !important; }
        .transform { transform: translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)) !important; }
        .-translate-x-1\\/2 { --tw-translate-x: -50% !important; }
        .-translate-y-1\\/2 { --tw-translate-y: -50% !important; }
        .top-1\\/4 { top: 25% !important; }
        .left-1\\/4 { left: 25% !important; }
        .bottom-1\\/4 { bottom: 25% !important; }
        .right-1\\/4 { right: 25% !important; }
        .top-1\\/2 { top: 50% !important; }
        .left-1\\/2 { left: 50% !important; }
        .bottom-8 { bottom: 2rem !important; }
        .left-8 { left: 2rem !important; }
        .right-8 { right: 2rem !important; }
        .top-full { top: 100% !important; }
        .mt-3 { margin-top: 0.75rem !important; }
        .mt-4 { margin-top: 1rem !important; }
        .-top-40 { top: -10rem !important; }
        .left-0 { left: 0 !important; }
        .right-0 { right: 0 !important; }
        .top-0 { top: 0 !important; }
        
        /* Enhanced gradient utilities for independence */
        .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)) !important; }
        .bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)) !important; }
        .from-blue-400 { --tw-gradient-from: #60a5fa !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(96, 165, 250, 0)) !important; }
        .from-blue-500 { --tw-gradient-from: #3b82f6 !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(59, 130, 246, 0)) !important; }
        .via-blue-500 { --tw-gradient-stops: var(--tw-gradient-from), #3b82f6, var(--tw-gradient-to, rgba(59, 130, 246, 0)) !important; }
        .to-purple-500 { --tw-gradient-to: #8b5cf6 !important; }
        .to-blue-600 { --tw-gradient-to: #2563eb !important; }
        .from-green-500 { --tw-gradient-from: #10b981 !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(16, 185, 129, 0)) !important; }
        .from-green-600 { --tw-gradient-from: #059669 !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(5, 150, 105, 0)) !important; }
        .to-green-600 { --tw-gradient-to: #059669 !important; }
        .to-green-700 { --tw-gradient-to: #047857 !important; }
        .from-gray-900 { --tw-gradient-from: #111827 !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(17, 24, 39, 0)) !important; }
        .via-gray-900 { --tw-gradient-stops: var(--tw-gradient-from), #111827, var(--tw-gradient-to, rgba(17, 24, 39, 0)) !important; }
        .to-gray-800 { --tw-gradient-to: #1f2937 !important; }
        .from-slate-950 { --tw-gradient-from: #020617 !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(2, 6, 23, 0)) !important; }
        .via-slate-950 { --tw-gradient-stops: var(--tw-gradient-from), #020617, var(--tw-gradient-to, rgba(2, 6, 23, 0)) !important; }
        .to-slate-950 { --tw-gradient-to: #020617 !important; }
        .from-gray-50 { --tw-gradient-from: #f9fafb !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(249, 250, 251, 0)) !important; }
        .via-white { --tw-gradient-stops: var(--tw-gradient-from), #ffffff, var(--tw-gradient-to, rgba(255, 255, 255, 0)) !important; }
        .to-gray-100 { --tw-gradient-to: #f3f4f6 !important; }
        .bg-clip-text { -webkit-background-clip: text !important; background-clip: text !important; }
        .text-transparent { color: transparent !important; }
        .inherit { color: inherit !important; }
        
        /* Enhanced focus utilities for independence */
        .focus\\:outline-none:focus { outline: none !important; }
        .focus\\:ring-2:focus { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5) !important; }
        .focus\\:border-blue-500:focus { border-color: #3b82f6 !important; }
        .focus\\:bg-gray-800:focus { background-color: #1f2937 !important; }
        .focus\\:bg-white:focus { background-color: #ffffff !important; }
        
        /* Enhanced placeholder utilities */
        .placeholder\\:text-gray-500::placeholder { color: #6b7280 !important; }
        .placeholder\\:text-gray-400::placeholder { color: #9ca3af !important; }
        
        /* Enhanced dark mode utilities with independence */
        .dark .dark\\:bg-gray-800 { background-color: #1f2937 !important; }
        .dark .dark\\:bg-gray-200 { background-color: #e5e7eb !important; }
        .dark .dark\\:text-white { color: white !important; }
        .dark .dark\\:text-gray-900 { color: #111827 !important; }
        .dark .dark\\:border-gray-700 { border-color: #374151 !important; }
        .dark .dark\\:border-gray-200 { border-color: #e5e7eb !important; }
        .dark .dark\\:hover\\:bg-gray-700:hover { background-color: #374151 !important; }
        .dark .dark\\:hover\\:bg-gray-300:hover { background-color: #d1d5db !important; }
        .dark .dark\\:opacity-100 { opacity: 1 !important; }
        .dark .dark\\:placeholder\\:text-gray-400::placeholder { color: #9ca3af !important; }
        
        /* Enhanced light mode utilities */
        .light .light\\:bg-white { background-color: #ffffff !important; }
        .light .light\\:text-gray-900 { color: #111827 !important; }
        .light .light\\:border-gray-300 { border-color: #d1d5db !important; }
        
        /* Enhanced responsive utilities */
        @media (min-width: 768px) {
          .md\\:text-7xl { font-size: 4.5rem !important; line-height: 1 !important; }
          .md\\:text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
          .md\\:left-60 { left: 15rem !important; }
          .md\\:-top-20 { top: -5rem !important; }
          .md\\:right-60 { right: 15rem !important; }
        }
        
        @media (min-width: 1024px) {
          .lg\\:text-8xl { font-size: 6rem !important; line-height: 1 !important; }
          .lg\\:w-84 { width: 84% !important; }
        }
        
        @media (min-width: 1280px) {
          .xl\\:text-9xl { font-size: 8rem !important; line-height: 1 !important; }
        }
        
        @media (max-width: 640px) {
          .hidden { display: none !important; }
        }
        
        @media (min-width: 640px) {
          .sm\\:block { display: block !important; }
        }
        
        /* Enhanced theme transition animations */
        .theme-transition {
          transition: background-color 0.4s ease, border-color 0.4s ease, color 0.3s ease !important;
        }
        
        .icon-rotate {
          transition: transform 0.3s ease-in-out !important;
        }
        
        /* Enhanced background opacity utilities */
        .bg-gray-800\\/50 { background-color: rgba(31, 41, 55, 0.5) !important; }
        .bg-gray-800\\/30 { background-color: rgba(31, 41, 55, 0.3) !important; }
        .bg-gray-800\\/90 { background-color: rgba(31, 41, 55, 0.9) !important; }
        .bg-gray-200\\/50 { background-color: rgba(229, 231, 235, 0.5) !important; }
        .bg-white\\/50 { background-color: rgba(255, 255, 255, 0.5) !important; }
        .bg-white\\/60 { background-color: rgba(255, 255, 255, 0.6) !important; }
        .bg-white\\/80 { background-color: rgba(255, 255, 255, 0.8) !important; }
        .bg-white\\/95 { background-color: rgba(255, 255, 255, 0.95) !important; }
        .border-gray-700\\/50 { border-color: rgba(55, 65, 81, 0.5) !important; }
        .border-gray-300\\/50 { border-color: rgba(209, 213, 219, 0.5) !important; }
        
        /* Enhanced additional utilities for independence */
        .first\\:rounded-t-2xl:first-child { border-top-left-radius: 1rem !important; border-top-right-radius: 1rem !important; }
        .last\\:rounded-b-2xl:last-child { border-bottom-left-radius: 1rem !important; border-bottom-right-radius: 1rem !important; }
        .hover\\:bg-gray-700\\/50:hover { background-color: rgba(55, 65, 81, 0.5) !important; }
        .hover\\:bg-gray-800\\/70:hover { background-color: rgba(31, 41, 55, 0.7) !important; }
        .hover\\:bg-white\\/80:hover { background-color: rgba(255, 255, 255, 0.8) !important; }
        .hover\\:bg-gray-200\\/50:hover { background-color: rgba(229, 231, 235, 0.5) !important; }
        
        /* Enhanced opacity fractions */
        .bg-blue-500\\/10 { background-color: rgba(59, 130, 246, 0.1) !important; }
        .bg-blue-500\\/5 { background-color: rgba(59, 130, 246, 0.05) !important; }
        .bg-blue-400\\/8 { background-color: rgba(96, 165, 250, 0.08) !important; }
        .bg-purple-500\\/10 { background-color: rgba(139, 92, 246, 0.1) !important; }
        .bg-purple-500\\/5 { background-color: rgba(139, 92, 246, 0.05) !important; }
        .bg-purple-400\\/6 { background-color: rgba(167, 139, 250, 0.06) !important; }
        .bg-green-500\\/5 { background-color: rgba(16, 185, 129, 0.05) !important; }
        .bg-green-400\\/4 { background-color: rgba(74, 222, 128, 0.04) !important; }
      `}</style>
      
      <ThemeProvider>
        <LiquidGlassProvider>
          <div className="eggns-app">
            {children}
          </div>
        </LiquidGlassProvider>
      </ThemeProvider>
    </>
  );
} 