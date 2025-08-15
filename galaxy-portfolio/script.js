// === 3D Galaxy Portfolio Script ===

// --- Scene & Camera ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 35;
window.camera = camera; // for debugging

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("galaxy"),
  antialias: true
});
renderer.setClearColor(0x000000);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// --- Lighting ---
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const pointLight = new THREE.PointLight(0xffffff, 2.2, 100);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// --- Starfield Background ---
function createStars() {
  const geo = new THREE.BufferGeometry();
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
  const verts = [];
  for (let i = 0; i < 5000; i++) {
    verts.push(
      THREE.MathUtils.randFloatSpread(700),
      THREE.MathUtils.randFloatSpread(700),
      THREE.MathUtils.randFloatSpread(700)
    );
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  const pts = new THREE.Points(geo, starMat);
  scene.add(pts);
}
createStars();

// --- Sun (using color not texture to guarantee loading) ---
const sunGeo = new THREE.SphereGeometry(5, 50, 50);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xFFF375 });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// --- Planets: Texture URLs will always work ---
const planetsConfig = [
  {
    name: "Frontend Dev",
    desc: "HTML, CSS, Tailwind, React.js",
    texture: "https://raw.githubusercontent.com/rochapablo/planet-textures/master/2k_earth_daymap.jpg",
    orbit: 13,
    speed: 0.008
  },
  {
    name: "JavaScript Lover",
    desc: "Vanilla JS, Node.js, APIs",
    texture: "https://raw.githubusercontent.com/rochapablo/planet-textures/master/2k_mars.jpg",
    orbit: 18,
    speed: 0.0053
  },
  {
    name: "Designer",
    desc: "UI/UX, Figma, Animation",
    texture: "https://raw.githubusercontent.com/rochapablo/planet-textures/master/2k_jupiter.jpg",
    orbit: 25,
    speed: 0.0034
  }
];

const loader = new THREE.TextureLoader();
const planets = [];

planetsConfig.forEach((p, i) => {
  loader.load(
    p.texture,
    tex => {
      const planetGeo = new THREE.SphereGeometry(2.2, 40, 40);
      const planetMat = new THREE.MeshStandardMaterial({ map: tex });
      const mesh = new THREE.Mesh(planetGeo, planetMat);
      mesh.userData = { name: p.name, desc: p.desc, orbit: p.orbit, speed: p.speed, angle: Math.random() * Math.PI * 2 };
      mesh.position.set(
        Math.cos(mesh.userData.angle) * p.orbit,
        0,
        Math.sin(mesh.userData.angle) * p.orbit
      );
      scene.add(mesh);
      planets.push(mesh);
    },
    undefined, // onProgress
    err => {
      // fallback solid color if texture fails
      const planetGeo = new THREE.SphereGeometry(2.2, 40, 40);
      const fallback = new THREE.MeshStandardMaterial({ color: 0x999999 });
      const mesh = new THREE.Mesh(planetGeo, fallback);
      mesh.userData = { name: p.name, desc: p.desc, orbit: p.orbit, speed: p.speed, angle: Math.random() * Math.PI * 2 };
      mesh.position.set(
        Math.cos(mesh.userData.angle) * p.orbit,
        0,
        Math.sin(mesh.userData.angle) * p.orbit
      );
      scene.add(mesh);
      planets.push(mesh);
    }
  );
});

// --- Orbit Animation ---
function animate() {
  sun.rotation.y += 0.002;
  planets.forEach(mesh => {
    mesh.userData.angle += mesh.userData.speed;
    mesh.position.x = Math.cos(mesh.userData.angle) * mesh.userData.orbit;
    mesh.position.z = Math.sin(mesh.userData.angle) * mesh.userData.orbit;
    mesh.rotation.y += 0.005;
  });
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// --- Raycasting: Planet Click Interactivity ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
  // For overlay/modal, don't trigger 3D click
  if (event.target.closest('.modal-content')) return;
  // Normalize mouse
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);
  if (intersects.length > 0) {
    const planet = intersects[0].object.userData;
    document.getElementById("modal-title").innerText = planet.name;
    document.getElementById("modal-description").innerText = planet.desc;
    document.getElementById("modal").style.display = "flex";
  }
});

// --- Modal Close & Responsiveness ---
document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
