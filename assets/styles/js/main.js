"use strict";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.matchMedia("(max-width: 780px)").matches;
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function initNavigation() {
  const toggle = $("#nav-toggle");
  const menu = $("#nav-menu");
  const header = $("#site-header");
  const links = $$(".nav-link");

  toggle?.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("show");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      menu?.classList.remove("show");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });

  const updateHeader = () => {
    header?.classList.toggle("is-compact", window.scrollY > 40);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const sections = $$("section[id]");
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        links.forEach((link) => link.classList.remove("active"));
        $(`.nav-link[href="#${entry.target.id}"]`)?.classList.add("active");
      });
    },
    { rootMargin: "-42% 0px -48% 0px", threshold: 0 }
  );

  sections.forEach((section) => activeObserver.observe(section));
}

function initReveal() {
  const revealItems = $$(".reveal");

  if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function initCursorAndParallax() {
  const glow = $(".cursor-glow");
  const parallaxItems = $$("[data-depth]");

  if (prefersReducedMotion) {
    glow?.remove();
    return;
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      const x = event.clientX;
      const y = event.clientY;
      glow?.style.setProperty("transform", `translate3d(${x - 176}px, ${y - 176}px, 0)`);

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const offsetX = (x - centerX) / centerX;
      const offsetY = (y - centerY) / centerY;

      parallaxItems.forEach((item) => {
        const depth = Number(item.dataset.depth || 0.08);
        item.style.transform = `translate3d(${offsetX * depth * 44}px, ${
          offsetY * depth * 44
        }px, 0)`;
      });
    },
    { passive: true }
  );
}

function initMagneticButtons() {
  if (prefersReducedMotion || isMobile) {
    return;
  }

  $$(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate3d(${x * 0.12}px, ${y * 0.18}px, 0)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}

function initStarfield() {
  const canvas = $("#starfield");
  const context = canvas?.getContext("2d");

  if (!canvas || !context) {
    return;
  }

  let width = 0;
  let height = 0;
  let stars = [];
  let animationId = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.4 : 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = isMobile ? 70 : 150;
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.24 + 0.08,
      radius: Math.random() * 1.5 + 0.4,
    }));
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(82, 230, 255, 0.75)";

    stars.forEach((star) => {
      star.y += star.speed * star.z;
      if (star.y > height + 8) {
        star.y = -8;
        star.x = Math.random() * width;
      }

      context.globalAlpha = star.z;
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    });

    context.globalAlpha = 1;

    if (!prefersReducedMotion) {
      animationId = requestAnimationFrame(draw);
    }
  };

  resize();
  draw();
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("beforeunload", () => cancelAnimationFrame(animationId));
}

function initSatelliteSystem() {
  const orbitSystem = $("#orbit-system");

  if (!orbitSystem) {
    return;
  }

  const satellites = [
    { orbit: 310, size: 28, speed: 8, start: 12, tiltX: 72, tiltY: 18, scale: 0.62, alpha: 0.7, type: "probe" },
    { orbit: 330, size: 34, speed: 10, start: 88, tiltX: 68, tiltY: -12, scale: 0.74, alpha: 0.86, type: "panel" },
    { orbit: 350, size: 24, speed: 7, start: 176, tiltX: 78, tiltY: 28, scale: 0.58, alpha: 0.62, type: "probe" },
    { orbit: 382, size: 42, speed: 14, start: 244, tiltX: 64, tiltY: -30, scale: 0.82, alpha: 0.86, type: "panel" },
    { orbit: 405, size: 30, speed: 11, start: 318, tiltX: 76, tiltY: 8, scale: 0.7, alpha: 0.66, type: "ship" },
    { orbit: 438, size: 50, speed: 18, start: 42, tiltX: 58, tiltY: 42, scale: 0.9, alpha: 0.92, type: "panel" },
    { orbit: 462, size: 36, speed: 16, start: 126, tiltX: 82, tiltY: -46, scale: 0.76, alpha: 0.78, type: "ship" },
    { orbit: 488, size: 26, speed: 12, start: 206, tiltX: 15, tiltY: 74, scale: 0.64, alpha: 0.64, type: "probe" },
    { orbit: 516, size: 54, speed: 24, start: 286, tiltX: 54, tiltY: -56, scale: 1, alpha: 0.95, type: "panel" },
    { orbit: 540, size: 32, speed: 15, start: 354, tiltX: 22, tiltY: 82, scale: 0.72, alpha: 0.72, type: "ship" },
    { orbit: 576, size: 62, speed: 31, start: 64, tiltX: 70, tiltY: -6, scale: 1.08, alpha: 0.9, type: "panel" },
    { orbit: 610, size: 38, speed: 22, start: 156, tiltX: 48, tiltY: 66, scale: 0.82, alpha: 0.76, type: "probe" },
    { orbit: 642, size: 72, speed: 38, start: 238, tiltX: 62, tiltY: -72, scale: 1.16, alpha: 0.82, type: "ship" },
    { orbit: 676, size: 44, speed: 27, start: 326, tiltX: 84, tiltY: 22, scale: 0.88, alpha: 0.68, type: "panel" },
  ];

  const visibleSatellites = isMobile ? satellites.slice(0, 8) : satellites;

  visibleSatellites.forEach((config) => {
    const orbit = document.createElement("span");
    const satellite = document.createElement("span");
    orbit.className = "satellite-orbit";
    satellite.className = `satellite satellite--${config.type}`;

    orbit.style.setProperty("--orbit", `${config.orbit}px`);
    orbit.style.setProperty("--speed", `${config.speed}s`);
    orbit.style.setProperty("--start", `${config.start}deg`);
    orbit.style.setProperty("--tilt-x", `${config.tiltX}deg`);
    orbit.style.setProperty("--tilt-y", `${config.tiltY}deg`);
    satellite.style.setProperty("--size", `${config.size}px`);
    satellite.style.setProperty("--scale", String(config.scale));
    satellite.style.setProperty("--alpha", String(config.alpha));

    orbit.appendChild(satellite);
    orbitSystem.appendChild(orbit);
  });
}

function initSamuraiTransitions() {
  const stage = $("#samurai-stage");

  if (!stage || prefersReducedMotion) {
    return;
  }

  const sections = $$(".section-panel");
  let lastStrike = 0;
  let lastSectionId = "home";

  const strike = (section) => {
    const now = Date.now();
    if (now - lastStrike < 1350 || section.id === lastSectionId) {
      return;
    }

    lastStrike = now;
    lastSectionId = section.id;
    section.classList.add("is-samurai-revealed");
    stage.classList.remove("is-striking");
    void stage.offsetWidth;
    stage.classList.add("is-striking");

    window.setTimeout(() => {
      stage.classList.remove("is-striking");
      section.classList.remove("is-samurai-revealed");
    }, 1050);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.44) {
          strike(entry.target);
        }
      });
    },
    { threshold: [0.45], rootMargin: "-18% 0px -18% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

function initSamuraiCutaways() {
  if (prefersReducedMotion || isMobile) {
    return;
  }

  const targets = [
    ...$$(".orbit-panel"),
    ...$$(".stat-chip"),
    ...$$(".timeline-card"),
    ...$$(".project-card"),
  ];

  const selectedTargets = targets.filter((_, index) => index % 2 === 0 || index === 3);

  const addCutLayer = (target) => {
    target.classList.add("samurai-cut-target");

    const layerNames = [
      "cut-plate",
      "cut-shard cut-shard--top",
      "cut-shard cut-shard--bottom",
      "cut-flare",
      "cut-spark",
      "cut-spark",
      "cut-spark",
    ];

    layerNames.forEach((className) => {
      const element = document.createElement("span");
      element.className = className;
      target.appendChild(element);
    });
  };

  selectedTargets.forEach(addCutLayer);

  const triggerCut = (target) => {
    if (target.classList.contains("is-cut-away")) {
      return;
    }

    target.classList.add("is-cut-away");
    window.setTimeout(() => target.classList.remove("is-cut-away"), 980);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.62) {
          return;
        }

        const target = entry.target;
        const delay = Number(target.dataset.cutDelay || 0);
        window.setTimeout(() => triggerCut(target), delay);
        observer.unobserve(target);
      });
    },
    { threshold: [0.62], rootMargin: "-10% 0px -12% 0px" }
  );

  selectedTargets.forEach((target, index) => {
    target.dataset.cutDelay = String(180 + (index % 4) * 210);
    observer.observe(target);
  });

  $$(".orbit-panel").forEach((panel) => {
    panel.addEventListener("pointerenter", () => triggerCut(panel));
  });
}

async function initGlobe() {
  const canvas = $("#globe-canvas");
  const loader = $("#globe-loader");

  if (!canvas) {
    return;
  }

  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isMobile,
      powerPreference: "high-performance",
    });

    const pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.8);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);

    const group = new THREE.Group();
    scene.add(group);

    const globeGeometry = new THREE.SphereGeometry(1.58, isMobile ? 48 : 72, isMobile ? 32 : 48);
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x071827,
      emissive: 0x071b2f,
      emissiveIntensity: 0.62,
      shininess: 22,
      transparent: true,
      opacity: 0.96,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    group.add(globe);

    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(1.595, 32, 20),
      new THREE.MeshBasicMaterial({
        color: 0x52e6ff,
        wireframe: true,
        transparent: true,
        opacity: 0.16,
      })
    );
    group.add(wire);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.72, 48, 32),
      new THREE.MeshBasicMaterial({
        color: 0x52e6ff,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      })
    );
    group.add(atmosphere);

    const nodeCount = isMobile ? 36 : 70;
    const nodes = [];
    const nodePositions = [];

    for (let i = 0; i < nodeCount; i += 1) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const radius = 1.64;
      const position = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );

      nodePositions.push(position);
      nodes.push(position.x, position.y, position.z);
    }

    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(nodes, 3));
    const nodeMaterial = new THREE.PointsMaterial({
      color: 0x9df4ff,
      size: isMobile ? 0.025 : 0.032,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    group.add(new THREE.Points(nodeGeometry, nodeMaterial));

    const connectionVertices = [];
    const lineCount = isMobile ? 18 : 42;
    for (let i = 0; i < lineCount; i += 1) {
      const from = nodePositions[Math.floor(Math.random() * nodePositions.length)];
      const to = nodePositions[Math.floor(Math.random() * nodePositions.length)];
      if (from.distanceTo(to) < 1.15) {
        connectionVertices.push(from.x, from.y, from.z, to.x, to.y, to.z);
      }
    }

    const connectionGeometry = new THREE.BufferGeometry();
    connectionGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(connectionVertices, 3)
    );
    const connectionMaterial = new THREE.LineBasicMaterial({
      color: 0x52e6ff,
      transparent: true,
      opacity: 0.26,
    });
    group.add(new THREE.LineSegments(connectionGeometry, connectionMaterial));

    const particles = new THREE.Group();
    const particleGeometry = new THREE.SphereGeometry(0.012, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0x9d7cff,
      transparent: true,
      opacity: 0.8,
    });

    for (let i = 0; i < (isMobile ? 18 : 34); i += 1) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      const angle = (i / 34) * Math.PI * 2;
      particle.position.set(Math.cos(angle) * 2.05, Math.sin(angle * 1.7) * 0.38, Math.sin(angle) * 2.05);
      particles.add(particle);
    }
    group.add(particles);

    const light = new THREE.PointLight(0x82eeff, 2.4, 9);
    light.position.set(3, 2.5, 4);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x5a7dff, 0.85));

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const targetRotation = { x: -0.18, y: 0.38 };

    canvas.addEventListener("pointerdown", (event) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    });

    canvas.addEventListener("pointermove", (event) => {
      if (!dragging) {
        return;
      }

      targetRotation.y += (event.clientX - lastX) * 0.006;
      targetRotation.x += (event.clientY - lastY) * 0.006;
      lastX = event.clientX;
      lastY = event.clientY;
    });

    canvas.addEventListener("pointerup", () => {
      dragging = false;
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const size = Math.max(280, Math.min(rect.width || 640, 760));
      renderer.setSize(size, size, false);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    };

    let animationId = 0;
    const animate = () => {
      if (!dragging && !prefersReducedMotion) {
        targetRotation.y += 0.0024;
      }

      group.rotation.x += (targetRotation.x - group.rotation.x) * 0.08;
      group.rotation.y += (targetRotation.y - group.rotation.y) * 0.08;
      wire.rotation.y -= 0.0018;
      particles.rotation.y += 0.004;
      particles.rotation.x += 0.001;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    loader?.remove();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("beforeunload", () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
      globeGeometry.dispose();
      globeMaterial.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      connectionGeometry.dispose();
      connectionMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    });
  } catch (error) {
    drawFallbackGlobe(canvas, loader);
  }
}

function drawFallbackGlobe(canvas, loader) {
  const context = canvas.getContext("2d");
  if (!context) {
    if (loader) {
      loader.textContent = "Globe unavailable offline";
    }
    return;
  }

  const state = {
    rotation: 0,
    dragging: false,
    lastX: 0,
    manualVelocity: 0,
  };

  const nodes = Array.from({ length: isMobile ? 34 : 62 }, () => ({
    latitude: Math.random() * Math.PI - Math.PI / 2,
    longitude: Math.random() * Math.PI * 2,
    pulse: Math.random() * Math.PI * 2,
  }));

  const resize = () => {
    const size = Math.max(300, Math.floor(canvas.getBoundingClientRect().width || 640));
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.8);
    canvas.width = Math.floor(size * dpr);
    canvas.height = Math.floor(size * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const project = (latitude, longitude, radius, center, rotation) => {
    const lon = longitude + rotation;
    const x = center + radius * Math.cos(latitude) * Math.sin(lon);
    const y = center + radius * Math.sin(latitude);
    const z = Math.cos(latitude) * Math.cos(lon);
    return { x, y, z };
  };

  const drawGrid = (center, radius) => {
    context.strokeStyle = "rgba(82, 230, 255, 0.18)";
    context.lineWidth = 1;

    for (let latitude = -60; latitude <= 60; latitude += 30) {
      context.beginPath();
      for (let i = 0; i <= 160; i += 1) {
        const longitude = (i / 160) * Math.PI * 2;
        const point = project((latitude * Math.PI) / 180, longitude, radius, center, state.rotation);
        if (point.z < -0.2) {
          continue;
        }
        if (i === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      }
      context.stroke();
    }

    for (let longitude = 0; longitude < 360; longitude += 30) {
      context.beginPath();
      for (let i = -80; i <= 80; i += 2) {
        const point = project((i * Math.PI) / 180, (longitude * Math.PI) / 180, radius, center, state.rotation);
        if (point.z < -0.12) {
          continue;
        }
        if (i === -80) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      }
      context.stroke();
    }
  };

  const draw = () => {
    const size = canvas.width / Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.8);
    const center = size / 2;
    const radius = size * 0.32;

    if (!state.dragging && !prefersReducedMotion) {
      state.rotation += 0.004 + state.manualVelocity;
      state.manualVelocity *= 0.94;
    }

    context.clearRect(0, 0, size, size);
    const glow = context.createRadialGradient(center, center, radius * 0.55, center, center, radius * 1.7);
    glow.addColorStop(0, "rgba(82, 230, 255, 0.16)");
    glow.addColorStop(0.5, "rgba(82, 230, 255, 0.06)");
    glow.addColorStop(1, "rgba(82, 230, 255, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, size, size);

    const body = context.createRadialGradient(center - radius * 0.32, center - radius * 0.28, radius * 0.1, center, center, radius);
    body.addColorStop(0, "#12375b");
    body.addColorStop(0.58, "#071827");
    body.addColorStop(1, "#020914");
    context.fillStyle = body;
    context.beginPath();
    context.arc(center, center, radius, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.beginPath();
    context.arc(center, center, radius, 0, Math.PI * 2);
    context.clip();
    drawGrid(center, radius);

    const projectedNodes = nodes
      .map((node) => ({
        ...node,
        point: project(node.latitude, node.longitude, radius * 1.02, center, state.rotation),
      }))
      .filter((node) => node.point.z > -0.08);

    context.strokeStyle = "rgba(82, 230, 255, 0.26)";
    context.lineWidth = 1;
    for (let i = 0; i < projectedNodes.length - 1; i += 3) {
      const from = projectedNodes[i].point;
      const to = projectedNodes[(i + 5) % projectedNodes.length]?.point;
      if (!to || Math.hypot(from.x - to.x, from.y - to.y) > radius * 0.8) {
        continue;
      }
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    }

    projectedNodes.forEach((node) => {
      const alpha = Math.max(0.22, node.point.z);
      context.globalAlpha = alpha;
      context.shadowColor = "#52e6ff";
      context.shadowBlur = 14;
      context.fillStyle = "#9df4ff";
      context.beginPath();
      context.arc(node.point.x, node.point.y, 2.2 + Math.sin(node.pulse + state.rotation * 2) * 0.5, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;
    context.restore();

    context.strokeStyle = "rgba(82, 230, 255, 0.45)";
    context.lineWidth = 1.5;
    context.beginPath();
    context.arc(center, center, radius * 1.12, 0.2, Math.PI * 1.78);
    context.stroke();

    context.strokeStyle = "rgba(157, 124, 255, 0.38)";
    context.beginPath();
    context.ellipse(center, center, radius * 1.32, radius * 0.34, state.rotation * 0.35, 0, Math.PI * 2);
    context.stroke();

    context.shadowColor = "transparent";
    requestAnimationFrame(draw);
  };

  canvas.addEventListener("pointerdown", (event) => {
    state.dragging = true;
    state.lastX = event.clientX;
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.dragging) {
      return;
    }

    const delta = event.clientX - state.lastX;
    state.rotation += delta * 0.01;
    state.manualVelocity = delta * 0.0006;
    state.lastX = event.clientX;
  });

  canvas.addEventListener("pointerup", () => {
    state.dragging = false;
  });

  resize();
  loader?.remove();
  draw();
  window.addEventListener("resize", resize, { passive: true });
}

function initSkillConstellation() {
  const readout = $("#skill-readout");
  const descriptions = {
    "C++": ["Systems-minded problem solving and data-structure practice.", ["DSA", "Performance", "Logic"]],
    Python: ["Scripting, data workflows, and machine-learning fundamentals.", ["ML", "Data", "Automation"]],
    JavaScript: ["Interactive browser experiences and full-stack application logic.", ["React", "Node.js", "Web"]],
    React: ["Component-based interfaces for modern web applications.", ["JavaScript", "UI", "State"]],
    "Node.js": ["Server-side JavaScript for APIs and application backends.", ["Express", "MongoDB", "APIs"]],
    MongoDB: ["Document database work for full-stack project storage.", ["Node.js", "Express", "Data"]],
    AWS: ["Cloud technology focus for deployment-ready applications.", ["Cloud", "DevOps", "Docker"]],
  };

  $$(".skill-node").forEach((node) => {
    node.addEventListener("pointerenter", () => {
      $$(".skill-node").forEach((item) => item.classList.remove("is-active"));
      node.classList.add("is-active");

      const skill = node.dataset.skill;
      const [body, tags] = descriptions[skill] || descriptions.JavaScript;
      if (readout) {
        readout.innerHTML = `
          <p class="panel-kicker">Signal selected</p>
          <h3>${skill}</h3>
          <p>${body}</p>
          <div class="tag-row">${tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
        `;
      }
    });
  });
}

function initProjectTilt() {
  if (prefersReducedMotion || isMobile) {
    return;
  }

  $$("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${y * -7}deg) rotateY(${x * 8}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function showToast(message) {
  const existing = $(".toast");
  existing?.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));

  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => toast.remove(), 260);
  }, 3200);
}

function initContactAndResume() {
  $("#resume-button")?.addEventListener("click", () => {
    showToast("Resume file is not in the project yet. Add a PDF asset and I can wire this button to it.");
  });

  const form = $("#contact-form");
  const status = $("#contact-status");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const isLocalPreview =
      window.location.protocol === "file:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    const setStatus = (message, type = "") => {
      if (!status) {
        return;
      }

      status.textContent = message;
      status.className = `contact-status ${type}`;
    };

    if (isLocalPreview) {
      const name = formData.get("name");
      const email = formData.get("email");
      const message = formData.get("message");
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:padalasuraj80@gmail.com?subject=Portfolio contact from ${encodeURIComponent(
        name
      )}&body=${body}`;
      setStatus("Opening your email app to send the message.", "success");
      return;
    }

    setStatus("Sending signal...");
    if (submitButton) {
      submitButton.disabled = true;
    }

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData),
    })
      .then((response) => {
        if (response.ok) {
          setStatus("Message sent successfully.", "success");
          form.reset();
        } else {
          setStatus("There was a problem. Please try again.", "error");
        }
      })
      .catch(() => setStatus("There was a problem. Please try again.", "error"))
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  });
}

function initCyberRunner() {
  const canvas = $("#cyber-runner");
  const context = canvas?.getContext("2d");
  const scoreEl = $("#game-score");
  const highScoreEl = $("#game-high-score");
  const overlay = $("#game-overlay");
  const startButton = $("#start-game");
  const muteButton = $("#mute-game");

  if (!canvas || !context) {
    return;
  }

  let width = canvas.width;
  let height = canvas.height;
  let running = false;
  let gameOver = false;
  let animationId = 0;
  let lastTime = 0;
  let spawnTimer = 0;
  let energyTimer = 0;
  let score = 0;
  let speed = 250;
  let shake = 0;
  let muted = localStorage.getItem("cyberRunnerMuted") === "true";
  let highScore = Number(localStorage.getItem("cyberRunnerHighScore") || 0);
  const keys = { left: false, right: false };
  const player = { x: width / 2, y: height - 72, width: 42, height: 58, vx: 0 };
  const obstacles = [];
  const energy = [];
  const particles = [];
  let audioContext = null;

  highScoreEl.textContent = String(highScore);

  const updateMuteIcon = () => {
    const icon = muteButton?.querySelector("i");
    if (icon) {
      icon.className = muted ? "bx bx-volume-mute" : "bx bx-volume-full";
    }
  };
  updateMuteIcon();

  const beep = (frequency, duration = 0.08, gainValue = 0.04) => {
    if (muted) {
      return;
    }

    audioContext ||= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = "triangle";
    gain.gain.value = gainValue;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  };

  const reset = () => {
    width = canvas.width;
    height = canvas.height;
    running = true;
    gameOver = false;
    lastTime = performance.now();
    spawnTimer = 0;
    energyTimer = 0;
    score = 0;
    speed = 250;
    shake = 0;
    player.x = width / 2;
    player.y = height - 72;
    obstacles.length = 0;
    energy.length = 0;
    particles.length = 0;
    overlay?.classList.add("is-hidden");
    scoreEl.textContent = "0";
    beep(220, 0.07);
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(loop);
  };

  const spawnObstacle = () => {
    const laneWidth = width / 5;
    const lane = Math.floor(Math.random() * 5);
    obstacles.push({
      x: laneWidth * lane + laneWidth * 0.5 - 26,
      y: -70,
      width: 52,
      height: 52 + Math.random() * 34,
    });
  };

  const spawnEnergy = () => {
    energy.push({
      x: 40 + Math.random() * (width - 80),
      y: -28,
      radius: 10,
      pulse: Math.random() * Math.PI * 2,
    });
  };

  const explode = (x, y, color) => {
    for (let i = 0; i < 24; i += 1) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 240,
        vy: (Math.random() - 0.5) * 240,
        life: 0.75,
        color,
      });
    }
  };

  const intersects = (rect, circleOrRect) => {
    if ("radius" in circleOrRect) {
      const nearestX = Math.max(rect.x, Math.min(circleOrRect.x, rect.x + rect.width));
      const nearestY = Math.max(rect.y, Math.min(circleOrRect.y, rect.y + rect.height));
      return Math.hypot(circleOrRect.x - nearestX, circleOrRect.y - nearestY) < circleOrRect.radius;
    }

    return (
      rect.x < circleOrRect.x + circleOrRect.width &&
      rect.x + rect.width > circleOrRect.x &&
      rect.y < circleOrRect.y + circleOrRect.height &&
      rect.y + rect.height > circleOrRect.y
    );
  };

  const endGame = () => {
    running = false;
    gameOver = true;
    highScore = Math.max(highScore, Math.floor(score));
    localStorage.setItem("cyberRunnerHighScore", String(highScore));
    highScoreEl.textContent = String(highScore);
    overlay.innerHTML = `
      <h3>Mission Complete</h3>
      <p>Score ${Math.floor(score)}. High score ${highScore}.</p>
      <button class="control-button magnetic" id="restart-game" type="button">
        <i class="bx bx-refresh"></i>
        Restart
      </button>
    `;
    overlay.classList.remove("is-hidden");
    $("#restart-game")?.addEventListener("click", reset);
    explode(player.x, player.y, "#ff4d74");
    beep(96, 0.18, 0.05);
  };

  const update = (delta) => {
    spawnTimer += delta;
    energyTimer += delta;
    speed += delta * 11;
    score += delta * 12;
    shake = Math.max(0, shake - delta * 16);

    if (spawnTimer > Math.max(0.42, 1.1 - speed / 900)) {
      spawnTimer = 0;
      spawnObstacle();
    }

    if (energyTimer > 0.9) {
      energyTimer = 0;
      spawnEnergy();
    }

    const targetVelocity = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
    player.vx += (targetVelocity * 420 - player.vx) * Math.min(1, delta * 12);
    player.x = Math.max(24, Math.min(width - 24, player.x + player.vx * delta));

    obstacles.forEach((obstacle) => {
      obstacle.y += speed * delta;
    });

    energy.forEach((item) => {
      item.y += (speed * 0.78) * delta;
      item.pulse += delta * 6;
    });

    particles.forEach((particle) => {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.life -= delta;
    });

    const playerRect = {
      x: player.x - player.width / 2,
      y: player.y - player.height / 2,
      width: player.width,
      height: player.height,
    };

    for (let i = obstacles.length - 1; i >= 0; i -= 1) {
      if (intersects(playerRect, obstacles[i])) {
        shake = 10;
        endGame();
        return;
      }

      if (obstacles[i].y > height + 100) {
        obstacles.splice(i, 1);
      }
    }

    for (let i = energy.length - 1; i >= 0; i -= 1) {
      if (intersects(playerRect, energy[i])) {
        score += 65;
        explode(energy[i].x, energy[i].y, "#52e6ff");
        energy.splice(i, 1);
        beep(640, 0.06, 0.03);
      } else if (energy[i].y > height + 40) {
        energy.splice(i, 1);
      }
    }

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      if (particles[i].life <= 0) {
        particles.splice(i, 1);
      }
    }

    scoreEl.textContent = String(Math.floor(score));
  };

  const draw = () => {
    const offsetX = shake ? (Math.random() - 0.5) * shake : 0;
    const offsetY = shake ? (Math.random() - 0.5) * shake : 0;
    context.save();
    context.translate(offsetX, offsetY);
    context.clearRect(-20, -20, width + 40, height + 40);
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#030813");
    gradient.addColorStop(1, "#071827");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(82, 230, 255, 0.16)";
    context.lineWidth = 1;
    for (let y = 0; y < height; y += 38) {
      context.beginPath();
      context.moveTo(0, y + ((performance.now() / 18) % 38));
      context.lineTo(width, y + ((performance.now() / 18) % 38));
      context.stroke();
    }

    for (let x = 0; x <= width; x += width / 5) {
      context.beginPath();
      context.moveTo(width / 2, height * 0.18);
      context.lineTo(x, height);
      context.stroke();
    }

    obstacles.forEach((obstacle) => {
      context.shadowColor = "#ff4d74";
      context.shadowBlur = 18;
      context.fillStyle = "rgba(255, 77, 116, 0.78)";
      context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      context.strokeStyle = "#ffd6df";
      context.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    energy.forEach((item) => {
      context.shadowColor = "#52e6ff";
      context.shadowBlur = 20;
      context.fillStyle = "#52e6ff";
      context.beginPath();
      context.arc(item.x, item.y, item.radius + Math.sin(item.pulse) * 2, 0, Math.PI * 2);
      context.fill();
    });

    particles.forEach((particle) => {
      context.globalAlpha = Math.max(0, particle.life);
      context.shadowColor = particle.color;
      context.shadowBlur = 18;
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;

    context.shadowColor = "#52e6ff";
    context.shadowBlur = 24;
    context.fillStyle = "#ecf8ff";
    context.beginPath();
    context.moveTo(player.x, player.y - 34);
    context.lineTo(player.x - 24, player.y + 26);
    context.lineTo(player.x, player.y + 14);
    context.lineTo(player.x + 24, player.y + 26);
    context.closePath();
    context.fill();
    context.fillStyle = "#52e6ff";
    context.fillRect(player.x - 5, player.y + 24, 10, 22);

    context.restore();
  };

  const loop = (time) => {
    const delta = Math.min(0.034, (time - lastTime) / 1000);
    lastTime = time;

    if (running) {
      update(delta);
    }

    draw();

    if (running || gameOver) {
      animationId = requestAnimationFrame(loop);
    }
  };

  const setKey = (code, value) => {
    if (code === "ArrowLeft" || code === "KeyA") {
      keys.left = value;
    }
    if (code === "ArrowRight" || code === "KeyD") {
      keys.right = value;
    }
  };

  window.addEventListener("keydown", (event) => setKey(event.code, true));
  window.addEventListener("keyup", (event) => setKey(event.code, false));
  $("#touch-left")?.addEventListener("pointerdown", () => (keys.left = true));
  $("#touch-left")?.addEventListener("pointerup", () => (keys.left = false));
  $("#touch-left")?.addEventListener("pointerleave", () => (keys.left = false));
  $("#touch-right")?.addEventListener("pointerdown", () => (keys.right = true));
  $("#touch-right")?.addEventListener("pointerup", () => (keys.right = false));
  $("#touch-right")?.addEventListener("pointerleave", () => (keys.right = false));
  startButton?.addEventListener("click", reset);
  muteButton?.addEventListener("click", () => {
    muted = !muted;
    localStorage.setItem("cyberRunnerMuted", String(muted));
    updateMuteIcon();
  });

  draw();
}

initNavigation();
initReveal();
initCursorAndParallax();
initMagneticButtons();
initStarfield();
initSatelliteSystem();
initSamuraiTransitions();
initSamuraiCutaways();
initGlobe();
initSkillConstellation();
initProjectTilt();
initContactAndResume();
initCyberRunner();
