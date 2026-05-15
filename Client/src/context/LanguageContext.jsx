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
      logout: "Sign Out",
      about: "About"
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
      justNow: "Just now",
      mins: "mins ago",
      hrs: "hrs ago",
      hr: "hr ago",
      days: "days ago",
      day: "day ago",
      weeks: "weeks ago",
      week: "week ago",
      months: "months ago",
      month: "month ago",
      years: "years ago",
      year: "year ago",
      unitDay: "d",
      unitDays: "d",
      unitHour: "h",
      unitHours: "h",
      unitMin: "m",
      unitMins: "m",
      agoLabel: "ago",
      categories: "Categories",
      octane: "Octane",
      petrol: "Petrol",
      diesel: "Diesel",
      cng: "CNG",
      pricing: "Pricing",
      unit: "/Ltr",
      seeAll: "SEE ALL STATIONS",
      trustScore: "COMMUNITY TRUST",
      locationWarning: "Using saved profile location. Enable GPS for real-time local updates.",
      nearest: "NEAREST FIRST"
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
      queue: "Long Queue",
      overprice: "Overprice",
      behavior: "Bad Behavior",
      measure: "Short Measure",
      out: "Fuel Out",
      all: "All Intel",
      verified: "Verified Only",
      latest: "Latest Updates",
      nearest: "Nearest to Me",
      highestTrust: "Highest Trust",
      noResults: "No Intelligence Matches Found",
      clearFilters: "Clear all filters"
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
    },
    helpline: {
      support: "Support",
      title: "Fuel Support",
      subtitle: "We're here to help you",
      placeholderName: "Enter your name",
      placeholderEmail: "Enter your email",
      placeholderPhone: "Enter phone number",
      placeholderSubject: "Subject",
      placeholderMessage: "How can we help you today?",
      submit: "Submit Request",
      responseNote: "Response time: Typically within 24 hours",
      verified: "Verified Account",
      success: "Help request submitted! Our team will contact you soon.",
      error: "Please enter your message",
      errorEmail: "Please provide your email address",
      noRequests: "No support requests yet",
      officialResponse: "Official Response",
      myRequests: "My Help Requests",
      track: "Track your support requests and feedback"
    },
    admin: {
      helpline: "Helpline",
      total: "Total Requests",
      resolved: "Resolved",
      pending: "Pending",
      inProgress: "In Progress",
      searchPlaceholder: "Search by name, email or subject...",
      allStatus: "ALL STATUS",
      userInfo: "User Information",
      subjectMessage: "Subject & Message",
      date: "Date",
      actions: "Actions",
      reply: "Reply",
      view: "View",
      delete: "Delete",
      showing: "Showing",
      of: "of",
      resolveTitle: "Resolve Helpline Request",
      detailsTitle: "Request Details",
      userContact: "User Contact",
      adminReply: "Admin Resolution Reply",
      replyPlaceholder: "Type your reply here... This will be visible to the user.",
      sendResolve: "SEND & RESOLVE",
      cancel: "Cancel",
      close: "Close"
    },
    userSettings: {
      pageTitle: "Account",
      pageTitleHighlight: "Settings",
      pageSubtitle: "Manage your digital fuel profile",
      memberSince: "Member since",
      menuProfile: "Profile Settings",
      menuProfileSub: "Identity & Info",
      menuActivity: "My Activity",
      menuActivitySub: "Reports & Intel",
      menuSaved: "Saved Stations",
      menuSavedSub: "Quick Access",
      menuSupportSub: "Support & Help",
      menuSecurity: "Security",
      menuSecuritySub: "Password & Auth",
      signOut: "Sign Out",
      profileTitle: "Identity Profile",
      profileSubtitle: "Update your personal information",
      fullName: "Full Name",
      emailAddress: "Email Address",
      phoneNumber: "Phone Number",
      city: "City",
      saveProfile: "Save Profile Changes",
      securityTitle: "Security & Privacy",
      securitySubtitle: "Manage your password and session",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm New Password",
      updateSecurity: "Update Security Credentials",
      noActivity: "No Recent Activity",
      noActivitySub: "Your reports and intel will appear here",
      noSaved: "No Saved Stations",
      noSavedSub: "Bookmark stations for quick tracking",
      profileUpdated: "Profile updated successfully",
      passwordUpdated: "Password updated successfully",
      passwordMismatch: "New passwords do not match",
      profilePicUpdated: "Profile picture updated"
    },
    about: {
      badge: "Project Overview",
      subtitle: "Bridging the gap between fuel scarcity and smart mobility through real-time community intelligence.",
      problem: {
        title: "The Problem",
        desc: "During fuel shortages, drivers waste hours hopping from one station to another, burning more fuel in the search than they find. Lack of real-time data leads to massive queues, traffic congestion, and immense public frustration."
      },
      solution: {
        title: "Our Solution",
        desc: "FuelTracker leverages Crowdsourced Intel. By allowing riders on the road to report real-time availability and prices, we create a live map of fuel intelligence. Save time, save fuel, and find exactly what you need, when you need it."
      },
      functions: {
        title: "Core Functionalities",
        admin: {
          title: "Admin Suite",
          f1: { t: "System Analytics", d: "Monitor total users, stations, and fuel demand patterns across the country." },
          f2: { t: "Station Moderation", d: "Review and verify new station registrations to ensure platform trust." },
          f3: { t: "Health Monitoring", d: "Live tracking of Database, API, and Cloud services for 99.9% uptime." },
          f4: { t: "Danger Zone Control", d: "Authorized access to system-wide resets and cache clearing via 2FA OTP." }
        },
        owner: {
          title: "Owner Portal",
          f1: { t: "Inventory Control", d: "Instantly update availability status (Available/Limited/Out) for all fuel types." },
          f2: { t: "Dynamic Pricing", d: "Adjust fuel prices in seconds to reflect the latest government or market rates." },
          f3: { t: "Profile Management", d: "Showcase facilities like Prayer Rooms, Restrooms, and Convenience Stores." },
          f4: { t: "Reputation Tracking", d: "Monitor rider feedback and ratings to improve service quality and visibility." }
        },
        rider: {
          title: "Rider Experience",
          f1: { t: "Discovery & Intel", d: "Report fuel availability on the go and earn Reputation Points for accuracy." },
          f2: { t: "Interactive Maps", d: "Find nearest stations and filter them by fuel type and facility availability." },
          f3: { t: "Real-time Alerts", d: "Stay informed about station status updates within your preferred radius." },
          f4: { t: "Trust Scores", d: "View community-verified data with trust markers to avoid misinformation." }
        }
      },
      tech: {
        title: "The Technology Core"
      },
      dev: {
        badge: "Meet the Developer",
        social: { github: "GitHub", linkedin: "LinkedIn", website: "Portfolio" }
      }
    }
  },
  bn: {
    navbar: {
      register: "নিবন্ধন করুন",
      login: "লগইন",
      intel: "রিয়েল-টাইম তথ্য",
      dashboard: "ড্যাশবোর্ড",
      settings: "সেটিংস",
      logout: "লগ আউট",
      about: "প্রজেক্ট তথ্য"
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
      justNow: "এইমাত্র",
      mins: "মিনিট আগে",
      hrs: "ঘণ্টা আগে",
      hr: "ঘণ্টা আগে",
      days: "দিন আগে",
      day: "দিন আগে",
      weeks: "সপ্তাহ আগে",
      week: "সপ্তাহ আগে",
      months: "মাস আগে",
      month: "মাস আগে",
      years: "বছর আগে",
      year: "বছর আগে",
      unitDay: "দিন",
      unitDays: "দিন",
      unitHour: "ঘণ্টা",
      unitHours: "ঘণ্টা",
      unitMin: "মিনিট",
      unitMins: "মিনিট",
      agoLabel: "আগে",
      categories: "ক্যাটাগরি",
      octane: "অকটেন",
      petrol: "পেট্রোল",
      diesel: "ডিজেল",
      cng: "সিএনজি",
      pricing: "মূল্যতালিকা",
      unit: "/লিটার",
      seeAll: "সব স্টেশন দেখুন",
      trustScore: "কমিউনিটি ট্রাস্ট",
      locationWarning: "প্রোফাইল লোকেশন ব্যবহার করা হচ্ছে। সঠিক আপডেটের জন্য জিপিএস চালু করুন।",
      nearest: "কাছাকাছি আগে"
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
      queue: "দীর্ঘ লাইন",
      overprice: "অতিরিক্ত মূল্য",
      behavior: "খারাপ ব্যবহার",
      measure: "মাপে কম",
      out: "জ্বালানি শেষ",
      all: "সব ইনটেল",
      verified: "শুধু যাচাইকৃত",
      latest: "সর্বশেষ আপডেট",
      nearest: "আমার কাছাকাছি",
      highestTrust: "সর্বোচ্চ বিশ্বস্ততা",
      noResults: "কোনো তথ্য পাওয়া যায়নি",
      clearFilters: "ফিল্টার মুছে ফেলুন"
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
    },
    helpline: {
      support: "সাপোর্ট",
      title: "ফুয়েল সাপোর্ট",
      subtitle: "আমরা আপনার সেবায় নিয়োজিত",
      placeholderName: "আপনার নাম লিখুন",
      placeholderEmail: "আপনার ইমেইল লিখুন",
      placeholderPhone: "ফোন নম্বর লিখুন",
      placeholderSubject: "বিষয়",
      placeholderMessage: "আমরা আপনাকে কীভাবে সাহায্য করতে পারি?",
      submit: "অনুরোধ পাঠান",
      responseNote: "সচরাচর ২৪ ঘণ্টার মধ্যে উত্তর দেওয়া হয়",
      verified: "যাচাইকৃত অ্যাকাউন্ট",
      success: "সহায়তার অনুরোধ পাঠানো হয়েছে! আমাদের টিম শীঘ্রই যোগাযোগ করবে।",
      error: "আপনার বার্তা লিখুন",
      errorEmail: "আপনার ইমেইল ঠিকানা দিন",
      noRequests: "এখনো কোনো অনুরোধ নেই",
      officialResponse: "অফিসিয়াল উত্তর",
      myRequests: "আমার অনুরোধগুলো",
      track: "আপনার অনুরোধ এবং উত্তর এখানে দেখুন"
    },
    admin: {
      helpline: "হেল্পলাইন",
      total: "মোট অনুরোধ",
      resolved: "সমাধান হয়েছে",
      pending: "পেন্ডিং",
      inProgress: "চলমান",
      searchPlaceholder: "নাম, ইমেইল বা বিষয় দিয়ে খুঁজুন...",
      allStatus: "সব স্ট্যাটাস",
      userInfo: "ব্যবহারকারীর তথ্য",
      subjectMessage: "বিষয় ও বার্তা",
      date: "তারিখ",
      actions: "অ্যাকশন",
      reply: "উত্তর দিন",
      view: "দেখুন",
      delete: "মুছে ফেলুন",
      showing: "দেখানো হচ্ছে",
      of: "এর মধ্যে",
      resolveTitle: "হেল্পলাইন অনুরোধ সমাধান",
      detailsTitle: "অনুরোধের বিবরণ",
      userContact: "ব্যবহারকারীর যোগাযোগ",
      adminReply: "অ্যাডমিন রেজোলিউশন উত্তর",
      replyPlaceholder: "আপনার উত্তর এখানে লিখুন... এটি ব্যবহারকারী দেখতে পাবেন।",
      sendResolve: "পাঠান এবং সমাধান করুন",
      cancel: "বাতিল করুন",
      close: "বন্ধ করুন"
    },
    userSettings: {
      pageTitle: "অ্যাকাউন্ট",
      pageTitleHighlight: "সেটিংস",
      pageSubtitle: "আপনার ডিজিটাল ফুয়েল প্রোফাইল পরিচালনা করুন",
      memberSince: "সদস্য হয়েছেন",
      menuProfile: "প্রোফাইল সেটিংস",
      menuProfileSub: "পরিচয় ও তথ্য",
      menuActivity: "আমার কার্যক্রম",
      menuActivitySub: "রিপোর্ট ও ইন্টেল",
      menuSaved: "সংরক্ষিত স্টেশন",
      menuSavedSub: "দ্রুত অ্যাক্সেস",
      menuSupportSub: "সাপোর্ট ও সাহায্য",
      menuSecurity: "নিরাপত্তা",
      menuSecuritySub: "পাসওয়ার্ড ও প্রমাণীকরণ",
      signOut: "সাইন আউট",
      profileTitle: "পরিচয় প্রোফাইল",
      profileSubtitle: "আপনার ব্যক্তিগত তথ্য আপডেট করুন",
      fullName: "পূর্ণ নাম",
      emailAddress: "ইমেইল ঠিকানা",
      phoneNumber: "ফোন নম্বর",
      city: "শহর",
      saveProfile: "প্রোফাইল পরিবর্তন সেভ করুন",
      securityTitle: "নিরাপত্তা ও গোপনীয়তা",
      securitySubtitle: "আপনার পাসওয়ার্ড এবং সেশন পরিচালনা করুন",
      currentPassword: "বর্তমান পাসওয়ার্ড",
      newPassword: "নতুন পাসওয়ার্ড",
      confirmPassword: "নতুন পাসওয়ার্ড নিশ্চিত করুন",
      updateSecurity: "নিরাপত্তা তথ্য আপডেট করুন",
      noActivity: "কোনো সাম্প্রতিক কার্যক্রম নেই",
      noActivitySub: "আপনার রিপোর্ট ও ইন্টেল এখানে দেখাবে",
      noSaved: "কোনো সংরক্ষিত স্টেশন নেই",
      noSavedSub: "দ্রুত ট্র্যাকিংয়ের জন্য স্টেশন বুকমার্ক করুন",
      profileUpdated: "প্রোফাইল সফলভাবে আপডেট হয়েছে",
      passwordUpdated: "পাসওয়ার্ড সফলভাবে আপডেট হয়েছে",
      passwordMismatch: "নতুন পাসওয়ার্ড মেলেনি",
      profilePicUpdated: "প্রোফাইল ছবি আপডেট হয়েছে"
    },
    about: {
      badge: "প্রজেক্ট ওভারভিউ",
      subtitle: "রিয়েল-টাইম কমিউনিটি ইন্টেলিজেন্সের মাধ্যমে জ্বালানি সংকট এবং স্মার্ট চলাচলের মধ্যে দূরত্ব কমিয়ে আনা।",
      problem: {
        title: "সমস্যা",
        desc: "জ্বালানি সংকটের সময় চালকরা এক স্টেশন থেকে অন্য স্টেশনে ঘণ্টার পর ঘণ্টা সময় নষ্ট করেন, যা জ্বালানি খোঁজার চেয়ে বেশি জ্বালানি খরচ করে। রিয়েল-টাইম তথ্যের অভাবে বিশাল লাইন, যানজট এবং জনভোগান্তির সৃষ্টি হয়।"
      },
      solution: {
        title: "আমাদের সমাধান",
        desc: "ফুয়েল ট্র্যাকার ক্রাউডসোর্সড ইন্টেল ব্যবহার করে। রাস্তায় থাকা রাইডারদের রিয়েল-টাইম প্রাপ্যতা এবং দাম রিপোর্ট করার সুযোগ দিয়ে আমরা জ্বালানি তথ্যের একটি লাইভ ম্যাপ তৈরি করি। সময় বাঁচান, জ্বালানি বাঁচান এবং আপনার যা প্রয়োজন তা সঠিক সময়ে খুঁজে পান।"
      },
      functions: {
        title: "মূল কার্যকারিতা",
        admin: {
          title: "অ্যাডমিন স্যুইট",
          f1: { t: "সিস্টেম অ্যানালিটিক্স", d: "দেশজুড়ে মোট ব্যবহারকারী, স্টেশন এবং জ্বালানির চাহিদার ধরণ পর্যবেক্ষণ করুন।" },
          f2: { t: "স্টেশন মডারেশন", d: "প্ল্যাটফর্মের বিশ্বাসযোগ্যতা নিশ্চিত করতে নতুন স্টেশন নিবন্ধন পর্যালোচনা এবং যাচাই করুন।" },
          f3: { t: "হেলথ মনিটরিং", d: "৯৯.৯% আপটাইমের জন্য ডেটাবেস, এপিআই এবং ক্লাউড সার্ভিসের লাইভ ট্র্যাকিং।" },
          f4: { t: "ডেঞ্জার জোন কন্ট্রোল", d: "২এফএ ওটিপি-র মাধ্যমে সিস্টেম-ওয়াইড রিসেট এবং ক্যাশে ক্লিয়ারিংয়ের অনুমোদিত অ্যাক্সেস।" }
        },
        owner: {
          title: "মালিক পোর্টাল",
          f1: { t: "ইনভেন্টরি কন্ট্রোল", d: "সব ধরনের জ্বালানির জন্য তাৎক্ষণিকভাবে প্রাপ্যতার স্ট্যাটাস আপডেট করুন।" },
          f2: { t: "ডায়নামিক প্রাইসিং", d: "সরকারি বা বাজারের সর্বশেষ হার অনুযায়ী সেকেন্ডের মধ্যে জ্বালানির দাম সমন্বয় করুন।" },
          f3: { t: "প্রোফাইল ম্যানেজমেন্ট", d: "নামাজের ঘর, বিশ্রামাগার এবং কনভিনিয়েন্স স্টোরের মতো সুবিধাগুলো প্রদর্শন করুন।" },
          f4: { t: "রেপুটেশন ট্র্যাকিং", d: "সেবার মান এবং দৃশ্যমানতা বাড়াতে রাইডারদের ফিডব্যাক এবং রেটিং পর্যবেক্ষণ করুন।" }
        },
        rider: {
          title: "রাইডার অভিজ্ঞতা",
          f1: { t: "ডিসকভারি ও ইন্টেল", d: "চলাচলের সময় জ্বালানির প্রাপ্যতা রিপোর্ট করুন এবং নির্ভুলতার জন্য রেপুটেশন পয়েন্ট অর্জন করুন।" },
          f2: { t: "ইন্টারেক্টিভ ম্যাপ", d: "নিকটস্থ স্টেশনগুলো খুঁজুন এবং জ্বালানির ধরন ও সুবিধার ভিত্তিতে ফিল্টার করুন।" },
          f3: { t: "রিয়েল-টাইম অ্যালার্ট", d: "আপনার পছন্দের ব্যাসার্ধের মধ্যে স্টেশনের স্ট্যাটাস আপডেট সম্পর্কে অবগত থাকুন।" },
          f4: { t: "ট্রাস্ট স্কোর", d: "ভুল তথ্য এড়াতে ট্রাস্ট মার্কারসহ কমিউনিটি-ভেরিফাইড ডেটা দেখুন।" }
        }
      },
      tech: {
        title: "প্রযুক্তিগত মূল ভিত্তি"
      },
      dev: {
        badge: "ডেভেলপারের সাথে পরিচিত হন",
        social: { github: "গিটহাব", linkedin: "লিঙ্কডইন", website: "পোর্টফোলিও" }
      }
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
