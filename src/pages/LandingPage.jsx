import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, GraduationCap, Briefcase, Users, 
  Menu, X, Moon, Sun, Globe, Cpu, Palette, 
  TrendingUp, ArrowRight, CheckCircle, PlayCircle,
  Code, Award, Building2, UserPlus, BarChart, Target,
  Facebook, Twitter, Instagram
} from 'lucide-react';
import './LandingPage.css';

export const LandingPage = () => {
  // Dark Mode Default
  const [darkMode, setDarkMode] = useState(true);
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0f172a'; // Dark Slate
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc'; // Light Slate
    }
  }, [darkMode]);

  const [searchTypeIndex, setSearchTypeIndex] = useState(0);
  const searchTypes = ['Courses', 'Internships', 'Mentors'];

  const toggleSearchType = () => {
    setSearchTypeIndex((prev) => (prev + 1) % searchTypes.length);
  };

  const handleSearch = () => {
    const input = document.querySelector('.search-input').value;
    const type = searchTypes[searchTypeIndex];
    if (input) {
      alert(`Searching for "${input}" in: ${type}`);
    } else {
      alert('Please enter a search term');
    }
  };

  // Floating Animation Variants
  const floatVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className={`landing-wrapper ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black dark:from-slate-950 dark:via-[#0a0f1e] dark:to-black min-h-screen text-white transition-colors duration-500">
        
        {/* Background Effects (Blobs) */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl mix-blend-screen filter dark:bg-blue-900/20 dark:mix-blend-screen animate-blob"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl mix-blend-screen filter dark:bg-purple-900/20 dark:mix-blend-screen animate-blob animation-delay-2000"></div>
        </div>

        {/* Header / Navbar */}
        <header className="fixed w-full top-0 z-50 backdrop-blur-md bg-white/5 dark:bg-black/30 border-b border-white/10 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <GraduationCap className="text-white" size={20} />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 dark:from-white dark:to-gray-400 group-hover:to-blue-400 transition-all">
                Edu Mentor
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-sm font-medium hover:text-blue-400 transition-colors">Home</a>
              <a href="#ecosystem" className="text-sm font-medium hover:text-blue-400 transition-colors">How it Works</a>
              <a href="#courses" className="text-sm font-medium hover:text-blue-400 transition-colors">Courses</a>
              <a href="#mentors" className="text-sm font-medium hover:text-blue-400 transition-colors">For Mentors</a>
              <a href="#companies" className="text-sm font-medium hover:text-blue-400 transition-colors">For Companies</a>
            </nav>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-yellow-400 dark:text-yellow-300"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link to="/login" className="hidden sm:block px-5 py-2.5 rounded-lg border border-white/20 hover:bg-white/10 transition-all text-sm font-medium">
                Sign In
              </Link>
              <Link to="/register" className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/25 transition-all text-sm font-bold text-white">
                Join Now
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section id="home" className="relative pt-40 pb-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Connecting Talent with Opportunity
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Build the Future  <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 animate-gradient">
                One Skill at a Time
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Don't just learn—get hired. We bridge the gap between education and employment. 
              Connect with expert mentors, build real-world projects, and get recruited by top tech companies.
            </p>

           

            {/* Search Bar */}
            <div className="relative max-w-3xl mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-2xl">
                <button 
                  onClick={toggleSearchType}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-sm font-medium text-gray-300 min-w-[140px] justify-center"
                >
                  {searchTypes[searchTypeIndex]}
                  <ArrowRight size={14} className="rotate-90" />
                </button>
                <input 
                  type="text" 
                  className="search-input flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 px-4 text-lg"
                  placeholder="What do you want to learn today?" 
                />
                <button 
                  onClick={handleSearch}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
                >
                  <Search size={20} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* THE ECOSYSTEM SECTION (Value Prop for 3 Actors) */}
        <section id="ecosystem" className="py-24 px-6 bg-slate-900/30 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">One Platform, Three Solutions</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">We solve the disconnect in the tech industry by creating a seamless loop for all stakeholders.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* For Students */}
              <motion.div 
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-blue-500/20 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <GraduationCap size={120} className="text-blue-500" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400">
                  <Target size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">For Students</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Stop learning in isolation. Access industry-relevant curriculums, get 1-on-1 mentorship, and build a portfolio that gets you hired.
                </p>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500"/> Verified Career Paths</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500"/> Real Project Experience</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500"/> Direct Company Access</li>
                </ul>
              </motion.div>

              {/* For Mentors */}
              <motion.div 
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-purple-500/20 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Award size={120} className="text-purple-500" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                  <Users size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">For Mentors</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Monetize your expertise without the hassle. We provide the tools, the students, and the platform for you to build your brand.
                </p>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-purple-500"/> Content Creation Tools</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-purple-500"/> Flexible Income Streams</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-purple-500"/> Professional Recognition</li>
                </ul>
              </motion.div>

              {/* For Companies */}
              <motion.div 
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-cyan-500/20 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Building2 size={120} className="text-cyan-500" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400">
                  <Briefcase size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">For Companies</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Cut recruitment costs and time. Hire pre-vetted, upskilled talent who have already proven their skills through our platform.
                </p>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-cyan-500"/> Vetted Talent Pool</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-cyan-500"/> Brand Sponsorship</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-cyan-500"/> Reduced Onboarding Time</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works (The Lifecycle) */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">From Learner to Professional</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 z-0"></div>

              {/* Step 1 */}
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto bg-slate-900 border-2 border-blue-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  <Code size={40} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">1. Learn & Build</h3>
                <p className="text-gray-400">Enroll in courses and work on real-world projects guided by industry experts.</p>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto bg-slate-900 border-2 border-purple-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                  <Award size={40} className="text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">2. Get Certified</h3>
                <p className="text-gray-400">Receive skill badges and project verifications that prove your competency to employers.</p>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto bg-slate-900 border-2 border-cyan-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  <Briefcase size={40} className="text-cyan-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">3. Get Hired</h3>
                <p className="text-gray-400">Your profile is pushed to partner companies looking for your specific skill set.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories (Glass Cards) */}
        <section className="py-20 px-6 relative bg-slate-900/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">In-Demand Skills</h2>
                <p className="text-gray-400">Curated domains based on market needs.</p>
              </div>
              <Link to="#" className="hidden md:flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors">
                View All Paths <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Cpu size={32} />, title: "Artificial Intelligence", desc: "LLMs, Computer Vision, NLP", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30" },
                { icon: <Code size={32} />, title: "Full Stack Dev", desc: "React, Node.js, AWS", color: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30" },
                { icon: <Palette size={32} />, title: "Product Design", desc: "UX Research, Figma", color: "from-orange-500/20 to-red-500/20", border: "border-orange-500/30" },
                { icon: <BarChart size={32} />, title: "Data Analytics", desc: "SQL, Tableau, Python", color: "from-green-500/20 to-emerald-500/20", border: "border-green-500/30" }
              ].map((cat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="group relative p-6 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-white/5 hover:border-white/20 transition-all cursor-pointer overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl bg-slate-900 border ${cat.border} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                      {cat.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{cat.title}</h3>
                    <p className="text-sm text-gray-400">{cat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section id="courses" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Featured Programs</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "AI Engineering Bootcamp", img: "https://picsum.photos/seed/aiagent/600/400", tag: "Top Rated", students: "1.2k" },
                { title: "Full-Stack Career Track", img: "https://picsum.photos/seed/cyber/600/400", tag: "Job Guarantee", students: "3.5k" },
                { title: "Cloud Architect Pro", img: "https://picsum.photos/seed/cloud/600/400", tag: "Certified", students: "900" }
              ].map((course, i) => (
                <div key={i} className="group rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-blue-500/50 transition-colors shadow-xl">
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
                    <img src={course.img} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <span className="absolute top-4 left-4 z-20 px-3 py-1 text-xs font-bold uppercase tracking-wide bg-blue-600 text-white rounded-md">
                      {course.tag}
                    </span>
                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-blue-600 transition-colors">
                        <PlayCircle size={32} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{course.title}</h3>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center gap-1"><Users size={14}/> {course.students} enrolled</div>
                      <div className="flex items-center gap-1 text-yellow-500"><span>★★★★★</span> 4.8</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partner Companies Section (New) */}
        <section id="companies" className="py-16 px-6 border-y border-white/5 bg-black/20">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">Trusted by innovative companies hiring our talent</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholder Logos using Text/Icons for demo */}
              <div className="flex items-center gap-2 text-2xl font-bold"><Building2 /> TechCorp</div>
              <div className="flex items-center gap-2 text-2xl font-bold"><Globe /> GlobalNet</div>
              <div className="flex items-center gap-2 text-2xl font-bold"><Cpu /> AI Solutions</div>
              <div className="flex items-center gap-2 text-2xl font-bold"><TrendingUp /> FinServe</div>
              <div className="flex items-center gap-2 text-2xl font-bold"><Palette /> DesignHub</div>
            </div>
            <div className="mt-8">
                <Link to="/partners" className="text-blue-400 text-sm font-medium hover:underline">View all hiring partners &rarr;</Link>
            </div>
          </div>
        </section>

               {/* Footer */}
               <footer className="border-t border-white/10 bg-black/40 pt-16 pb-8 px-6 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="text-blue-500" size={24} />
                <span className="text-xl font-bold text-white">Edu Mentor</span>
              </div>
              <p className="text-gray-400 max-w-sm mb-6">
                Closing the gap between education and employment. The first platform that rewards learning with real career opportunities.
              </p>
              
              {/* Social Media Icons */}
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all duration-300">
                  <Facebook size={20} />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-sky-500 hover:border-sky-500 transition-all duration-300">
                  <Twitter size={20} />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-pink-600 hover:border-pink-600 transition-all duration-300">
                  <Instagram size={20} />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Browse Courses</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Become a Mentor</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">For Companies</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Hire Talent</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Partner With Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Sponsor a Course</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Sales</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-gray-600 text-sm pt-8 border-t border-white/5">
            &copy; 2026 Edu Mentor Platform. All rights reserved.
          </div>
        </footer>

      </div>
    </div>
  );
};

export default LandingPage;