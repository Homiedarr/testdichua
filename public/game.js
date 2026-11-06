import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const socket = io();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb9d5c8);
scene.fog = new THREE.Fog(0xb9d5c8, 28, 75);

const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 150);
camera.position.set(0, 8, 12);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.querySelector("#game").appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xe9fff2, 0x65745b, 2.0));
const sun = new THREE.DirectionalLight(0xfff0d5, 2.2);
sun.position.set(-12, 22, 10); sun.castShadow = true; sun.shadow.mapSize.set(2048,2048);
scene.add(sun);

const mat = (color, roughness=0.9) => new THREE.MeshStandardMaterial({color, roughness});
const ground = new THREE.Mesh(new THREE.PlaneGeometry(100,100), mat("#91aa83"));
ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);

function box(w,h,d,color,x,y,z, parent=scene) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat(color));
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
}
function cylinder(rt,rb,h,color,x,y,z,parent=scene, sides=16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,sides),mat(color));
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
}

// Stone path
for(let i=0;i<9;i++) box(2.2,.12,1.25,"#b8b4a1",0,.08,8-i*2);
// Temple platform and building
box(15,.45,10,"#c9b99b",0,.25,-15);
box(11,3.6,6,"#e5d5b7",0,2.25,-16);
box(11.8,.25,6.8,"#8c4935",0,4.1,-16);
const roof = new THREE.Mesh(new THREE.ConeGeometry(7.8,2.2,4),mat("#754331"));
roof.rotation.y=Math.PI/4; roof.position.set(0,5.1,-16); roof.scale.set(1,.55,.65); roof.castShadow=true; scene.add(roof);
box(1.8,2.6,.18,"#704a34",0,1.75,-12.9);
for(let x of [-3.7,3.7]) cylinder(.16,.16,2.7,"#754b31",x,1.8,-12.85);
// Bell
cylinder(.8,.65,1.3,"#bd9451",7,.85,-10);
const bellTop=cylinder(.12,.18,.5,"#8c6c3f",7,1.7,-10);

// Lotus pond
const pond = new THREE.Mesh(new THREE.CylinderGeometry(6,6,.35,48),mat("#4d9c9a"));
pond.position.set(-12,.08,-5); pond.receiveShadow=true; scene.add(pond);
const rim = new THREE.Mesh(new THREE.TorusGeometry(6,.18,8,48),mat("#d2c4a4"));
rim.rotation.x=Math.PI/2; rim.position.set(-12,.28,-5); scene.add(rim);
for(let i=0;i<12;i++){
  const a=i*2.4, r=2+Math.random()*3.2;
  const leaf=new THREE.Mesh(new THREE.CircleGeometry(.42,16),mat("#5c9b60"));
  leaf.rotation.x=-Math.PI/2; leaf.position.set(-12+Math.cos(a)*r,.29,-5+Math.sin(a)*r); scene.add(leaf);
  const flower=cylinder(.12,.12,.12,"#f3b6c6",-12+Math.cos(a)*r,.42,-5+Math.sin(a)*r); flower.rotation.x=0;
}
// Trees and lanterns
function tree(x,z){
  cylinder(.22,.32,2.2,"#76533a",x,1.1,z);
  const crown=new THREE.Mesh(new THREE.SphereGeometry(1.45,12,10),mat("#477b55"));
  crown.position.set(x,2.7,z); crown.castShadow=true; scene.add(crown);
  const crown2=new THREE.Mesh(new THREE.SphereGeometry(.95,12,10),mat("#5d9160"));
  crown2.position.set(x+.55,3.25,z-.1); scene.add(crown2);
}
for(const [x,z] of [[-20,-16],[-21,4],[19,-17],[21,5],[-19,17],[18,18],[11,-25],[-8,-27]]) tree(x,z);
for(const [x,z] of [[-7,2],[7,2],[-7,-8],[7,-8]]){
  cylinder(.12,.18,1.4,"#76533a",x,.7,z);
  box(.65,.55,.65,"#a77c4c",x,1.55,z);
  const glow=new THREE.PointLight("#ffd99a",.7,5);glow.position.set(x,1.8,z);scene.add(glow);
}
// Buddha-inspired calm centerpiece, generic statue form
cylinder(.95,1.2,.4,"#bca77d",0,.25,-22);
const statue=new THREE.Group(); scene.add(statue); statue.position.set(0,.5,-22);
const body=new THREE.Mesh(new THREE.SphereGeometry(.8,20,16),mat("#c5ad7d")); body.scale.set(1,.85,.65); body.position.y=1; statue.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.42,20,16),mat("#c5ad7d")); head.position.y=2; statue.add(head);
const aura=new THREE.Mesh(new THREE.TorusGeometry(1.05,.08,8,40),mat("#d7bd80")); aura.position.y=2; statue.add(aura);

// Player avatars
const avatars = new Map();
function makeAvatar(p, isMe=false){
  const group=new THREE.Group();
  const robe=mat(p.color || "#d2a56b");
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.75,4,8),robe);body.position.y=.85;body.castShadow=true;group.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.27,12,10),mat("#e9c5a3"));head.position.y=1.55;head.castShadow=true;group.add(head);
  const nameCanvas=document.createElement("canvas");nameCanvas.width=512;nameCanvas.height=128;
  const ctx=nameCanvas.getContext("2d");ctx.fillStyle="#10231c";ctx.font="bold 48px sans-serif";ctx.textAlign="center";ctx.fillText(p.name||"Khách",256,78);
  const tex=new THREE.CanvasTexture(nameCanvas);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));
  sprite.scale.set(2.4,.6,1);sprite.position.y=2.25;group.add(sprite);
  group.position.set(p.x||0,0,p.z||0);group.rotation.y=p.rotation||0;
  scene.add(group); avatars.set(p.id,{group, targetX:group.position.x,targetZ:group.position.z,targetR:group.rotation.y});
  if(isMe) me=avatars.get(p.id);
}
let me=null, myId=null, joined=false;
function removeAvatar(id){const a=avatars.get(id);if(a){scene.remove(a.group);a.group.traverse(o=>{if(o.geometry)o.geometry.dispose();});avatars.delete(id);}}
function addOrUpdate(p){if(p.id===myId){if(!me)makeAvatar(p,true);return;}if(!avatars.has(p.id))makeAvatar(p);const a=avatars.get(p.id);a.targetX=p.x;a.targetZ=p.z;a.targetR=p.rotation||0;}

const keys=new Set();
addEventListener("keydown",e=>{
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
  if(e.key==="Enter" && joined){document.querySelector("#chatInput").focus();return;}
  keys.add(e.key.toLowerCase());
});
addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
addEventListener("blur",()=>keys.clear());

const joinScreen=document.querySelector("#joinScreen"), hud=document.querySelector("#hud");
document.querySelector("#joinButton").addEventListener("click",()=>{
  const name=document.querySelector("#playerName").value.trim()||"Khách";
  document.querySelector("#joinButton").disabled=true;
  socket.emit("join",{name},result=>{
    document.querySelector("#joinButton").disabled=false;
    if(!result?.ok){document.querySelector("#joinError").textContent=result?.message||"Không thể vào server.";return;}
    joined=true;joinScreen.classList.add("hidden");hud.classList.remove("hidden");
  });
});
socket.on("connect",()=>{document.querySelector("#joinError").textContent="";});
socket.on("connect_error",()=>{document.querySelector("#joinError").textContent="Không kết nối được server. Hãy kiểm tra server và mạng.";});
socket.on("currentPlayers",list=>list.forEach(addOrUpdate));
socket.on("playerJoined",addOrUpdate);
socket.on("playerMoved",addOrUpdate);
socket.on("playerLeft",removeAvatar);
socket.on("playerCount",n=>document.querySelector("#online").textContent=`Đang ở trong chùa: ${n}/20`);
socket.on("systemMessage",addSystem);
socket.on("chatMessage",m=>addMessage(m.name,m.message));

const messages=document.querySelector("#messages");
function addSystem(text){const d=document.createElement("div");d.className="system";d.textContent=text;messages.appendChild(d);messages.scrollTop=messages.scrollHeight;}
function addMessage(name,message){const d=document.createElement("div");d.className="message";const b=document.createElement("b");b.textContent=name+": ";d.append(b,document.createTextNode(message));messages.appendChild(d);messages.scrollTop=messages.scrollHeight;}
document.querySelector("#chatForm").addEventListener("submit",e=>{
  e.preventDefault();const input=document.querySelector("#chatInput");const value=input.value.trim();
  if(value){socket.emit("chatMessage",value);input.value="";input.blur();}
});

const clock=new THREE.Clock();let sendTimer=0;
function animate(){
  requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);
  if(joined&&me){
    let dx=0,dz=0;
    if(keys.has("w")||keys.has("arrowup"))dz-=1;
    if(keys.has("s")||keys.has("arrowdown"))dz+=1;
    if(keys.has("a")||keys.has("arrowleft"))dx-=1;
    if(keys.has("d")||keys.has("arrowright"))dx+=1;
    if(dx||dz){
      const len=Math.hypot(dx,dz);dx/=len;dz/=len;
      const speed=5.2*dt;me.group.position.x=Math.max(-24,Math.min(24,me.group.position.x+dx*speed));
      me.group.position.z=Math.max(-27,Math.min(24,me.group.position.z+dz*speed));
      me.group.rotation.y=Math.atan2(dx,dz);
      sendTimer+=dt;
      if(sendTimer>.05){socket.emit("move",{x:me.group.position.x,z:me.group.position.z,rotation:me.group.rotation.y});sendTimer=0;}
    }
    const desired=new THREE.Vector3(me.group.position.x,6.5,me.group.position.z+9.5);
    camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(me.group.position.x,1,me.group.position.z-1);
  }
  for(const [id,a] of avatars){if(id===myId)continue;a.group.position.x=THREE.MathUtils.lerp(a.group.position.x,a.targetX,.22);a.group.position.z=THREE.MathUtils.lerp(a.group.position.z,a.targetZ,.22);a.group.rotation.y=a.targetR;}
  renderer.render(scene,camera);
}
animate();
socket.on("connect",()=>{myId=socket.id;});
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
