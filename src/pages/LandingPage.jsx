import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, MeshReflectorMaterial, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import {
  GraduationCap, Briefcase, Users,
  Globe, Cpu, Palette,
  TrendingUp, ArrowRight, CheckCircle, PlayCircle,
  Code, Award, Building2, BarChart, Target,
  Facebook, Twitter, Instagram, Calendar, Link as LinkIcon, PlusCircle,
  ArrowLeft, Search, Star, MapPin, ExternalLink, UserCheck, ShieldCheck, Zap, BookOpen, Layers, Clock, Filter
} from 'lucide-react';
import './LandingPage.css';

/* ═══════════════════════════════════════════
   CONCRETE TEXTURE
   ═══════════════════════════════════════════ */
function genConcrete() {
  const s = 512, c = document.createElement('canvas');
  c.width = s; c.height = s;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#08080d'; ctx.fillRect(0, 0, s, s);
  const img = ctx.getImageData(0, 0, s, s);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n + 2;
  }
  ctx.putImageData(img, 0, 0);
  for (let i = 0; i < 35; i++) {
    ctx.beginPath();
    const x1 = Math.random() * s, y1 = Math.random() * s;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + (Math.random() - 0.5) * 120, y1 + (Math.random() - 0.5) * 120);
    ctx.strokeStyle = `rgba(10,10,16,${Math.random() * 0.35 + 0.1})`;
    ctx.lineWidth = Math.random() * 2.5 + 0.5; ctx.stroke();
  }
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * s, y = Math.random() * s, r = Math.random() * 55 + 20;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(0,0,0,0.14)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(4, 4);
  return tex;
}

/* ═══════════════════════════════════════════
   SHARED 3D COMPONENTS
   ═══════════════════════════════════════════ */
function FloatingParticles() {
  const ref = useRef();
  const N = 40;
  const pos = useMemo(() => {
    const p = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10;
      p[i * 3 + 1] = Math.random() * 6 - 2;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return p;
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, [pos]);
  useFrame(st => { if (ref.current) ref.current.rotation.y = st.clock.elapsedTime * 0.01; });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.025} color="#7C3AED" transparent opacity={0.35} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function AutoOrbitControls() {
  const ref = useRef();
  const timer = useRef(null);
  useEffect(() => {
    const onKey = e => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (ref.current) ref.current.autoRotate = !ref.current.autoRotate;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <OrbitControls
      ref={ref} autoRotate autoRotateSpeed={0.35}
      enableZoom={false} enablePan={false}
      maxPolarAngle={Math.PI / 2.1} minPolarAngle={Math.PI / 4}
      onStart={() => { if (ref.current) ref.current.autoRotate = false; clearTimeout(timer.current); }}
      onEnd={() => { timer.current = setTimeout(() => { if (ref.current) ref.current.autoRotate = true; }, 4000); }}
    />
  );
}

/* ═══════════════════════════════════════════
   EDTECH ATOM COMPONENTS
   ═══════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   FLOATING UI CARDS — 3D Background
   ═══════════════════════════════════════════════════════════════ */
const UI_CARDS = [
  { Icon: BookOpen,      label: 'LEARN',   color: '#3B82F6', angle: 0,                 yOff:  0.15 },
  { Icon: GraduationCap, label: 'CERTIFY', color: '#A855F7', angle: (Math.PI * 2) / 3, yOff: -0.10 },
  { Icon: Building2,     label: 'HIRE',    color: '#06B6D4', angle: (Math.PI * 4) / 3, yOff:  0.25 },
];

const ORBIT_RADIUS = 1.6;
const ORBIT_SPEED  = 0.18;

const _uiPlane = new THREE.PlaneGeometry(1.3, 1.7);
const _uiEdges = new THREE.EdgesGeometry(_uiPlane);
const _glowPlane = new THREE.PlaneGeometry(1.34, 1.74);
const _glowEdges = new THREE.EdgesGeometry(_glowPlane);

function FloatingUICard({ config, index, hovered, onHover }) {
  const ref       = useRef();
  const borderRef = useRef();
  const glowRef   = useRef();
  const { Icon, label, color, angle: initAngle, yOff } = config;

  useFrame((st) => {
    if (!ref.current) return;
    const t = st.clock.elapsedTime;
    const a = initAngle + t * ORBIT_SPEED;
    const x = Math.cos(a) * ORBIT_RADIUS;
    const z = Math.sin(a) * ORBIT_RADIUS;
    const y = yOff + Math.sin(t * 0.5 + index * 2.1) * 0.06;
    ref.current.position.set(x, y, z);

    const cam = new THREE.Vector3();
    st.camera.getWorldPosition(cam);
    ref.current.rotation.y = Math.atan2(cam.x - x, cam.z - z);

    const s = hovered ? 1.14 : 1.0;
    ref.current.scale.lerp(new THREE.Vector3(s, s, s), 0.06);

    if (borderRef.current)
      borderRef.current.material.opacity = THREE.MathUtils.lerp(borderRef.current.material.opacity, hovered ? 0.85 : 0.3, 0.05);
    if (glowRef.current)
      glowRef.current.material.opacity = THREE.MathUtils.lerp(glowRef.current.material.opacity, hovered ? 0.45 : 0.08, 0.05);
  });

  return (
    <group
      ref={ref}
      onPointerOver={(e) => { e.stopPropagation(); onHover(true); }}
      onPointerOut={(e)  => { e.stopPropagation(); onHover(false); }}
    >
      <mesh geometry={_uiPlane}>
        <meshPhysicalMaterial color={color} transparent opacity={hovered ? 0.10 : 0.03} roughness={0.05} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments ref={borderRef} geometry={_uiEdges}>
        <lineBasicMaterial color={color} transparent opacity={0.3} />
      </lineSegments>
      <lineSegments ref={glowRef} geometry={_glowEdges}>
        <lineBasicMaterial color={color} transparent opacity={0.08} />
      </lineSegments>

      <Html center transform distanceFactor={5} style={{ pointerEvents: 'none' }}>
        <div style={{
          width: '112px',
          background: hovered ? 'rgba(2,6,23,0.88)' : 'rgba(2,6,23,0.72)',
          border: `1px solid ${hovered ? color + '66' : color + '22'}`,
          borderRadius: '10px', overflow: 'hidden',
          boxShadow: `0 0 ${hovered ? '24' : '10'}px ${color}18, inset 0 1px 0 rgba(255,255,255,0.05)`,
          transition: 'all 0.35s ease',
          backdropFilter: 'blur(12px)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '5px 8px', background: 'rgba(0,0,0,0.35)',
            borderBottom: `1px solid ${color}11`,
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#eab308' }} />
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ flex: 1, textAlign: 'center', fontSize: '5.5px', color: '#475569', fontFamily: 'monospace', letterSpacing: '1.5px' }}>{label}</span>
          </div>
          <div style={{ padding: '14px 0 6px', display: 'flex', justifyContent: 'center', filter: `drop-shadow(0 0 10px ${color})` }}>
            <Icon size={22} color={color} strokeWidth={1.5} />
          </div>
          <div style={{ textAlign: 'center', fontSize: '7.5px', letterSpacing: '2.5px', color, fontFamily: 'monospace', marginBottom: '8px', textShadow: `0 0 8px ${color}` }}>{label}</div>
          <div style={{ height: '1px', margin: '0 8px', background: `linear-gradient(90deg, transparent, ${color}33, transparent)` }} />
          <div style={{ padding: '8px 10px 6px' }}>
            <div style={{ height: '2px', background: `${color}18`, borderRadius: '1px', marginBottom: '4px' }} />
            <div style={{ height: '2px', background: `${color}12`, borderRadius: '1px', width: '72%', marginBottom: '4px' }} />
            <div style={{ height: '2px', background: `${color}0a`, borderRadius: '1px', width: '48%' }} />
          </div>
          <div style={{ padding: '0 10px 8px' }}>
            <div style={{
              height: '15px', borderRadius: '4px',
              background: `linear-gradient(90deg, ${color}30, ${color}18)`,
              border: `1px solid ${color}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '5.5px', color, fontFamily: 'monospace', letterSpacing: '1.5px',
              textShadow: `0 0 6px ${color}`,
            }}>OPEN →</div>
          </div>
        </div>
      </Html>
    </group>
  );
}

function CenterGlow({ hovered }) {
  const ref = useRef();
  const ringRef = useRef();
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    if (ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(t * 2) * 0.15);
      ref.current.material.emissiveIntensity = THREE.MathUtils.lerp(ref.current.material.emissiveIntensity, hovered ? 4 : 2, 0.04);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.4;
      ringRef.current.material.opacity = (hovered ? 0.35 : 0.12) + Math.sin(t * 1.5) * 0.05;
    }
  });
  return (
    <group position={[0, 0.1, 0]}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#6366F1" emissiveIntensity={2} />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.19, 32]} />
        <meshBasicMaterial color="#6366F1" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function OrbitPath() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
      <ringGeometry args={[ORBIT_RADIUS - 0.008, ORBIT_RADIUS + 0.008, 80]} />
      <meshBasicMaterial color="#6366F1" transparent opacity={0.06} side={THREE.DoubleSide} />
    </mesh>
  );
}

function TrailDots() {
  const refs = useRef([]);
  useFrame((st) => {
    const t = st.clock.elapsedTime;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const idx = i * 3 + j;
        if (!refs.current[idx]) continue;
        const a = UI_CARDS[i].angle + t * ORBIT_SPEED - j * 0.12;
        refs.current[idx].position.set(
          Math.cos(a) * ORBIT_RADIUS,
          UI_CARDS[i].yOff + Math.sin(t * 0.5 + i * 2.1) * 0.06,
          Math.sin(a) * ORBIT_RADIUS
        );
      }
    }
  });
  return (
    <group>
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color="#8B5CF6" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function EdTechAtomScene() {
  const [hoveredCard, setHoveredCard] = useState(-1);
  const { gl } = useThree();
  const concreteTex = useMemo(() => genConcrete(), []);

  useEffect(() => {
    gl.domElement.style.cursor = hoveredCard >= 0 ? 'pointer' : 'default';
  }, [hoveredCard, gl]);

  const handleHover = useCallback((i) => (v) => setHoveredCard(v ? i : -1), []);

  return (
    <>
      <ambientLight intensity={0.08} />
      <pointLight position={[5, 7, 5]}   intensity={2} color="#3B82F6" distance={18} />
      <pointLight position={[-5, 7, -5]} intensity={2} color="#A855F7" distance={18} />
      <spotLight  position={[0, 10, 2]}  intensity={3} angle={0.3} penumbra={1} color="#4F46E5" />
      <pointLight position={[0, 0.1, 0]} intensity={hoveredCard >= 0 ? 2.2 : 0.8} color="#6366F1" distance={5} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[10, 10]} />
        <MeshReflectorMaterial blur={[300, 80]} resolution={512} mixBlur={1} mixStrength={15} roughness={0.85} depthScale={1.2} minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#06060f" metalness={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.49, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial map={concreteTex} transparent opacity={0.4} depthWrite={false} />
      </mesh>

      <group position={[0, 0.2, 0]}>
        <CenterGlow hovered={hoveredCard >= 0} />
        <OrbitPath />
        <TrailDots />
        {UI_CARDS.map((cfg, i) => (
          <FloatingUICard key={i} config={cfg} index={i} hovered={hoveredCard === i} onHover={handleHover(i)} />
        ))}
      </group>

      <FloatingParticles />

      <EffectComposer>
        <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} intensity={0.85} mipmapBlur />
      </EffectComposer>

      <AutoOrbitControls />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Helper: فحص صلاحية الطالب
   ═══════════════════════════════════════════════════════════════ */
const useStudentGuard = () => {
  const navigate = useNavigate();
  const check = (action) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!token || !user) {
      navigate('/register?role=student');
      return false;
    }
    if (user.role !== 'student') {
      alert('عذراً، فقط الطلاب يمكنهم القيام بهذا الإجراء.\nيرجى تسجيل الدخول بحساب طالب.');
      return false;
    }
    return true;
  };
  return { check, navigate };
};

/* ═══════════════════════════════════════════════════════════════
   Helper: رابط صورة الكورس
   ═══════════════════════════════════════════════════════════════ */
const getCourseImage = (course) => {
  const imgFields = ['thumbnail', 'image', 'coverImage', 'courseImage', 'course_image', 'cover_image', 'photo', 'picture', 'img', 'imageUrl', 'image_url', 'thumbnailUrl', 'thumbnail_url'];
  for (const field of imgFields) {
    if (course[field]) {
      const val = course[field];
      if (val.startsWith('http')) return val;
      const basePath = 'http://localhost:5000';
      return val.startsWith('/') ? `${basePath}${val}` : `${basePath}/${val}`;
    }
  }
  const seed = (course.category || course.title || 'course').replace(/\s+/g, '-').toLowerCase();
  return `https://picsum.photos/seed/${seed}/600/400`;
};

/* ═══════════════════════════════════════════════════════════════
   كرت كورس موحد (يستخدم في الصفحات كلها)
   ═══════════════════════════════════════════════════════════════ */
const CourseCard = ({ course, index, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.08 }}
    whileHover={{ y: -6 }}
    onClick={onClick}
    className="group rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-blue-500/50 transition-all shadow-xl cursor-pointer relative"
  >
    <div className="absolute top-4 right-4 z-30 px-2 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm border border-white/10 text-[9px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1">
      <GraduationCap size={10} /> Students Only
    </div>
    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-700 via-blue-900/40 to-slate-800">
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
      <img
        src={getCourseImage(course)}
        alt={course.title || 'Course'}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      {course.category && (
        <span className="absolute top-4 left-4 z-20 px-3 py-1 text-xs font-bold uppercase tracking-wide bg-blue-600 text-white rounded-md">{course.category}</span>
      )}
      <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white">
          <ArrowRight size={32} className="rotate-[-45deg]" />
        </div>
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-2 line-clamp-1">{course.title || 'Untitled Course'}</h3>
      {course.description && <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description}</p>}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <Users size={14} /> {course.enrolledStudents?.length || course.students?.length || course.enrollments || 0} enrolled
        </div>
        {course.rating && (
          <div className="flex items-center gap-1 text-yellow-500"><Star size={14} fill="currentColor" /> {course.rating}</div>
        )}
      </div>
    </div>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════
   كرت ورشة موحد
   ═══════════════════════════════════════════════════════════════ */
const WorkshopCard = ({ ws, index, onJoin }) => (
  <motion.div key={ws._id} whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.08 }}
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
          <div className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded-md border border-slate-700"><LinkIcon size={12} className="text-blue-400" /> Online</div>
        )}
        <div className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded-md border border-slate-700"><Users size={12} className="text-purple-400" /> {ws.attendees ? ws.attendees.length : 0} Registered</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onJoin(ws._id); }}
        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/20">
        <PlusCircle size={18} /> Register Now
      </button>
    </div>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════
   صفحة جميع الكورسات
   ═══════════════════════════════════════════════════════════════ */
export const AllCoursesPage = () => {
  const { check, navigate } = useStudentGuard();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch('http://localhost:5000/api/courses', { headers });
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : data.courses || []);
        }
      } catch (error) { console.error("Error fetching courses:", error); }
      finally { setLoading(false); }
    };
    fetchCourses();
  }, []);

  const categories = ['all', ...new Set(courses.map(c => c.category).filter(Boolean))];
  const filteredCourses = courses.filter(c => {
    const matchSearch = c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || c.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleClick = (course) => {
    if (check()) navigate(`/courses/${course._id}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="fixed w-full top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <GraduationCap className="text-white" size={20} />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Edu Mentor</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </header>

      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-600/15 rounded-full blur-[120px]"></div>
        <div className="absolute top-40 right-1/4 w-60 h-60 bg-purple-600/10 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-4">
              <BookOpen size={12} /> All Courses
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Explore All{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">Courses</span>
            </h1>
            <p className="text-gray-400 max-w-2xl text-lg">Master in-demand skills with expert-led courses. Only students can enroll.</p>
            <div className="flex items-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{courses.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Courses</div>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{categories.length - 1}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Categories</div>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{courses.reduce((a, c) => a + (c.enrolledStudents?.length || c.students?.length || 0), 0)}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Enrollments</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Search courses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all" />
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {categories.slice(0, 7).map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-800/60 text-gray-400 border border-white/10 hover:border-white/20 hover:text-white'}`}>
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-400">Loading courses...</span>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <Search size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-500 text-lg">No courses found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course, i) => (
                <CourseCard key={course._id} course={course} index={i} onClick={() => handleClick(course)} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   صفحة جميع الورش
   ═══════════════════════════════════════════════════════════════ */
export const AllWorkshopsPage = () => {
  const { check, navigate } = useStudentGuard();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all | upcoming | past

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch('http://localhost:5000/api/workshops', { headers });
        if (res.ok) { const data = await res.json(); setWorkshops(data); }
      } catch (error) { console.error("Error fetching workshops:", error); }
      finally { setLoading(false); }
    };
    fetchWorkshops();
  }, []);

  const now = new Date();
  const filteredWorkshops = workshops.filter(ws => {
    const matchSearch = ws.title?.toLowerCase().includes(searchTerm.toLowerCase()) || ws.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const wsDate = new Date(ws.date);
    let matchFilter = true;
    if (filter === 'upcoming') matchFilter = wsDate >= now;
    if (filter === 'past') matchFilter = wsDate < now;
    return matchSearch && matchFilter;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleJoin = async (workshopId) => {
    if (!check()) return;
    try {
      const token = localStorage.getItem('token');
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
      } else { alert(data.message || "Failed to join"); }
    } catch (error) { console.error(error); alert("Server Error"); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="fixed w-full top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <GraduationCap className="text-white" size={20} />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Edu Mentor</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </header>

      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-cyan-600/15 rounded-full blur-[120px]"></div>
        <div className="absolute top-40 left-1/3 w-60 h-60 bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[10px] font-bold uppercase tracking-widest mb-4">
              <Calendar size={12} /> All Workshops
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              All{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">Workshops</span>
            </h1>
            <p className="text-gray-400 max-w-2xl text-lg">Live interactive sessions with industry experts. Register to secure your spot.</p>
            <div className="flex items-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{workshops.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Total</div>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{workshops.filter(w => new Date(w.date) >= now).length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Upcoming</div>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{workshops.reduce((a, w) => a + (w.attendees?.length || 0), 0)}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Registrations</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Search workshops..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all" />
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'past', label: 'Past' }
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.key ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25' : 'bg-slate-800/60 text-gray-400 border border-white/10 hover:border-white/20 hover:text-white'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-400">Loading workshops...</span>
            </div>
          ) : filteredWorkshops.length === 0 ? (
            <div className="text-center py-20">
              <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-500 text-lg">No workshops found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredWorkshops.map((ws, i) => (
                <WorkshopCard key={ws._id} ws={ws} index={i} onJoin={handleJoin} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   صفحة جميع المسارات التعليمية
   ═══════════════════════════════════════════════════════════════ */
export const AllPathsPage = () => {
  const { check, navigate } = useStudentGuard();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const paths = [
    { id: 1, icon: <Cpu size={40} />, title: "Artificial Intelligence", desc: "LLMs, Computer Vision, NLP, Deep Learning, Reinforcement Learning", color: "from-blue-500 to-cyan-500", borderColor: "border-blue-500/40", bgHover: "from-blue-500/10 to-cyan-500/10", courses: 12, students: "2.5k", duration: "6-9 months", level: "Advanced", tags: ["Python", "TensorFlow", "PyTorch", "Hugging Face"] },
    { id: 2, icon: <Code size={40} />, title: "Full Stack Development", desc: "React, Node.js, MongoDB, PostgreSQL, AWS, Docker", color: "from-purple-500 to-pink-500", borderColor: "border-purple-500/40", bgHover: "from-purple-500/10 to-pink-500/10", courses: 18, students: "4.2k", duration: "4-6 months", level: "Beginner to Advanced", tags: ["JavaScript", "React", "Node.js", "MongoDB"] },
    { id: 3, icon: <Palette size={40} />, title: "Product Design (UX/UI)", desc: "UX Research, Figma, Prototyping, Design Systems, User Testing", color: "from-orange-500 to-red-500", borderColor: "border-orange-500/40", bgHover: "from-orange-500/10 to-red-500/10", courses: 8, students: "1.8k", duration: "3-5 months", level: "Beginner", tags: ["Figma", "Adobe XD", "Prototyping", "Research"] },
    { id: 4, icon: <BarChart size={40} />, title: "Data Analytics", desc: "SQL, Tableau, Python, Power BI, Statistical Analysis", color: "from-green-500 to-emerald-500", borderColor: "border-green-500/40", bgHover: "from-green-500/10 to-emerald-500/10", courses: 10, students: "3.1k", duration: "3-4 months", level: "Intermediate", tags: ["SQL", "Python", "Tableau", "Power BI"] },
    { id: 5, icon: <ShieldCheck size={40} />, title: "Cybersecurity", desc: "Ethical Hacking, Network Security, SIEM, Penetration Testing", color: "from-red-500 to-rose-600", borderColor: "border-red-500/40", bgHover: "from-red-500/10 to-rose-600/10", courses: 7, students: "1.2k", duration: "5-7 months", level: "Intermediate to Advanced", tags: ["Kali Linux", "Wireshark", "Burp Suite", "OSINT"] },
    { id: 6, icon: <Globe size={40} />, title: "Cloud & DevOps", desc: "AWS, Azure, GCP, Kubernetes, Terraform, CI/CD Pipelines", color: "from-sky-500 to-indigo-500", borderColor: "border-sky-500/40", bgHover: "from-sky-500/10 to-indigo-500/10", courses: 9, students: "2.0k", duration: "4-6 months", level: "Intermediate", tags: ["AWS", "Docker", "Kubernetes", "Terraform"] },
    { id: 7, icon: <Zap size={40} />, title: "Mobile Development", desc: "React Native, Flutter, Swift, Kotlin, App Store Optimization", color: "from-yellow-500 to-orange-500", borderColor: "border-yellow-500/40", bgHover: "from-yellow-500/10 to-orange-500/10", courses: 6, students: "1.5k", duration: "3-5 months", level: "Beginner to Intermediate", tags: ["React Native", "Flutter", "Swift", "Kotlin"] },
    { id: 8, icon: <Layers size={40} />, title: "Blockchain & Web3", desc: "Solidity, Smart Contracts, DeFi, NFTs, DApp Development", color: "from-violet-500 to-purple-600", borderColor: "border-violet-500/40", bgHover: "from-violet-500/10 to-purple-600/10", courses: 5, students: "800", duration: "4-6 months", level: "Advanced", tags: ["Solidity", "Ethereum", "Web3.js", "Hardhat"] },
  ];

  const categories = ['all', 'Beginner', 'Intermediate', 'Advanced'];
  const filteredPaths = paths.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'all' || p.level.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchSearch && matchCategory;
  });

  const handlePathClick = (path) => {
    if (check()) navigate(`/paths/${path.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="fixed w-full top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30"><GraduationCap className="text-white" size={20} /></div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Edu Mentor</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"><ArrowLeft size={16} /> Back to Home</Link>
        </div>
      </header>
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-600/15 rounded-full blur-[120px]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-4"><BookOpen size={12} /> Learning Paths</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">All Learning <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">Paths</span></h1>
            <p className="text-gray-400 max-w-2xl text-lg">Choose your career path and start building the skills that matter.</p>
          </motion.div>
        </div>
      </section>
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Search paths..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all" />
          </div>
          <div className="flex gap-2">{categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-slate-800/60 text-gray-400 border border-white/10 hover:border-white/20 hover:text-white'}`}>{cat === 'all' ? 'All Levels' : cat}</button>
          ))}</div>
        </div>
      </section>
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {filteredPaths.length === 0 ? (
            <div className="text-center py-20"><Search size={48} className="mx-auto text-gray-600 mb-4" /><p className="text-gray-500 text-lg">No paths found.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPaths.map((path, i) => (
                <motion.div key={path.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -6 }} onClick={() => handlePathClick(path)}
                  className="group relative p-8 rounded-3xl bg-slate-800/40 backdrop-blur-md border border-white/5 hover:border-white/20 transition-all cursor-pointer overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${path.bgHover} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-slate-900 border ${path.borderColor} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>{path.icon}</div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${path.color} text-white`}>{path.level}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{path.title}</h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">{path.desc}</p>
                    <div className="flex flex-wrap gap-2 mb-6">{path.tags.map(tag => (<span key={tag} className="px-2 py-1 rounded-md bg-slate-900/80 border border-white/5 text-[11px] text-gray-400">{tag}</span>))}</div>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><BookOpen size={14} /> {path.courses} courses</span>
                        <span className="flex items-center gap-1"><Users size={14} /> {path.students}</span>
                        <span className="flex items-center gap-1"><Calendar size={14} /> {path.duration}</span>
                      </div>
                      <ArrowRight size={18} className="text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   صفحة جميع شركاء التوظيف
   ═══════════════════════════════════════════════════════════════ */
export const AllPartnersPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch('http://localhost:5000/api/company', { headers });
        if (res.ok) { const data = await res.json(); setCompanies(Array.isArray(data) ? data : data.companies || []); }
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanies([
          { _id: '1', name: 'TechCorp', industry: 'Technology', description: 'Leading software solutions provider with global reach.', location: 'Amman, Jordan', website: 'https://techcorp.com', hiring: true, openPositions: 12 },
          { _id: '2', name: 'GlobalNet', industry: 'Networking', description: 'Enterprise networking and cloud infrastructure solutions.', location: 'Dubai, UAE', website: 'https://globalnet.com', hiring: true, openPositions: 8 },
          { _id: '3', name: 'AI Solutions', industry: 'Artificial Intelligence', description: 'Pioneering AI-driven products for healthcare and finance.', location: 'Riyadh, Saudi Arabia', website: 'https://aisolutions.com', hiring: true, openPositions: 15 },
          { _id: '4', name: 'FinServe', industry: 'Finance', description: 'Digital banking and fintech solutions for the modern era.', location: 'Cairo, Egypt', website: 'https://finserve.com', hiring: false, openPositions: 0 },
          { _id: '5', name: 'DesignHub', industry: 'Design', description: 'Creative agency specializing in product design and branding.', location: 'Beirut, Lebanon', website: 'https://designhub.com', hiring: true, openPositions: 5 },
          { _id: '6', name: 'CloudScale', industry: 'Cloud Computing', description: 'Scalable cloud infrastructure and DevOps consulting.', location: 'Istanbul, Turkey', website: 'https://cloudscale.io', hiring: true, openPositions: 10 },
        ]);
      } finally { setLoading(false); }
    };
    fetchCompanies();
  }, []);

  const industries = ['all', ...new Set(companies.map(c => c.industry).filter(Boolean))];
  const filteredCompanies = companies.filter(c => {
    const matchSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchIndustry = selectedIndustry === 'all' || c.industry === selectedIndustry;
    return matchSearch && matchIndustry;
  });

  const industryColors = {
    'Technology': 'from-blue-500 to-cyan-500', 'Networking': 'from-sky-500 to-blue-600',
    'Artificial Intelligence': 'from-purple-500 to-violet-600', 'Finance': 'from-green-500 to-emerald-500',
    'Design': 'from-orange-500 to-red-500', 'Cloud Computing': 'from-indigo-500 to-blue-500',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="fixed w-full top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30"><GraduationCap className="text-white" size={20} /></div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Edu Mentor</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"><ArrowLeft size={16} /> Back to Home</Link>
        </div>
      </header>
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-cyan-600/15 rounded-full blur-[120px]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[10px] font-bold uppercase tracking-widest mb-4"><Briefcase size={12} /> Hiring Partners</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Our Hiring <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">Partners</span></h1>
            <p className="text-gray-400 max-w-2xl text-lg">Top companies trust us to deliver job-ready talent.</p>
            <div className="flex items-center gap-8 mt-8">
              <div className="text-center"><div className="text-3xl font-bold text-white">{companies.length}+</div><div className="text-xs text-gray-500 uppercase tracking-wider">Partners</div></div>
              <div className="w-px h-10 bg-white/10"></div>
              <div className="text-center"><div className="text-3xl font-bold text-white">{companies.filter(c => c.hiring).reduce((a, c) => a + (c.openPositions || 0), 0)}+</div><div className="text-xs text-gray-500 uppercase tracking-wider">Open Positions</div></div>
              <div className="w-px h-10 bg-white/10"></div>
              <div className="text-center"><div className="text-3xl font-bold text-white">{companies.filter(c => c.hiring).length}</div><div className="text-xs text-gray-500 uppercase tracking-wider">Actively Hiring</div></div>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Search companies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all" />
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {industries.slice(0, 6).map(ind => (
              <button key={ind} onClick={() => setSelectedIndustry(ind)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedIndustry === ind ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25' : 'bg-slate-800/60 text-gray-400 border border-white/10 hover:border-white/20 hover:text-white'}`}>{ind === 'all' ? 'All Industries' : ind}</button>
            ))}
          </div>
        </div>
      </section>
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div><span className="ml-3 text-gray-400">Loading partners...</span></div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-20"><Building2 size={48} className="mx-auto text-gray-600 mb-4" /><p className="text-gray-500 text-lg">No companies found.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company, i) => {
                const colorClass = industryColors[company.industry] || 'from-gray-500 to-gray-600';
                return (
                  <motion.div key={company._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.08 }}
                    whileHover={{ y: -6 }} className="group relative p-6 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-white/5 hover:border-white/20 transition-all overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform">{company.name?.charAt(0) || 'C'}</div>
                        {company.hiring ? (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/30"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Hiring</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-700/50 text-gray-500 border border-white/5">Not Hiring</span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{company.name}</h3>
                      {company.industry && <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${colorClass} text-white mb-3`}>{company.industry}</span>}
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{company.description || 'Leading company in their field.'}</p>
                      <div className="flex flex-col gap-2 mb-5 text-sm text-gray-500">
                        {company.location && <span className="flex items-center gap-2"><MapPin size={14} className="text-gray-600" /> {company.location}</span>}
                        {company.hiring && company.openPositions > 0 && <span className="flex items-center gap-2"><UserCheck size={14} className="text-green-500" /> <span className="text-green-400 font-medium">{company.openPositions} open positions</span></span>}
                      </div>
                      {company.website && (
                        <a href={company.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">Visit Website <ExternalLink size={14} /></a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/* ═══════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════ */
export const LandingPage = () => {
  const [darkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = '#020617';
  }, []);

  const { check } = useStudentGuard();

  /* ─── جلب الورش (فقط 3) ─── */
  const [workshops, setWorkshops] = useState([]);
  const [loadingWorkshops, setLoadingWorkshops] = useState(true);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch('http://localhost:5000/api/workshops', { headers });
        if (res.ok) { const data = await res.json(); setWorkshops(data); }
      } catch (error) { console.error("Error fetching workshops:", error); }
      finally { setLoadingWorkshops(false); }
    };
    fetchWorkshops();
  }, []);

  /* ─── جلب الكورسات (فقط 3) ─── */
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch('http://localhost:5000/api/courses', { headers });
        if (res.ok) { const data = await res.json(); setCourses(Array.isArray(data) ? data : data.courses || []); }
      } catch (error) { console.error("Error fetching courses:", error); }
      finally { setLoadingCourses(false); }
    };
    fetchCourses();
  }, []);

  const handleCourseClick = (course) => {
    if (check()) navigate(`/courses/${course._id}`);
  };

  const handleJoinWorkshop = async (workshopId) => {
    if (!check()) return;
    try {
      const token = localStorage.getItem('token');
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
      } else { alert(data.message || "Failed to join"); }
    } catch (error) { console.error(error); alert("Server Error"); }
  };

  return (
    <div className="landing-wrapper dark">
      <div className="bg-slate-950 min-h-screen text-white transition-colors duration-500 font-sans">

        {/* ═══ Header ═══ */}
        <header className="fixed w-full top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <GraduationCap className="text-white" size={20} />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-blue-400 transition-all">Edu Mentor</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-sm font-medium hover:text-blue-400 transition-colors">Home</a>
              <a href="#ecosystem" className="text-sm font-medium hover:text-blue-400 transition-colors">How it Works</a>
              <a href="#courses" className="text-sm font-medium hover:text-blue-400 transition-colors">Courses</a>
              <a href="#workshops" className="text-sm font-medium hover:text-blue-400 transition-colors">Workshops</a>
              <a href="#companies" className="text-sm font-medium hover:text-blue-400 transition-colors">For Companies</a>
            </nav>
            <div className="flex items-center gap-4">
              <Link to="/login" className="hidden sm:block px-5 py-2.5 rounded-lg border border-white/20 hover:bg-white/10 transition-all text-sm font-medium">Sign In</Link>
              <Link to="/register" className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all text-sm font-bold text-white">Join Now</Link>
            </div>
          </div>
        </header>

        {/* ═══ HERO ═══ */}
        <section id="home" className="relative pt-32 pb-20 px-6 overflow-hidden min-h-[90vh] flex items-center">
          {/* 3D Full Background */}
          <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0.5, 6], fov: 40 }} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }} dpr={[1, 2]}>
              <EdTechAtomScene />
            </Canvas>
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60 pointer-events-none"></div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto w-full relative z-10 pointer-events-none">
            <div className="max-w-md">
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }} className="pointer-events-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-[10px] font-bold uppercase tracking-widest mb-4">The Talent Ecosystem</div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight text-white drop-shadow-lg">
                  Connecting <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">Learning to Hiring</span>
                </h1>
                <p className="text-xs md:text-sm text-gray-400 max-w-md leading-relaxed font-light mb-6 drop-shadow-md">Bridging the gap between ambitious students, expert mentors, and top companies through a seamless tech ecosystem.</p>
                <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ ECOSYSTEM ═══ */}
        <section id="ecosystem" className="py-24 px-6 bg-slate-900/30 relative border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">One Platform, Complete Cycle</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Closing the gap between education and the job market.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-blue-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><GraduationCap size={120} className="text-blue-500" /></div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400"><Target size={28} /></div>
                <h3 className="text-2xl font-bold text-white mb-3">For Students</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">Don't just learn. Build a professional portfolio, get verified skills, and connect directly with hiring companies.</p>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500" /> Career-Ready Skills</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-500" /> Direct Job Access</li>
                </ul>
              </motion.div>
              <motion.div whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-purple-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Award size={120} className="text-purple-500" /></div>
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400"><Users size={28} /></div>
                <h3 className="text-2xl font-bold text-white mb-3">For Mentors</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">Share your expertise. Reach students who need your guidance and build a recognized professional brand.</p>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-purple-500" /> Monetize Expertise</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-purple-500" /> Build Your Brand</li>
                </ul>
              </motion.div>
              <motion.div whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-cyan-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Building2 size={120} className="text-cyan-500" /></div>
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400"><Briefcase size={28} /></div>
                <h3 className="text-2xl font-bold text-white mb-3">For Companies</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">Hire pre-vetted talent instantly. Stop searching for skills and start recruiting verified graduates.</p>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-cyan-500" /> Vetted Talent Pool</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-cyan-500" /> Zero Hiring Friction</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">The Path to Employment</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 z-0"></div>
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto bg-slate-900 border-2 border-blue-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]"><Code size={40} className="text-blue-500" /></div>
                <h3 className="text-xl font-bold text-white mb-2">1. Learn</h3>
                <p className="text-gray-400">Master skills through expert-led courses and workshops.</p>
              </div>
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto bg-slate-900 border-2 border-purple-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.3)]"><Award size={40} className="text-purple-500" /></div>
                <h3 className="text-xl font-bold text-white mb-2">2. Verify</h3>
                <p className="text-gray-400">Earn certificates and build a portfolio of real projects.</p>
              </div>
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto bg-slate-900 border-2 border-cyan-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]"><Briefcase size={40} className="text-cyan-500" /></div>
                <h3 className="text-xl font-bold text-white mb-2">3. Get Hired</h3>
                <p className="text-gray-400">Get matched with companies looking for your specific skills.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CATEGORIES ═══ */}
        <section className="py-20 px-6 relative bg-slate-900/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">In-Demand Skills</h2>
                <p className="text-gray-400">Curated domains based on market needs.</p>
              </div>
              <Link to="/all-paths" className="hidden md:flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors">View All Paths <ArrowRight size={16} /></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Cpu size={32} />, title: "Artificial Intelligence", desc: "LLMs, Computer Vision, NLP", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30" },
                { icon: <Code size={32} />, title: "Full Stack Dev", desc: "React, Node.js, AWS", color: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30" },
                { icon: <Palette size={32} />, title: "Product Design", desc: "UX Research, Figma", color: "from-orange-500/20 to-red-500/20", border: "border-orange-500/30" },
                { icon: <BarChart size={32} />, title: "Data Analytics", desc: "SQL, Tableau, Python", color: "from-green-500/20 to-emerald-500/20", border: "border-green-500/30" }
              ].map((cat, i) => (
                <motion.div key={i} whileHover={{ y: -5 }} className="group relative p-6 rounded-2xl bg-slate-800/40 backdrop-blur-md border border-white/5 hover:border-white/20 transition-all cursor-pointer overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl bg-slate-900 border ${cat.border} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>{cat.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{cat.title}</h3>
                    <p className="text-sm text-gray-400">{cat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link to="/all-paths" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors">View All Paths <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>

        {/* ═══ COURSES — فقط 3 + زر عرض الكل ═══ */}
        <section id="courses" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Our Courses</h2>
                <p className="text-gray-400 max-w-xl">Real courses taught by real experts. Click to enroll — student registration required.</p>
              </div>
              <Link to="/all-courses" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 font-medium transition-all text-sm shrink-0">
                View All Courses <ArrowRight size={16} />
              </Link>
            </div>

            {loadingCourses ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-400">Loading courses...</span>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-16 text-gray-500 border border-dashed border-slate-700 rounded-xl">
                <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
                <p>No courses available yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.slice(0, 3).map((course, i) => (
                  <CourseCard key={course._id} course={course} index={i} onClick={() => handleCourseClick(course)} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ═══ WORKSHOPS — فقط 3 + زر عرض الكل ═══ */}
        <section id="workshops" className="py-24 px-6 relative bg-slate-900/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-4">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold mb-2">Upcoming Workshops</h2>
                <p className="text-gray-400 max-w-xl">Live interactive sessions with industry experts. Don't miss out!</p>
              </div>
              <Link to="/all-workshops" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 font-medium transition-all text-sm shrink-0">
                View All Workshops <ArrowRight size={16} />
              </Link>
            </div>

            {loadingWorkshops ? (
              <div className="text-center text-gray-400 py-10">Loading workshops...</div>
            ) : workshops.length === 0 ? (
              <div className="text-center py-10 text-gray-500 border border-dashed border-slate-700 rounded-xl">No workshops scheduled at the moment. Stay tuned!</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {workshops.slice(0, 3).map((ws, i) => (
                  <WorkshopCard key={ws._id} ws={ws} index={i} onJoin={handleJoinWorkshop} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ═══ PARTNER COMPANIES ═══ */}
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
              <Link to="/all-partners" className="inline-flex items-center gap-2 text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
                View all hiring partners <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="border-t border-white/10 bg-black/40 pt-16 pb-8 px-6 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4"><GraduationCap className="text-blue-500" size={24} /><span className="text-xl font-bold text-white">Edu Mentor</span></div>
              <p className="text-gray-400 max-w-sm mb-6">Closing the gap between education and employment. The first platform that rewards learning with real career opportunities.</p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all duration-300"><Facebook size={20} /></a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-sky-500 hover:border-sky-500 transition-all duration-300"><Twitter size={20} /></a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-pink-600 hover:border-pink-600 transition-all duration-300"><Instagram size={20} /></a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/all-courses" className="hover:text-blue-400 transition-colors">Browse Courses</Link></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Become a Mentor</a></li>
                <li><Link to="/all-workshops" className="hover:text-blue-400 transition-colors">Workshops</Link></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">For Companies</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/all-partners" className="hover:text-blue-400 transition-colors">Hire Talent</Link></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Partner With Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Sponsor a Course</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Sales</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-gray-600 text-sm pt-8 border-t border-white/5">&copy; 2026 Edu Mentor Platform. All rights reserved.</div>
        </footer>

      </div>
    </div>
  );
};

export default LandingPage;