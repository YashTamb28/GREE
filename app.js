/**
 * GREE 3D Website Core Application Engine
 * Powered by Three.js, GSAP, and Web Audio API
 */

// Brand specifications from GREE Creative Service Packages
const BRAND_DATA = {
    social: {
        title: "Social Media Management",
        subtitle: "End-to-end creative solutions for modern brands.",
        desc: "Everything your brand needs to scale social presence with professional, high-performance strategy.",
        plans: [
            {
                name: "Social Start",
                price: "₹25,000 / mo",
                features: ["Social Media Strategy", "Monthly Content Calendar", "Feed Planning", "12 Content Pieces", "Caption Writing", "SEO Strategy", "Content Scheduling & Publishing", "Monthly Performance Report", "1 Revision Round"]
            },
            {
                name: "Social Growth",
                price: "₹35,000 / mo",
                features: ["20 Content Pieces", "Story Management (12–15 Stories)", "Community Management", "Monthly Strategy Call", "Competitor Analysis", "Trend Research", "Monthly Content Optimisation", "Priority Support", "2 Revision Rounds"]
            },
            {
                name: "Social Elite",
                price: "₹50,000 / mo",
                features: ["28–30 Premium Content Pieces", "1 Professional Content Shoot Every Month", "Dedicated Creative Director", "Dedicated Account Manager", "Campaign Planning", "Advanced Content Strategy", "Advanced Community Management", "Creative Concepts for Ads & Campaigns", "Monthly Performance Presentation", "Unlimited Strategy Calls", "Unlimited Revision Support"]
            }
        ]
    },
    content: {
        title: "Content Production",
        subtitle: "High-end product photography & visual assets.",
        desc: "Make your brand visually striking with premium cinematic production and content shoots.",
        plans: [
            {
                name: "Content Production",
                price: "₹20,000",
                features: ["Half-Day Shoot", "Product Photography", "Product Videography", "10 Edited Images", "3 Professionally Edited Reels", "Basic Creative Direction"]
            },
            {
                name: "Content Pro",
                price: "₹40,000",
                features: ["Full-Day Shoot", "Product & Lifestyle Photography", "Product & Lifestyle Reels", "Creative Direction", "Shot Planning", "25 Edited Images", "6 Premium Reels", "Behind-the-Scenes Content"]
            },
            {
                name: "Content Signature",
                price: "₹60,000",
                features: ["Campaign Strategy", "Creative Concept Development", "Moodboard & Art Direction", "Shot List Planning", "Full Production Management", "Model Coordination", "Location Coordination", "Styling Guidance", "Premium Photography", "Cinematic Video Production", "50+ Edited Images", "10+ Premium Reels", "Behind-the-Scenes Coverage", "Campaign Deliverables Ready for Launch"]
            }
        ]
    },
    branding: {
        title: "Branding & Identity",
        subtitle: "Custom visual systems for disruptive companies.",
        desc: "Establish a profound identity with professional typography, assets, color theories, and guidelines.",
        plans: [
            {
                name: "Brand Foundation",
                price: "₹20,000",
                features: ["Brand Discovery Session", "Moodboard", "Colour Palette", "Typography Selection", "Visual Direction"]
            },
            {
                name: "Brand Identity",
                price: "₹40,000",
                features: ["Everything in Brand Foundation", "Logo Design", "Brand Guidelines", "Brand Assets", "Social Media Brand Kit"]
            },
            {
                name: "Brand Experience",
                price: "₹60,000",
                features: ["Everything in Brand Identity", "Complete Brand Strategy", "Packaging Direction", "Brand Voice", "Launch Creative Assets", "Marketing Collateral", "Social Media Launch Kit"]
            }
        ]
    },
    website: {
        title: "Website Design",
        subtitle: "Premium digital interfaces & high-converting stores.",
        desc: "Custom landing pages, robust multi-page CMS sites, and optimized e-commerce setups built for speed.",
        plans: [
            {
                name: "Launch",
                price: "₹20,000",
                features: ["Landing Page", "Responsive Design", "Contact Forms", "Basic SEO"]
            },
            {
                name: "Business",
                price: "₹40,000",
                features: ["Multi-Page Website", "CMS Integration", "Mobile Optimisation", "Basic SEO", "Contact Forms", "Google Maps Integration"]
            },
            {
                name: "Commerce",
                price: "₹60,000",
                features: ["Shopify Store Setup", "Theme Customisation", "Product Upload", "Collection Organisation", "Payment Gateway Integration", "Shipping Setup", "Mobile Optimisation", "Basic SEO", "Training Session"]
            }
        ]
    },
    consulting: {
        title: "Creative Consulting",
        subtitle: "One-on-one audits & execution roadmap.",
        desc: "Unlock bottlenecks, audits of Instagram & content vectors, with actionable strategy sheets.",
        plans: [
            {
                name: "Consult",
                price: "₹15,000",
                features: ["Brand Audit", "Instagram Audit", "Content Strategy", "Growth Roadmap", "90-Minute Consultation", "Action Plan"]
            }
        ]
    }
};

// Web Audio API Synthesizer Class
class AudioSynth {
    constructor() {
        this.ctx = null;
        this.masterVolume = null;
        this.backgroundHum = null;
        this.isMuted = true;
    }

    init() {
        if (this.ctx) return;
        
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            
            this.masterVolume = this.ctx.createGain();
            this.masterVolume.gain.value = 0.15; // Set low volume for ambient hum
            this.masterVolume.connect(this.ctx.destination);
            
            this.isMuted = false;
            this.startAmbientHum();
        } catch (e) {
            console.warn("Web Audio API not supported on this browser", e);
        }
    }

    toggle() {
        if (!this.ctx) {
            this.init();
            return !this.isMuted;
        }

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.isMuted = !this.isMuted;
        
        gsap.to(this.masterVolume.gain, {
            value: this.isMuted ? 0 : 0.15,
            duration: 0.5
        });

        return !this.isMuted;
    }

    startAmbientHum() {
        if (this.isMuted || !this.ctx) return;
        
        // Lush multi-voice space pad (A minor/major 9th cluster)
        // Treble-rich, low bass elements kept extremely soft.
        const frequencies = [110, 220, 329.63, 440, 659.25];
        this.backgroundHum = {
            oscillators: [],
            gains: [],
            lfos: [],
            filter: null
        };

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, this.ctx.currentTime); // Open filter for treble presence
        filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

        const padGain = this.ctx.createGain();
        padGain.gain.value = 0.45; // Master pad volume
        filter.connect(padGain);
        padGain.connect(this.masterVolume);

        frequencies.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const oscGain = this.ctx.createGain();
            
            // Alternating waveforms for warm texture
            osc.type = (idx % 2 === 0) ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            
            // High frequencies are emphasized, root 110Hz is very soft
            const baseVol = (idx === 0) ? 0.05 : (0.12 - (idx * 0.015)); 
            oscGain.gain.setValueAtTime(baseVol, this.ctx.currentTime);

            osc.connect(oscGain);
            oscGain.connect(filter);
            osc.start();

            // LFO to modulate voices independently
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(0.04 + (idx * 0.015), this.ctx.currentTime);
            lfoGain.gain.value = baseVol * 0.35;
            
            lfo.connect(lfoGain);
            lfoGain.connect(oscGain.gain);
            lfo.start();

            this.backgroundHum.oscillators.push(osc);
            this.backgroundHum.gains.push(oscGain);
            this.backgroundHum.lfos.push(lfo);
        });

        // Slow filter sweep LFO
        const filterLfo = this.ctx.createOscillator();
        const filterLfoGain = this.ctx.createGain();
        
        filterLfo.type = 'sine';
        filterLfo.frequency.setValueAtTime(0.03, this.ctx.currentTime);
        filterLfoGain.gain.value = 400; // sweeps between 1000Hz and 1800Hz
        
        filterLfo.connect(filterLfoGain);
        filterLfoGain.connect(filter.frequency);
        filterLfo.start();

        this.backgroundHum.filter = filter;
        this.backgroundHum.filterLfo = filterLfo;
    }

    // Modulate hum based on scroll depth
    modulateHum(depth) {
        if (this.isMuted || !this.ctx || !this.backgroundHum) return;
        
        const ratios = [1, 2, 2.99, 4, 5.98];
        const baseFreq = 110 + (depth * 3);

        this.backgroundHum.oscillators.forEach((osc, idx) => {
            osc.frequency.setTargetAtTime(baseFreq * ratios[idx], this.ctx.currentTime, 0.8);
        });
    }

    playClick() {
        if (this.isMuted || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.08);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
        
        osc.connect(gain);
        gain.connect(this.masterVolume);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.09);
    }

    playHover() {
        if (this.isMuted || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
        
        osc.connect(gain);
        gain.connect(this.masterVolume);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playSweep(freqStart = 100, freqEnd = 600, duration = 0.5) {
        if (this.isMuted || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + duration);
        
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.masterVolume);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration + 0.05);
    }

    playSuccess() {
        if (this.isMuted || !this.ctx) return;
        
        const now = this.ctx.currentTime;
        const playTone = (freq, delay, dur) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + delay);
            
            gain.gain.setValueAtTime(0, now + delay);
            gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
            
            osc.connect(gain);
            gain.connect(this.masterVolume);
            
            osc.start(now + delay);
            osc.stop(now + delay + dur + 0.05);
        };

        // Synthesize an ascending major arpeggio
        playTone(261.63, 0, 0.2);     // C4
        playTone(329.63, 0.1, 0.2);   // E4
        playTone(392.00, 0.2, 0.2);   // G4
        playTone(523.25, 0.3, 0.4);   // C5
    }
}

// Global Synthesizer Instance
const synth = new AudioSynth();

// Application State Variables
let currentSection = 'hero';
let activeSectionIndex = 0;
let isAnimatingCamera = false;
let scrollProgress = 0; // 0 to 6
let mouse = new THREE.Vector2();
let targetMouse = new THREE.Vector2();
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

// Selected project config tracker (LET'S BUILD)
const userSelectedConfig = new Set();
const receiptItems = [];

// Three.js Components
let scene, camera, renderer, dustParticles, monolithGroup;
let monolithLayers = [];
let backgroundObjects = [];
let reactorCore = null;
let reactorNodes = [];
let raycaster = new THREE.Raycaster();
let hoveredLayer = null;

// Definition of 3D coordinates for sections (Camera position & lookAt target)
const SECTION_COORDINATES = [
    // Section 0: Hero
    { camPos: { x: 0, y: 3, z: 12 }, target: { x: 0, y: 0, z: 0 } },
    // Section 1: Social Media
    { camPos: { x: 5, y: 4.8, z: 6.5 }, target: { x: 0, y: 4.8, z: 0 } },
    // Section 2: Content Production
    { camPos: { x: -5, y: 2.2, z: 6.5 }, target: { x: 0, y: 2.2, z: 0 } },
    // Section 3: Branding
    { camPos: { x: 5, y: -0.4, z: 6.5 }, target: { x: 0, y: -0.4, z: 0 } },
    // Section 4: Web Design
    { camPos: { x: -5, y: -3, z: 6.5 }, target: { x: 0, y: -3, z: 0 } },
    // Section 5: Consulting
    { camPos: { x: 5, y: -5.6, z: 6.5 }, target: { x: 0, y: -5.6, z: 0 } },
    // Section 6: Let's Build
    { camPos: { x: 0, y: -18, z: 12 }, target: { x: 0, y: -18, z: 0 } }
];

// Helper to create texture with text drawn inside a canvas (avoiding external font downloads)
function createLabelTexture(text, subtitle = "") {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Clean drawing space
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Large main title
    ctx.font = '800 68px Syne, sans-serif';
    ctx.fillStyle = '#F4F4F0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '-1px';
    ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2 - 20);

    // Subtitle
    if (subtitle) {
        ctx.font = '600 24px Inter, sans-serif';
        ctx.fillStyle = '#8E8E8A';
        ctx.fillText(subtitle.toUpperCase(), canvas.width / 2, canvas.height / 2 + 50);
    }

    return new THREE.CanvasTexture(canvas);
}

// Clean brutalist helper matching GREE's solid flat aesthetic
function getGlassMaterial(color = 0x222222, opacity = 1.0) {
    return new THREE.MeshBasicMaterial({
        color: 0x222222,
        transparent: true,
        opacity: 0.95
    });
}

// Initializer: Loader Simulator
function handleLoading() {
    const bar = document.getElementById('loader-bar');
    const status = document.getElementById('loader-status');
    const overlay = document.getElementById('loader-overlay');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 8) + 4;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Fade out loader
            gsap.to(overlay, {
                opacity: 0,
                duration: 0.8,
                onComplete: () => {
                    overlay.style.display = 'none';
                    // Trigger entry audio sweep
                    synth.playSweep(100, 440, 1.2);
                }
            });
        }
        bar.style.width = `${progress}%`;
        status.innerHTML = `INITIALIZING SYSTEM: ${progress}%`;
    }, 80);
}

// Core function: Initialize ThreeJS scene
function initThree() {
    const canvas = document.getElementById('webgl-canvas');
    
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x222222, 0.015);

    // Camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.copy(SECTION_COORDINATES[0].camPos);
    camera.lookAt(SECTION_COORDINATES[0].target);

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x222222, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(10, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight2.position.set(-10, -20, -15);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 30);
    pointLight.position.set(0, 0, 8);
    scene.add(pointLight);

    // 1. Dust Particles (Background Starfield)
    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = 600;
    const dustPos = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount * 3; i += 3) {
        dustPos[i] = (Math.random() - 0.5) * 50;
        dustPos[i+1] = (Math.random() - 0.5) * 100 - 15; // spread vertically along path
        dustPos[i+2] = (Math.random() - 0.5) * 50;
    }

    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    
    // Create subtle glow points
    const dustMaterial = new THREE.PointsMaterial({
        size: 0.15,
        color: 0xF4F4F0,
        transparent: true,
        opacity: 0.4,
        sizeAttenuation: true
    });
    
    dustParticles = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustParticles);

    // 2. Floating Brutalist Geometries in the background
    const bgGroup = new THREE.Group();
    scene.add(bgGroup);

    const shapes = [
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.OctahedronGeometry(0.8),
        new THREE.TetrahedronGeometry(0.8)
    ];

    for (let i = 0; i < 20; i++) {
        const geom = shapes[Math.floor(Math.random() * shapes.length)];
        const mat = new THREE.MeshBasicMaterial({
            color: 0xF4F4F0,
            wireframe: true,
            transparent: true,
            opacity: 0.05
        });
        const mesh = new THREE.Mesh(geom, mat);
        
        mesh.position.set(
            (Math.random() - 0.5) * 35,
            (Math.random() - 0.5) * 80 - 10,
            (Math.random() - 0.5) * 30 - 15
        );
        
        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            0
        );

        const scale = Math.random() * 1.5 + 0.5;
        mesh.scale.set(scale, scale, scale);
        
        bgGroup.add(mesh);
        backgroundObjects.push({
            mesh: mesh,
            rotSpeed: {
                x: (Math.random() - 0.5) * 0.005,
                y: (Math.random() - 0.5) * 0.005
            }
        });
    }

    // 3. Stacked GREE Monolith (Brutalist center obelisk representing Services)
    const layerNames = [
        { title: "Social Media", label: "01 // SOCIAL MEDIA", id: "social", y: 4.8 },
        { title: "Content Prod", label: "02 // CONTENT PRODUCTION", id: "content", y: 2.2 },
        { title: "Branding", label: "03 // BRANDING", id: "branding", y: -0.4 },
        { title: "Web Design", label: "04 // WEB DESIGN", id: "website", y: -3.0 },
        { title: "Consulting", label: "05 // CONSULTING", id: "consulting", y: -5.6 }
    ];

    monolithGroup = new THREE.Group();
    monolithGroup.position.y = -20; // Start submerged to keep landing page clean
    scene.add(monolithGroup);

    layerNames.forEach((layer, idx) => {
        const itemGroup = new THREE.Group();
        itemGroup.position.y = layer.y;
        
        // Inner glowing core block
        const coreGeom = new THREE.BoxGeometry(4.5, 1.8, 1.2);
        const coreMat = getGlassMaterial(0xF4F4F0, 0.15);
        const coreMesh = new THREE.Mesh(coreGeom, coreMat);
        coreMesh.userData = { isLayer: true, index: idx + 1, sectionId: layer.id };
        itemGroup.add(coreMesh);

        // Solid wireframe shell
        const edgeGeom = new THREE.EdgesGeometry(coreGeom);
        const edgeMat = new THREE.LineBasicMaterial({ color: 0xF4F4F0, transparent: true, opacity: 0.4 });
        const wireframe = new THREE.LineSegments(edgeGeom, edgeMat);
        itemGroup.add(wireframe);

        // Front Face text overlay canvas texture
        const labelGeom = new THREE.PlaneGeometry(4.4, 1.7);
        const labelTexture = createLabelTexture(layer.title, layer.label);
        const labelMat = new THREE.MeshBasicMaterial({
            map: labelTexture,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        const labelMesh = new THREE.Mesh(labelGeom, labelMat);
        labelMesh.position.z = 0.61; // project slightly ahead of face
        itemGroup.add(labelMesh);

        // Back label
        const labelMeshBack = labelMesh.clone();
        labelMeshBack.position.z = -0.61;
        labelMeshBack.rotation.y = Math.PI;
        itemGroup.add(labelMeshBack);

        monolithGroup.add(itemGroup);
        monolithLayers.push({
            group: itemGroup,
            coreMesh: coreMesh,
            wireframe: wireframe,
            baseZ: 0,
            id: layer.id,
            index: idx + 1
        });
    });

    // 4. "LET'S BUILD" Custom Configurator Reactor Core (Submerged in deep space)
    const reactorGroup = new THREE.Group();
    reactorGroup.position.y = -18;
    scene.add(reactorGroup);

    // Glowing core sphere
    const coreSphGeom = new THREE.SphereGeometry(1.5, 32, 32);
    const coreSphMat = getGlassMaterial(0xF4F4F0, 0.3);
    const coreSph = new THREE.Mesh(coreSphGeom, coreSphMat);
    reactorGroup.add(coreSph);

    // Reactor shell
    const shellGeom = new THREE.IcosahedronGeometry(2.5, 1);
    const shellMat = new THREE.MeshBasicMaterial({
        color: 0xF4F4F0,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const shellMesh = new THREE.Mesh(shellGeom, shellMat);
    reactorGroup.add(shellMesh);
    
    reactorCore = {
        group: reactorGroup,
        coreSph: coreSph,
        shell: shellMesh
    };

    // Instantiate satellite nodes representing packages & add-ons
    // Map items to nodes
    const nodeItems = [
        { id: "social-start", label: "SM: Start", price: 25000, category: "Social" },
        { id: "social-growth", label: "SM: Growth", price: 35000, category: "Social" },
        { id: "social-elite", label: "SM: Elite", price: 50000, category: "Social" },
        { id: "content-basic", label: "CP: Basic", price: 20000, category: "Content" },
        { id: "content-pro", label: "CP: Pro", price: 40000, category: "Content" },
        { id: "content-sig", label: "CP: Signature", price: 60000, category: "Content" },
        { id: "brand-foundation", label: "BD: Foundation", price: 20000, category: "Branding" },
        { id: "brand-identity", label: "BD: Identity", price: 40000, category: "Branding" },
        { id: "brand-exp", label: "BD: Experience", price: 60000, category: "Branding" },
        { id: "web-launch", label: "WD: Launch", price: 20000, category: "Web" },
        { id: "web-business", label: "WD: Business", price: 40000, category: "Web" },
        { id: "web-commerce", label: "WD: Commerce", price: 60000, category: "Web" },
        { id: "consulting", label: "Consulting", price: 15000, category: "Consulting" },
        { id: "ugc", label: "+UGC", price: 5000, category: "Addon" },
        { id: "influencer", label: "+Influencer", price: 10000, category: "Addon" },
        { id: "extra-reels", label: "+Reels", price: 8000, category: "Addon" },
        { id: "motion-graphics", label: "+Motion", price: 7000, category: "Addon" },
        { id: "drone-coverage", label: "+Drone", price: 12000, category: "Addon" },
        { id: "packaging-design", label: "+Packaging", price: 15000, category: "Addon" }
    ];

    nodeItems.forEach((node, idx) => {
        const theta = (idx / nodeItems.length) * Math.PI * 2;
        const radius = 6.5; // Orbit radius
        
        const nodeGeom = new THREE.SphereGeometry(0.35, 16, 16);
        const nodeMat = new THREE.MeshBasicMaterial({
            color: 0x8E8E8A,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        const mesh = new THREE.Mesh(nodeGeom, nodeMat);
        
        // Arrange in 3D orbit around reactor core
        mesh.position.set(
            Math.cos(theta) * radius,
            -18 + (Math.random() - 0.5) * 2, // minor variance in height
            Math.sin(theta) * radius
        );
        
        mesh.userData = {
            isNode: true,
            id: node.id,
            label: node.label,
            price: node.price,
            category: node.category,
            theta: theta,
            radius: radius,
            selected: false,
            baseColor: 0x8E8E8A
        };
        
        scene.add(mesh);
        reactorNodes.push(mesh);
    });

    // Handle Window Resizing
    window.addEventListener('resize', onWindowResize, false);
}

// Raycaster check for mouse hovers and clicks
function handleRaycaster() {
    raycaster.setFromCamera(mouse, camera);

    // List of objects to inspect
    const intersectables = [];
    monolithLayers.forEach(l => intersectables.push(l.coreMesh));
    reactorNodes.forEach(n => intersectables.push(n));

    const intersects = raycaster.intersectObjects(intersectables);

    if (intersects.length > 0) {
        const hit = intersects[0].object;
        document.body.classList.add('hover-active');

        // 1. Monolith Layer hover logic
        if (hit.userData.isLayer) {
            if (hoveredLayer !== hit) {
                if (hoveredLayer) resetLayerState(hoveredLayer);
                
                hoveredLayer = hit;
                synth.playHover();
                
                // Tilt & slide mesh slightly forward
                const targetLayer = monolithLayers.find(l => l.coreMesh === hit);
                if (targetLayer) {
                    gsap.to(targetLayer.group.position, {
                        z: 0.6,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                    gsap.to(targetLayer.wireframe.material, {
                        opacity: 0.9,
                        duration: 0.3
                    });
                }
            }
        }
        
        // 2. Reactor Node hover logic
        if (hit.userData.isNode) {
            if (hoveredLayer !== hit) {
                if (hoveredLayer && hoveredLayer.userData.isLayer) resetLayerState(hoveredLayer);
                hoveredLayer = hit;
                synth.playHover();
                
                // Make node scale up
                gsap.to(hit.scale, { x: 1.6, y: 1.6, z: 1.6, duration: 0.2 });
            }
        }
    } else {
        document.body.classList.remove('hover-active');
        if (hoveredLayer) {
            if (hoveredLayer.userData.isLayer) {
                resetLayerState(hoveredLayer);
            } else if (hoveredLayer.userData.isNode) {
                // Shrink node back
                gsap.to(hoveredLayer.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
            }
            hoveredLayer = null;
        }
    }
}

function resetLayerState(mesh) {
    const targetLayer = monolithLayers.find(l => l.coreMesh === mesh);
    if (targetLayer) {
        gsap.to(targetLayer.group.position, {
            z: 0,
            duration: 0.4,
            ease: 'power2.out'
        });
        gsap.to(targetLayer.wireframe.material, {
            opacity: 0.25,
            duration: 0.4
        });
    }
}

// Raycaster Clicking
function handle3DClick() {
    raycaster.setFromCamera(mouse, camera);
    const intersectables = [];
    monolithLayers.forEach(l => intersectables.push(l.coreMesh));
    reactorNodes.forEach(n => intersectables.push(n));

    const intersects = raycaster.intersectObjects(intersectables);

    if (intersects.length > 0) {
        const hit = intersects[0].object;
        
        if (hit.userData.isLayer) {
            synth.playClick();
            navigateToSection(hit.userData.index);
        }
        
        if (hit.userData.isNode) {
            synth.playClick();
            toggleConfiguratorService(hit.userData.id);
        }
    }
}

// Camera flight path navigation using GSAP
function navigateToSection(index) {
    if (isAnimatingCamera) return;
    
    isAnimatingCamera = true;
    activeSectionIndex = index;
    
    // De-activate all dot styles
    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach(d => d.classList.remove('active'));
    dots[index].classList.add('active');

    // Section text overlay display trigger
    const sections = ['hero', 'social', 'content', 'branding', 'website', 'consulting', 'builder'];
    currentSection = sections[index];

    // Close detail frame if open
    closeDetailFrame();

    // Modulate hum frequency based on depth index
    synth.modulateHum(index);

    // Update Depth HUD coordinates display
    const depthMeterMax = 350; // visual height in css
    const depthSpacing = depthMeterMax / 6;
    gsap.to('#meter-handle', { top: `${index * depthSpacing}px`, duration: 0.8, ease: 'power2.out' });
    
    // Animate numerical readouts
    const latVal = document.getElementById('lat-val');
    const lngVal = document.getElementById('lng-val');
    const depVal = document.getElementById('dep-val');
    
    gsap.to(latVal, {
        innerText: (45.392 + (index * 4.21)).toFixed(4),
        duration: 0.8,
        snap: { innerText: 0.0001 }
    });
    
    gsap.to(lngVal, {
        innerText: (12.839 - (index * 3.82)).toFixed(4),
        duration: 0.8,
        snap: { innerText: 0.0001 }
    });
    
    gsap.to(depVal, {
        innerText: (index * 11.25).toFixed(2) + "m",
        duration: 0.8,
        snap: { innerText: 0.01 }
    });

    // Hide instructions or display active instructions
    const rightPanel = document.getElementById('hud-right-panel');
    if (index === 0) {
        document.getElementById('sec-hero').classList.add('active');
        rightPanel.style.display = 'block';
    } else {
        document.getElementById('sec-hero').classList.remove('active');
        rightPanel.style.display = 'none';
    }

    // Slide monolith out of view when on Hero or Builder sections
    if (monolithGroup) {
        if (index === 0) {
            // Hero section: slide monolith down to avoid overlapping the header/tagline
            gsap.to(monolithGroup.position, { y: -20, duration: 1.2, ease: 'power2.inOut' });
        } else if (index === 6) {
            // Builder section: slide monolith up and out of view
            gsap.to(monolithGroup.position, { y: 20, duration: 1.2, ease: 'power2.inOut' });
        } else {
            // Service sections: center the monolith
            gsap.to(monolithGroup.position, { y: 0, duration: 1.2, ease: 'power2.inOut' });
        }
    }

    // Toggle entire LET'S BUILD overlay panel
    const builderOverlay = document.getElementById('builder-dashboard');
    if (index === 6) {
        builderOverlay.style.display = 'block';
        gsap.to(builderOverlay, { opacity: 1, duration: 0.8 });
    } else {
        gsap.to(builderOverlay, {
            opacity: 0,
            duration: 0.4,
            onComplete: () => { builderOverlay.style.display = 'none'; }
        });
    }

    // Camera animation curves
    const targetCoords = SECTION_COORDINATES[index];
    
    // Play sweep tone for camera sweep speed
    synth.playSweep(250, 480, 0.9);

    gsap.to(camera.position, {
        x: targetCoords.camPos.x,
        y: targetCoords.camPos.y,
        z: targetCoords.camPos.z,
        duration: 1.4,
        ease: 'power3.inOut',
        onUpdate: () => {
            camera.lookAt(
                gsap.utils.interpolate(camera.position.x, targetCoords.target.x, 0.7),
                gsap.utils.interpolate(camera.position.y, targetCoords.target.y, 0.7),
                gsap.utils.interpolate(camera.position.z, targetCoords.target.z, 0.7)
            );
        },
        onComplete: () => {
            camera.lookAt(targetCoords.target.x, targetCoords.target.y, targetCoords.target.z);
            isAnimatingCamera = false;
            
            // Auto open the detailed package specification sheets
            if (index >= 1 && index <= 5) {
                const serviceKeys = ['social', 'content', 'branding', 'website', 'consulting'];
                openDetailFrame(serviceKeys[index - 1]);
            }
        }
    });
}

// Window size adjustments
function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Global Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Lazy camera mouse lag parallax (only active if not transitioning camera)
    if (!isAnimatingCamera) {
        targetMouse.x += (mouse.x - targetMouse.x) * 0.05;
        targetMouse.y += (mouse.y - targetMouse.y) * 0.05;

        // Subtle pan shift
        const activeTarget = SECTION_COORDINATES[activeSectionIndex];
        camera.position.x = activeTarget.camPos.x + targetMouse.x * 0.5;
        camera.position.y = activeTarget.camPos.y + targetMouse.y * 0.5;
        camera.lookAt(activeTarget.target.x, activeTarget.target.y, activeTarget.target.z);
    }

    // Gentle rotation of floating background dust particles
    if (dustParticles) {
        dustParticles.rotation.y += 0.0003;
        dustParticles.rotation.x += 0.0001;
    }

    // Update and rotate background shapes
    backgroundObjects.forEach(obj => {
        obj.mesh.rotation.x += obj.rotSpeed.x;
        obj.mesh.rotation.y += obj.rotSpeed.y;
    });

    // Gentle spin of service blocks
    monolithLayers.forEach(layer => {
        // Only spin if not currently focused to make it readable when viewed
        if (currentSection === 'hero') {
            layer.group.rotation.y += 0.003;
        } else {
            // align face cleanly to face target angle
            gsap.to(layer.group.rotation, { y: 0, duration: 0.5 });
        }
    });

    // Configurator Reactor Core spin & pulses
    if (reactorCore) {
        reactorCore.shell.rotation.y -= 0.002;
        reactorCore.shell.rotation.x += 0.001;
        
        // Core glow pulse wave
        const pulse = 1 + Math.sin(Date.now() * 0.0025) * 0.08;
        reactorCore.coreSph.scale.set(pulse, pulse, pulse);
    }

    // Configurator satellites orbit rotation
    reactorNodes.forEach((node) => {
        if (!node.userData.selected) {
            // Speed up or slow orbit
            node.userData.theta += 0.003;
            const targetX = Math.cos(node.userData.theta) * node.userData.radius;
            const targetZ = Math.sin(node.userData.theta) * node.userData.radius;
            
            node.position.x += (targetX - node.position.x) * 0.1;
            node.position.z += (targetZ - node.position.z) * 0.1;
        }
    });

    handleRaycaster();
    renderer.render(scene, camera);
}

// Glass detail sheet renderer
function openDetailFrame(serviceKey) {
    const frame = document.getElementById('glass-detail-frame');
    const content = document.getElementById('detail-frame-content');
    const data = BRAND_DATA[serviceKey];
    
    if (!data) return;

    let plansHtml = "";
    data.plans.forEach(plan => {
        let featuresList = "";
        plan.features.forEach(f => {
            featuresList += `<li>${f}</li>`;
        });
        
        plansHtml += `
            <div class="plan-card">
                <div class="plan-card-header">
                    <span class="plan-title">${plan.name}</span>
                    <span class="plan-price">${plan.price}</span>
                </div>
                <ul class="plan-features">
                    ${featuresList}
                </ul>
            </div>
        `;
    });

    content.innerHTML = `
        <div class="detail-header-category">${serviceKey} package matrix</div>
        <h2 class="detail-header-title">${data.title}</h2>
        <p class="detail-section-desc">${data.desc}</p>
        <div class="plan-grid">
            ${plansHtml}
        </div>
    `;

    // Visual Slide In
    frame.style.display = 'flex';
    gsap.fromTo(frame, 
        { opacity: 0, x: 100 }, 
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
    );
}

function closeDetailFrame() {
    const frame = document.getElementById('glass-detail-frame');
    if (frame.style.display === 'flex') {
        gsap.to(frame, {
            opacity: 0,
            x: 100,
            duration: 0.4,
            ease: 'power2.in',
            onComplete: () => { frame.style.display = 'none'; }
        });
    }
}

// "LET'S BUILD" Custom Configurator calculations and triggers
function toggleConfiguratorService(serviceId) {
    const toggleBtn = document.querySelector(`.toggle-item-btn[data-id="${serviceId}"]`);
    const nodeMesh = reactorNodes.find(n => n.userData.id === serviceId);

    if (userSelectedConfig.has(serviceId)) {
        // DESELECTING
        userSelectedConfig.delete(serviceId);
        if (toggleBtn) toggleBtn.classList.remove('selected');
        
        if (nodeMesh) {
            nodeMesh.userData.selected = false;
            // Float node back to outer orbit scale
            gsap.to(nodeMesh.position, {
                y: -18 + (Math.random() - 0.5) * 2,
                duration: 0.8,
                ease: 'power2.out'
            });
            nodeMesh.material.color.setHex(0x8E8E8A);
            nodeMesh.material.wireframe = true;
        }
    } else {
        // SELECTING
        // If this is a category choice (Social/Content/Branding/Web), enforce exclusive select per category
        const category = toggleBtn ? toggleBtn.getAttribute('data-category') : (nodeMesh ? nodeMesh.userData.category : null);
        if (category && category !== 'Addon') {
            // Find and deselect previous selects of this exact category
            userSelectedConfig.forEach(selectedId => {
                const queryBtn = document.querySelector(`.toggle-item-btn[data-id="${selectedId}"]`);
                if (queryBtn && queryBtn.getAttribute('data-category') === category) {
                    userSelectedConfig.delete(selectedId);
                    queryBtn.classList.remove('selected');
                    
                    const prevMesh = reactorNodes.find(n => n.userData.id === selectedId);
                    if (prevMesh) {
                        prevMesh.userData.selected = false;
                        gsap.to(prevMesh.position, { y: -18 + (Math.random() - 0.5) * 2, duration: 0.8 });
                        prevMesh.material.color.setHex(0x8E8E8A);
                        prevMesh.material.wireframe = true;
                    }
                }
            });
        }

        userSelectedConfig.add(serviceId);
        if (toggleBtn) toggleBtn.classList.add('selected');

        if (nodeMesh) {
            nodeMesh.userData.selected = true;
            // SUCK INTO the center glowing reactor core
            gsap.to(nodeMesh.position, {
                x: 0,
                y: -18,
                z: 0,
                duration: 0.8,
                ease: 'back.in(1.2)'
            });
            nodeMesh.material.color.setHex(0xF4F4F0);
            nodeMesh.material.wireframe = false; // turn solid
            
            // Core spark explosion pulse
            gsap.to(reactorCore.coreSph.scale, {
                x: 2.2, y: 2.2, z: 2.2,
                duration: 0.15,
                yoyo: true,
                repeat: 1,
                ease: 'power2.out'
            });
        }
    }

    rebuildInvoiceLedger();
}

function rebuildInvoiceLedger() {
    const list = document.getElementById('invoice-items-list');
    list.innerHTML = "";

    let monthlyTotal = 0;
    let oneTimeTotal = 0;
    receiptItems.length = 0;

    userSelectedConfig.forEach(serviceId => {
        // Find price details from HTML toggles
        const btn = document.querySelector(`.toggle-item-btn[data-id="${serviceId}"]`);
        if (!btn) return;

        const name = btn.querySelector('.btn-name').textContent;
        const rawPrice = parseInt(btn.getAttribute('data-price'));
        const category = btn.getAttribute('data-category');

        const isMonthly = (category === 'Social');
        if (isMonthly) {
            monthlyTotal += rawPrice;
        } else {
            oneTimeTotal += rawPrice;
        }

        receiptItems.push({ name, price: rawPrice, recur: isMonthly });

        const li = document.createElement('li');
        li.innerHTML = `
            <span class="item-name">${name}</span>
            <span class="item-price">₹${rawPrice.toLocaleString('en-IN')}${isMonthly ? '/mo' : ''}</span>
        `;
        list.appendChild(li);
    });

    if (userSelectedConfig.size === 0) {
        list.innerHTML = `<li class="empty-invoice-msg">No services selected. Add services to begin calculation.</li>`;
    }

    // Animating total labels
    gsap.to('#monthly-total-val', {
        innerText: monthlyTotal,
        duration: 0.4,
        snap: { innerText: 1 },
        onUpdate: function() {
            document.getElementById('monthly-total-val').textContent = "₹" + Math.floor(this.targets()[0].innerText).toLocaleString('en-IN');
        }
    });

    gsap.to('#onetime-total-val', {
        innerText: oneTimeTotal,
        duration: 0.4,
        snap: { innerText: 1 },
        onUpdate: function() {
            document.getElementById('onetime-total-val').textContent = "₹" + Math.floor(this.targets()[0].innerText).toLocaleString('en-IN');
        }
    });
}

// Assemble stylized text invoice layout
function showSuccessReceipt() {
    const overlay = document.getElementById('success-overlay');
    const container = document.getElementById('receipt-docket');
    
    synth.playSuccess();
    
    let itemsStr = "";
    let monthlyTotal = 0;
    let oneTimeTotal = 0;

    receiptItems.forEach(item => {
        itemsStr += `\n- ${item.name.padEnd(28)}: INR ${item.price.toLocaleString('en-IN').padStart(8)}${item.recur ? '/mo' : ''}`;
        if (item.recur) monthlyTotal += item.price;
        else oneTimeTotal += item.price;
    });

    const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const docketNum = Math.floor(100000 + Math.random() * 900000);

    const invoiceText = `
==============================================
            GREE DIGITAL DOCKET
==============================================
DOCKET NO : #GR-${docketNum}
TIMESTAMP : ${timestamp}
STATUS    : CONFIGURATION INITIALIZED
----------------------------------------------
SELECTED PACKAGES:
${itemsStr || "\n- No services selected"}
----------------------------------------------
MONTHLY RETAINER  : INR ${monthlyTotal.toLocaleString('en-IN')}
PROJECT FEE       : INR ${oneTimeTotal.toLocaleString('en-IN')}
==============================================
   READY TO BUILD - CO. APPROVED v2.026.1
==============================================
    `;

    container.textContent = invoiceText;
    overlay.style.display = 'flex';
}

// Event Bindings
function bindEvents() {
    // Sound trigger
    document.getElementById('sound-btn').addEventListener('click', (e) => {
        const active = synth.toggle();
        const btn = e.currentTarget;
        const label = btn.querySelector('.sound-label');
        
        if (active) {
            btn.classList.add('sound-active');
            label.textContent = "SOUND: ON";
        } else {
            btn.classList.remove('sound-active');
            label.textContent = "SOUND: OFF";
        }
    });

    // Custom cursor movement
    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        gsap.to('#custom-cursor', { x: e.clientX, y: e.clientY, duration: 0.15 });
        gsap.to('#custom-cursor-dot', { x: e.clientX, y: e.clientY, duration: 0.01 });
    });

    // Interactive button hover highlights
    document.querySelectorAll('button, a, .nav-dot, .meter-mark, .scroll-prompt-container').forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('hover-active');
            synth.playHover();
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('hover-active');
        });
    });

    // Scrolling / Wheeled coordinates binder (camera sweep driver)
    window.addEventListener('wheel', (e) => {
        // Block actions if a window transition is happening
        if (isAnimatingCamera || document.getElementById('builder-dashboard').style.opacity > 0.9) return;
        
        // Delta threshold to avoid rapid jumps
        if (Math.abs(e.deltaY) < 15) return;

        let nextIdx = activeSectionIndex;
        if (e.deltaY > 0) {
            nextIdx = Math.min(6, activeSectionIndex + 1);
        } else {
            nextIdx = Math.max(0, activeSectionIndex - 1);
        }

        if (nextIdx !== activeSectionIndex) {
            navigateToSection(nextIdx);
        }
    });

    // Touch support for scrolling mobile devices
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });
    window.addEventListener('touchmove', (e) => {
        if (isAnimatingCamera || document.getElementById('builder-dashboard').style.opacity > 0.9) return;
        
        const deltaY = touchStartY - e.touches[0].clientY;
        if (Math.abs(deltaY) < 50) return;
        
        let nextIdx = activeSectionIndex;
        if (deltaY > 0) {
            nextIdx = Math.min(6, activeSectionIndex + 1);
        } else {
            nextIdx = Math.max(0, activeSectionIndex - 1);
        }

        if (nextIdx !== activeSectionIndex) {
            navigateToSection(nextIdx);
            touchStartY = e.touches[0].clientY; // reset anchors
        }
    });

    // Click navigation dots
    document.querySelectorAll('.nav-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            navigateToSection(index);
        });
    });

    // Click depth lines markers
    document.querySelectorAll('.meter-mark').forEach(mark => {
        mark.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            navigateToSection(index);
        });
    });

    // Detail closes
    document.getElementById('detail-close-btn').addEventListener('click', () => {
        closeDetailFrame();
    });

    // 3D scene clicks
    window.addEventListener('click', () => {
        handle3DClick();
    });

    // Custom build triggers
    document.getElementById('top-build-btn').addEventListener('click', () => {
        navigateToSection(6);
    });

    document.getElementById('hero-scroll-btn').addEventListener('click', () => {
        navigateToSection(1);
    });

    // Accordion selections logic (LET'S BUILD)
    document.querySelectorAll('.toggle-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            toggleConfiguratorService(id);
        });
    });

    // Reset button
    document.getElementById('hud-logo-btn').addEventListener('click', () => {
        navigateToSection(0);
    });

    // Trigger Finalize invoice modal
    document.getElementById('build-submit-btn').addEventListener('click', () => {
        showSuccessReceipt();
    });

    // Success Close
    document.getElementById('success-done-btn').addEventListener('click', () => {
        document.getElementById('success-overlay').style.display = 'none';
        navigateToSection(0);
        
        // Reset configurator states
        userSelectedConfig.clear();
        document.querySelectorAll('.toggle-item-btn').forEach(btn => btn.classList.remove('selected'));
        reactorNodes.forEach(node => {
            node.userData.selected = false;
            gsap.to(node.position, { y: -18 + (Math.random() - 0.5) * 2, duration: 0.8 });
            node.material.color.setHex(0x8E8E8A);
            node.material.wireframe = true;
        });
        rebuildInvoiceLedger();
    });
}

// Startup execution sequence
window.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    handleLoading();
    initThree();
    bindEvents();
    animate();
});
