import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Fuel, 
  Users, 
  MapPin, 
  ShieldCheck, 
  Github, 
  Linkedin, 
  Globe, 
  Mail, 
  ExternalLink,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  AlertTriangle,
  User
} from 'lucide-react';
import { adminService } from '../../helpers/adminService';
import { useLanguage } from '../../context/LanguageContext';

const About = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await adminService.getSettings();
        setSettings(data?.data || data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
        <div className="bg-amber-500 p-4 rounded-3xl shadow-2xl shadow-amber-500/20 mb-6 animate-bounce">
          <Fuel className="text-white" size={40} />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400 animate-pulse">Initializing Project Intel...</p>
      </div>
    );
  }

  const dev = settings?.developerInfo || {
    name: "Sabbir Hossain",
    role: "Full Stack Developer",
    email: "prodev.sabbir@gmail.com",
    website: "https://sabbirhossain.com",
    github: "https://github.com/prodevsabbir",
    linkedin: "https://linkedin.com/in/prodevsabbir",
    description: "Passionate about building scalable web applications and solving real-world problems through technology.",
    imageUrl: "https://avatars.githubusercontent.com/u/85465545?v=4"
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 py-12 md:py-20 w-full"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles size={14} />
          {t.about.badge}
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight">
          Fuel<span className="text-amber-500">Tracker</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          {t.about.subtitle}
        </p>
      </motion.div>

      {/* Problem & Solution Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        <div className="p-10 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-500/20 blur-3xl rounded-full"></div>
          <h2 className="text-3xl font-black mb-6 relative z-10 flex items-center gap-3">
            <AlertTriangle className="text-red-500" />
            {t.about.problem.title}
          </h2>
          <p className="text-slate-400 leading-relaxed relative z-10 text-lg">
            {t.about.problem.desc}
          </p>
        </div>
        <div className="p-10 rounded-[2.5rem] bg-amber-500 text-white relative overflow-hidden group">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 blur-3xl rounded-full"></div>
          <h2 className="text-3xl font-black mb-6 relative z-10 flex items-center gap-3">
            <ShieldCheck className="text-white" />
            {t.about.solution.title}
          </h2>
          <p className="text-white/90 leading-relaxed relative z-10 text-lg">
            {t.about.solution.desc}
          </p>
        </div>
      </motion.div>

      {/* Detailed Functionalities Section */}
      <motion.div variants={itemVariants} className="mb-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">{t.about.functions.title}</h2>
          <div className="w-20 h-1.5 bg-amber-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Admin Block */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-slate-100 text-slate-900">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-2xl font-black">{t.about.functions.admin.title}</h3>
            </div>
            {[
              t.about.functions.admin.f1,
              t.about.functions.admin.f2,
              t.about.functions.admin.f3,
              t.about.functions.admin.f4
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all group">
                <h4 className="font-bold text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">{f.t}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>

          {/* Station Owner Block */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-amber-100 text-amber-600">
                <MapPin size={28} />
              </div>
              <h3 className="text-2xl font-black">{t.about.functions.owner.title}</h3>
            </div>
            {[
              t.about.functions.owner.f1,
              t.about.functions.owner.f2,
              t.about.functions.owner.f3,
              t.about.functions.owner.f4
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all group">
                <h4 className="font-bold text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">{f.t}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>

          {/* Rider Block */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-blue-100 text-blue-600">
                <Users size={28} />
              </div>
              <h3 className="text-2xl font-black">{t.about.functions.rider.title}</h3>
            </div>
            {[
              t.about.functions.rider.f1,
              t.about.functions.rider.f2,
              t.about.functions.rider.f3,
              t.about.functions.rider.f4
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all group">
                <h4 className="font-bold text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">{f.t}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tech Stack Grid */}
      <motion.div variants={itemVariants} className="mb-20">
        <div className="bg-slate-900 rounded-[3rem] p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-20 opacity-10 blur-3xl bg-amber-500 rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-white mb-12 flex items-center gap-4">
              <Layers className="text-amber-500" />
              {t.about.tech.title}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: "React.js", category: "Frontend", icon: <Code2 size={20} /> },
                { name: "Node.js", category: "Backend", icon: <Cpu size={20} /> },
                { name: "MongoDB", category: "Database", icon: <Layers size={20} /> },
                { name: "Tailwind", category: "Styling", icon: <Sparkles size={20} /> },
                { name: "Express", category: "API", icon: <Code2 size={20} /> },
                { name: "TypeScript", category: "Safety", icon: <ShieldCheck size={20} /> },
                { name: "Cloudinary", category: "Media", icon: <Globe size={20} /> },
                { name: "Socket.IO", category: "Real-time", icon: <Users size={20} /> },
              ].map((tech, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="text-amber-500 mb-3">{tech.icon}</div>
                  <h4 className="text-white font-bold">{tech.name}</h4>
                  <span className="text-xs text-slate-400 uppercase tracking-tighter">{tech.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Developer Section */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row items-center gap-12 bg-white p-4 rounded-[3rem] border-2 border-slate-100 shadow-sm">
        <div className="w-full lg:w-1/3">
          {dev.imageUrl ? (
            <img 
              src={dev.imageUrl} 
              alt={dev.name}
              className="w-full aspect-square object-cover rounded-[2.5rem] shadow-2xl"
            />
          ) : (
            <div className="w-full aspect-square bg-slate-100 rounded-[2.5rem] shadow-2xl flex items-center justify-center text-slate-300">
              <User size={120} strokeWidth={1} />
            </div>
          )}
        </div>
        <div className="w-full lg:w-2/3 lg:pr-12 py-8 px-4 lg:px-0">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-4 block">{t.about.dev.badge}</span>
          <h2 className="text-4xl font-black text-slate-900 mb-2">{dev.name}</h2>
          <p className="text-lg font-bold text-slate-500 mb-6">{dev.role}</p>
          <p className="text-slate-600 mb-8 leading-relaxed text-lg">
            {dev.description}
          </p>
          
          <div className="flex flex-wrap gap-4 mb-10">
            <a href={dev.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition-all font-bold">
              <Github size={18} /> {t.about.dev.social.github}
            </a>
            <a href={dev.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold">
              <Linkedin size={18} /> {t.about.dev.social.linkedin}
            </a>
            <a href={dev.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 text-white hover:bg-amber-600 transition-all font-bold">
              <Globe size={18} /> {t.about.dev.social.website}
            </a>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-sm italic">
            <Mail size={16} />
            {dev.email}
          </div>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <motion.div variants={itemVariants} className="mt-20 pt-12 border-t border-slate-200 text-center text-slate-400">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Fuel className="text-amber-500" size={24} />
          <span className="font-black tracking-tighter text-xl text-slate-900">FuelTracker <span className="text-amber-500">Pro</span></span>
        </div>
        <p className="text-xs uppercase tracking-widest font-bold">{t.footer.copy}</p>
      </motion.div>
    </motion.div>
  );
};

export default About;

