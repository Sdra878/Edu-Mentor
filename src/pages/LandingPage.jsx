import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import {
  GraduationCap, Briefcase, Users,
  Globe, Cpu, Palette,
  TrendingUp, ArrowRight, CheckCircle, PlayCircle,
  Code, Award, Building2, UserPlus, BarChart, Target,
  Facebook, Twitter, Instagram, Calendar, Link as LinkIcon, PlusCircle
} from 'lucide-react';
import './LandingPage.css';

/* ============================================
   3D PEDESTAL SCENE — Blue & Purple Theme
   ============================================ */

function NeonEdges({ hovered, geometry }) {
  const ref = useRef();
  useFrame(() => {
    if (ref.current) {
      const target = hovered ? 1.0 : 0.4;
      ref.current.material.opacity = THREE.MathUtils.lerp(
        ref.current.material.opacity, target, 0.06
      );
    }
  });
  return (
    <lineSegments ref={ref} position={[0, 0.5, 0]}>
      <edgesGeometry args={[geometry]} />
      <lineBasicMaterial color="#7C3AED" transparent opacity={0.4} />
    </lineSegments>
  );
}

function HologramModel({ modelIndex, hovered }) {
  const ref = useRef();
  const colors = ['#3B82F6', '#A855F7', '#6366F1'];
  const color = colors[modelIndex];

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.008;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    }
  });

  const geometry = useMemo(() => {
    if (modelIndex === 0) return new THREE.BoxGeometry(1.1, 1.1, 1.1);
    if (modelIndex === 1) return new THREE.SphereGeometry(0.65, 32, 32);
    return new THREE.TorusKnotGeometry(0.45, 0.18, 64, 16);
  }, [modelIndex]);

  return (
    <Float speed={2} rotationIntensity={0} floatIntensity={0.5} floatingRange={[-0.08, 0.08]}>
      <mesh ref={ref} position={[0, 0.5, 0]} geometry={geometry}>
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.5 : 0.5}
          transparent
          opacity={0.8}
          roughness={0.05}
          metalness={0.95}
          wireframe={modelIndex === 2}
        />
      </mesh>
      <mesh position={[0, 0.5, 0]} geometry={geometry} scale={1.25}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.07 : 0.02}
          side={THREE.BackSide}
        />
      </mesh>
    </Float>
  );
}

function FloatingParticles() {
  const ref = useRef();
  const count = 80;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = Math.random() * 10 - 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    return pos;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.015;
      const arr = ref.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        arr[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.0008;
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.04}
        color="#8B5CF6"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function PedestalScene() {
  const [hovered, setHovered] = useState(false);
  const [modelIndex, setModelIndex] = useState(0);
  const { gl } = useThree();
  const baseRingRef1 = useRef();
  const baseRingRef2 = useRef();
  const boxGeo = useMemo(() => new THREE.BoxGeometry(2.5, 3, 2.5), []);

  useEffect(() => {
    gl.domElement.style.cursor = hovered ? 'pointer' : 'default';
  }, [hovered, gl]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (baseRingRef1.current) {
      baseRingRef1.current.material.opacity =
        (hovered ? 0.85 : 0.35) + Math.sin(t * 2) * 0.1;
    }
    if (baseRingRef2.current) {
      baseRingRef2.current.material.opacity =
        (hovered ? 0.7 : 0.2) + Math.cos(t * 1.5) * 0.08;
    }
  });

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 7, 5]} intensity={2.5} color="#3B82F6" distance={20} />
      <pointLight position={[-5, 7, -5]} intensity={2.5} color="#A855F7" distance={20} />
      <spotLight position={[0, 10, 2]} intensity={4} angle={0.35} penumbra={1} color="#4F46E5" />
      <pointLight position={[0, 1.5, 0]} intensity={hovered ? 2 : 0.6} color="#8B5CF6" distance={6} />

      {/* Reflective Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={512}
          mixBlur={1}
          mixStrength={25}
          roughness={0.85}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#06060f"
          metalness={0.5}
        />
      </mesh>

      {/* Hex Base — matte black */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[2, 2.3, 0.3, 6]} />
        <meshStandardMaterial color="#080808" roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh position={[0, -1.35, 0]}>
        <cylinderGeometry args={[2.3, 2.4, 0.05, 6]} />
        <meshStandardMaterial color="#0f0f0f" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Neon ring 1 — Blue */}
      <mesh ref={baseRingRef1} position={[0, -1.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.9, 2.08, 6]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      {/* Neon ring 2 — Purple */}
      <mesh ref={baseRingRef2} position={[0, -1.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.6, 1.72, 6]} />
        <meshBasicMaterial color="#A855F7" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Glass Frame + Neon Edges + Hologram */}
      <group
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); setModelIndex((prev) => (prev + 1) % 3); }}
      >
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2.5, 3, 2.5]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.03}
            roughness={0.05}
            metalness={0}
            side={THREE.DoubleSide}
          />
        </mesh>
        <NeonEdges hovered={hovered} geometry={boxGeo} />
        <HologramModel modelIndex={modelIndex} hovered={hovered} />
      </group>

      <FloatingParticles />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.4}
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 4}
      />
    </>
  );
}

/* ============================================
   MAIN LANDING PAGE
   ============================================ */

export const LandingPage = () => {
  const [darkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = '#020617';
  }, []);

  // === Workshops State & Fetch ===
  const [workshops, setWorkshops] = useState([]);
  const [loadingWorkshops, setLoadingWorkshops] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch('http://localhost:5000/api/workshops', { headers });
        if (res.ok) {
          const data = await res.json();
          setWorkshops(data);
        }
      } catch (error) {
        console.error("Error fetching workshops:", error);
      } finally {
        setLoadingWorkshops(false);
      }
    };

    fetchWorkshops();
  }, []);

  // === Join Workshop Handler ===
  const handleJoinWorkshop = async (workshopId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please Sign In first to register for workshops.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/workshops/join/${workshopId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        alert("Joined successfully!");
        setWorkshops(prev => prev.map(ws =>
          ws._id === workshopId ? { ...ws, attendees: [...(ws.attendees || []), 'new_user'] } : ws
        ));
      } else {
        alert(data.message || "Failed to join");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  return (
    <div className="landing-wrapper dark">
      <div className="bg-slate-950 min-h-screen text-white transition-colors duration-500 font-sans">

        {/* Header / Navbar */}
        <header className="fixed w-full top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <GraduationCap className="text-white" size={20} />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-blue-400 transition-all">
                Edu Mentor
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-sm font-medium hover:text-blue-400 transition-colors">Home</a>
              <a href="#ecosystem" className="text-sm font-medium hover:text-blue-400 transition-colors">How it Works</a>
              <a href="#workshops" className="text-sm font-medium hover:text-blue-400 transition-colors">Workshops</a>
              <a href="#courses" className="text-sm font-medium hover:text-blue-400 transition-colors">Courses</a>
              <a href="#companies" className="text-sm font-medium hover:text-blue-400 transition-colors">For Companies</a>
            </nav>

            <div className="flex items-center gap-4">
              <Link to="/login" className="hidden sm:block px-5 py-2.5 rounded-lg border border-white/20 hover:bg-white/10 transition-all text-sm font-medium">
                Sign In
              </Link>
              <Link to="/register" className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all text-sm font-bold text-white">
                Join Now
              </Link>
            </div>
          </div>
        </header>

        {/* ========================================== */}
        {/* ========== HERO SECTION ================== */}
        {/* ========================================== */}
        <section id="home" className="relative pt-32 pb-20 px-6 overflow-hidden min-h-[90vh] flex items-end">

          {/* 3D PEDESTAL SCENE (replaces voxel canvas) */}
          <div className="absolute inset-0 z-0">
            <Canvas
              camera={{ position: [0, 2, 6], fov: 45 }}
              gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
              dpr={[1, 2]}
            >
              <PedestalScene />
            </Canvas>
          </div>

          {/* Vignette — lighter in center so 3D is visible */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 pointer-events-none"></div>

          {/* CONTENT: BOTTOM LEFT */}
          <div className="max-w-7xl mx-auto w-full relative z-10 text-left pb-16 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="pointer-events-auto max-w-md"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-4">
                The Talent Ecosystem
              </div>

              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight text-white drop-shadow-lg">
                Connecting <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
                  Learning to Hiring
                </span>
              </h1>

              <p className="text-xs md:text-sm text-gray-400 max-w-md leading-relaxed font-light mb-6 drop-shadow-md">
                Bridging the gap between ambitious students, expert mentors, and top companies through a seamless tech ecosystem.
              </p>

              <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
            </motion.div>
          </div>
        </section>

        {/* THE ECOSYSTEM SECTION */}
        <section id="ecosystem" className="py-24 px-6 bg-slate-900/30 relative border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">One Platform, Complete Cycle</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Closing the gap between education and the job market.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  Don't just learn. Build a professional portfolio, get verified skills, and connect directly with hiring companies.
                </p>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500" /> Career-Ready Skills</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500" /> Direct Job Access</li>
                </ul>
              </motion.div>

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
                  Share your expertise. Reach students who need your guidance and build a recognized professional brand.
                </p>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-purple-500" /> Monetize Expertise</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-purple-500" /> Build Your Brand</li>
                </ul>
              </motion.div>

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
                  Hire pre-vetted talent instantly. Stop searching for skills and start recruiting verified graduates.
                </p>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-cyan-500" /> Vetted Talent Pool</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-cyan-500" /> Zero Hiring Friction</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">The Path to Employment</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 z-0"></div>

              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto bg-slate-900 border-2 border-blue-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  <Code size={40} className="text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">1. Learn</h3>
                <p className="text-gray-400">Master skills through expert-led courses and workshops.</p>
              </div>

              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto bg-slate-900 border-2 border-purple-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                  <Award size={40} className="text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">2. Verify</h3>
                <p className="text-gray-400">Earn certificates and build a portfolio of real projects.</p>
              </div>

              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto bg-slate-900 border-2 border-cyan-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  <Briefcase size={40} className="text-cyan-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">3. Get Hired</h3>
                <p className="text-gray-400">Get matched with companies looking for your specific skills.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
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
                      <div className="flex items-center gap-1"><Users size={14} /> {course.students} enrolled</div>
                      <div className="flex items-center gap-1 text-yellow-500"><span>★★★★★</span> 4.8</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WORKSHOPS SECTION */}
        <section id="workshops" className="py-24 px-6 relative bg-slate-900/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Upcoming Workshops</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Live interactive sessions with industry experts. Don't miss out!</p>
            </div>

            {loadingWorkshops ? (
              <div className="text-center text-gray-400 py-10">Loading workshops...</div>
            ) : workshops.length === 0 ? (
              <div className="text-center py-10 text-gray-500 border border-dashed border-slate-700 rounded-xl">
                No workshops scheduled at the moment. Stay tuned!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {workshops.map(ws => (
                  <motion.div
                    key={ws._id}
                    whileHover={{ y: -5 }}
                    className="group relative p-6 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-4">
                        <Calendar size={16} /> {new Date(ws.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">{ws.title}</h3>
                      <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-3">{ws.description || "Join us for an exciting and interactive live session!"}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                        {ws.meeting_link && (
                          <div className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded-md border border-slate-700">
                            <LinkIcon size={12} className="text-blue-400" /> Online
                          </div>
                        )}
                        <div className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded-md border border-slate-700">
                          <Users size={12} className="text-purple-400" /> {ws.attendees ? ws.attendees.length : 0} Registered
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinWorkshop(ws._id)}
                        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/20"
                      >
                        <PlusCircle size={18} /> Register Now
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Partner Companies Section */}
        <section id="companies" className="py-16 px-6 border-y border-white/5 bg-black/20">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">Trusted by innovative companies hiring our talent</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
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
                <li><a href="#workshops" className="hover:text-blue-400 transition-colors">Workshops</a></li>
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