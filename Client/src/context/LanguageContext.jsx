import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    navbar: {
      register: "Register",
      login: "Login",
      intel: "Real-time Intel",
      dashboard: "Dashboard",
      settings: "Settings",
      logout: "Sign Out"
    },
    hero: {
      live: "Live Updates",
      title1: "Find Fuel,",
      title2: "Save Time.",
      desc: "The largest real-time community platform for fuel intelligence. Check prices, availability, and queues instantly.",
      searchPlaceholder: "Search city, area or station...",
      searchBtn: "Search"
    },
    pumps: {
      title: "Nearby Stations",
      subtitle: "Community Intelligence",
      viewMap: "View Map",
      priceLabel: "Price / Liter",
      updated: "Updated",
      verified: "Verified",
      showMore: "Show More Stations",
      available: "available",
      limited: "limited",
      out: "out",
      back: "Back to Stations",
      feedback: "Rider Feedback",
      noFeedback: "No feedback yet for this station.",
      leaveFeedback: "Leave Feedback",
      placeholder: "Share your experience...",
      post: "Post Feedback",
      search: "Search stations...",
      filter: "All Status",
      sortBy: "Sort By",
      priceLow: "Price: Low to High",
      priceHigh: "Price: High to High",
      rating: "Top Rated",
      prev: "Prev",
      next: "Next",
      page: "Page",
      mins: "mins ago",
      hrs: "hrs ago",
      hr: "hr ago",
      categories: "Categories",
      octane: "Octane",
      petrol: "Petrol",
      diesel: "Diesel",
      cng: "CNG",
      pricing: "Pricing",
      unit: "/Ltr"
    },
    map: {
      interact: "Interact coming soon",
      location: "Dhaka North",
      availability: "High Availability",
      pumpsCount: "14 verified pumps",
      interactive: "Interactive",
      fullView: "Full Map View",
      radius: "Search Radius",
      discoveryMode: "Discovery Mode",
      finding: "Finding stations...",
      newStations: "New"
    },
    reports: {
      title: "Rider Intel",
      desc: "Real-time reports from riders",
      btn: "Report Issue",
      confirm: "Confirm",
      trust: "Trust",
      fraud: "Price Fraud",
      queue: "Long Queue"
    },
    sidebar: {
      overview: "Nearby Overview",
      tipTitle: "Pro Rider Tip",
      tipDesc: "Verified reports from the last 30 minutes are the most accurate. Always check the 'Last Updated' label."
    },
    footer: {
      copy: "Fuel Tracker © 2026 • Community Driven Intelligence"
    },
    auth: {
      loginTitle: "Welcome Back",
      loginSubtitle: "Sign in to track your fuel intelligence",
      registerTitle: "Join FuelTracker",
      registerSubtitle: "The community-driven fuel platform",
      email: "Email Address",
      phone: "Phone Number (Optional)",
      password: "Password",
      name: "Full Name",
      role: "I am a...",
      rider: "Rider / Consumer",
      owner: "Pump Owner",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      loginBtn: "Sign In",
      registerBtn: "Create Account",
      forgot: "Forgot Password?",
      socialLogin: "Or continue with",
      loginSuccess: "Logged in successfully!"
    }
  },
  bn: {
    navbar: {
      register: "নিবন্ধন করুন",
      login: "লগইন",
      intel: "রিয়েল-টাইম তথ্য",
      dashboard: "ড্যাশবোর্ড",
      settings: "সেটিংস",
      logout: "লগ আউট"
    },
    hero: {
      live: "সরাসরি আপডেট",
      title1: "জ্বালানি খুঁজুন,",
      title2: "সময় বাঁচান।",
      desc: "জ্বালানি তথ্যের জন্য বৃহত্তম রিয়েল-টাইম কমিউনিটি প্ল্যাটফর্ম। মুহূর্তেই দাম, প্রাপ্যতা এবং কিউ পরীক্ষা করুন।",
      searchPlaceholder: "শহর, এলাকা বা স্টেশনের নাম লিখুন...",
      searchBtn: "খুঁজুন"
    },
    pumps: {
      title: "কাছাকাছি স্টেশনগুলো",
      subtitle: "কমিউনিটি ইন্টেলিজেন্স",
      viewMap: "ম্যাপ দেখুন",
      priceLabel: "প্রতি লিটার মূল্য",
      updated: "আপডেট করা হয়েছে",
      verified: "যাচাইকৃত",
      showMore: "আরও স্টেশন দেখুন",
      available: "পাওয়া যাচ্ছে",
      limited: "সীমিত",
      out: "স্টক নেই",
      back: "স্টেশন তালিকায় ফিরুন",
      feedback: "রাইডার ফিডব্যাক",
      noFeedback: "এই স্টেশনের জন্য কোনো ফিডব্যাক নেই।",
      leaveFeedback: "ফিডব্যাক দিন",
      placeholder: "আপনার অভিজ্ঞতা শেয়ার করুন...",
      post: "পোস্ট করুন",
      search: "স্টেশন খুঁজুন...",
      filter: "সব স্ট্যাটাস",
      sortBy: "সাজান",
      priceLow: "মূল্য: কম থেকে বেশি",
      priceHigh: "মূল্য: বেশি থেকে কম",
      rating: "সেরা রেটিং",
      prev: "আগে",
      next: "পরে",
      page: "পেজ",
      mins: "মিনিট আগে",
      hrs: "ঘণ্টা আগে",
      hr: "ঘণ্টা আগে",
      categories: "ক্যাটাগরি",
      octane: "অকটেন",
      petrol: "পেট্রোল",
      diesel: "ডিজেল",
      cng: "সিএনজি",
      pricing: "মূল্যতালিকা",
      unit: "/লিটার"
    },
    map: {
      interact: "শীঘ্রই ইন্টারেক্ট করা যাবে",
      location: "ঢাকা উত্তর",
      availability: "উচ্চ প্রাপ্যতা",
      pumpsCount: "১৪টি যাচাইকৃত পাম্প",
      interactive: "ইন্টারেক্টিভ",
      fullView: "সম্পূর্ণ ম্যাপ দেখুন",
      radius: "অনুসন্ধানের পরিধি",
      discoveryMode: "ডিসকভারি মোড",
      finding: "স্টেশন খোঁজা হচ্ছে...",
      newStations: "নতুন"
    },
    reports: {
      title: "রাইডার ইনটেল",
      desc: "রাইডারদের কাছ থেকে রিয়েল-টাইম রিপোর্ট",
      btn: "সমস্যা রিপোর্ট করুন",
      confirm: "নিশ্চিত করুন",
      trust: "বিশ্বাসযোগ্যতা",
      fraud: "মূল্য জালিয়াতি",
      queue: "দীর্ঘ লাইন"
    },
    sidebar: {
      overview: "কাছাকাছি ওভারভিউ",
      tipTitle: "প্রো রাইডার টিপ",
      tipDesc: "গত ৩০ মিনিটের যাচাইকৃত রিপোর্টগুলো সবচেয়ে নির্ভুল। যাওয়ার আগে সবসময় 'আপডেট করা হয়েছে' লেবেলটি চেক করুন।"
    },
    footer: {
      copy: "ফুয়েল ট্র্যাকার © ২০২৬ • কমিউনিটি চালিত ইন্টেলিজেন্স"
    },
    auth: {
      loginTitle: "আপনাকে স্বাগতম",
      loginSubtitle: "আপনার জ্বালানি তথ্য ট্র্যাক করতে লগইন করুন",
      registerTitle: "ফুয়েল ট্র্যাকারে যোগ দিন",
      registerSubtitle: "কমিউনিটি চালিত ফুয়েল প্ল্যাটফর্ম",
      email: "ইমেইল ঠিকানা",
      phone: "ফোন নম্বর (ঐচ্ছিক)",
      password: "পাসওয়ার্ড",
      name: "পুরো নাম",
      role: "আমি একজন...",
      rider: "রাইডার / ভোক্তা",
      owner: "পাম্প মালিক",
      noAccount: "অ্যাকাউন্ট নেই?",
      hasAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে?",
      loginBtn: "সাইন ইন করুন",
      registerBtn: "অ্যাকাউন্ট তৈরি করুন",
      forgot: "পাসওয়ার্ড ভুলে গেছেন?",
      socialLogin: "অথবা কন্টিনিউ করুন",
      loginSuccess: "সফলভাবে লগইন করা হয়েছে!"
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'bn' : 'en');
  };

  const t = translations[lang] || translations['en'];

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
