// THREE.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("galaxy"), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const pointLight = new THREE.PointLight(0xffffff, 2, 100);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// Sun
const sunTexture = new THREE.TextureLoader().load("assets/space-bg.jpg");
const sunGeo = new THREE.SphereGeometry(5, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// Starfield
function createStars() {
  const geo = new THREE.BufferGeometry();
  const mat = new THREE.PointsMaterial({ color: 0xffffff });
  const vertices = [];
  for (let i = 0; i < 10000; i++) {
    vertices.push(
      THREE.MathUtils.randFloatSpread(2000),
      THREE.MathUtils.randFloatSpread(2000),
      THREE.MathUtils.randFloatSpread(2000)
    );
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  scene.add(new THREE.Points(geo, mat));
}
createStars();

// Planet data
const planets = [];
const planetTextures = [
  { name: "Frontend Dev", desc: "HTML, CSS, Tailwind, React.js", texture: "assets/earth.jpg", radius: 10 },
  { name: "JavaScript Lover", desc: "Vanilla JS, Node.js, APIs", texture: "assets/mars.jpg", radius: 15 },
  { name: "Designer", desc: "UI/UX, Figma, Animation", texture: "assets/jupiter.jpg", radius: 20 },
];

// Create planets
planetTextures.forEach((p, i) => {
  const tex = new THREE.TextureLoader().load(p.texture);
  const geo = new THREE.SphereGeometry(2, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ map: tex });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData = { name: p.name, desc: p.desc, radius: p.radius, angle: Math.random() * Math.PI * 2, speed: 0.001 + i * 0.0005 };
  scene.add(mesh);
  planets.push(mesh);
});

// Click interactivity
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", e => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);
  if (intersects.length > 0) {
    const p = intersects[0].object.userData;
    document.getElementById("modal-title").innerText = p.name;
    document.getElementById("modal-description").innerText = p.desc;
    document.getElementById("modal").style.display = "flex";
  }
});

// Close modal
document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  sun.rotation.y += 0.002;
  planets.forEach(p => {
    p.userData.angle += p.userData.speed;
    p.position.x = Math.cos(p.userData.angle) * p.userData.radius;
    p.position.z = Math.sin(p.userData.angle) * p.userData.radius;
    p.rotation.y += 0.005;
  });
  renderer.render(scene, camera);
}
animate();

// Responsive
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
