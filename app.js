(() => {
'use strict';
const canvas = document.getElementById('poster');
const fileInput = document.getElementById('photoInput');
const uploadZone = document.getElementById('uploadZone');
const photoTools = document.getElementById('photoTools');
const zoomSlider = document.getElementById('zoom');
const zoomValue = document.getElementById('zoomValue');
const nameInput = document.getElementById('participantName');
const status = document.getElementById('status');
const handle = document.getElementById('photoHandle');
let userImage = null, zoom = 1, offsetX = 0, offsetY = 0, drag = null, pinch = null, frame = 0;
const pointers = new Map();
const logo = new Image(); logo.src = 'assets/logo-jad-240.png';
logo.onload = ()=>{renderBackground();draw()};
const fontsReady = document.fonts ? Promise.all([
 document.fonts.load('400 110px "Great Vibes"'),
 document.fonts.load('italic 600 48px "Cormorant Garamond"'),
 document.fonts.load('900 38px Outfit'),
]).catch(()=>{}):Promise.resolve();
fontsReady.then(()=>{renderBackground();draw()});
const W = 1080, H = 1350;
const portrait = {x:190, y:506, w:700, h:490};
const MAX_ZOOM = 2.6;
// Everything except the photo and the name is static: it is painted once here and reused on every redraw.
const background = document.createElement('canvas'); background.width = W; background.height = H;
let ctx = background.getContext('2d');
const screen = canvas.getContext('2d');
function roundedPath(x,y,w,h,r){const t=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+t,y);ctx.arcTo(x+w,y,x+w,y+h,t);ctx.arcTo(x+w,y+h,x,y+h,t);ctx.arcTo(x,y+h,x,y,t);ctx.arcTo(x,y,x+w,y,t);ctx.closePath();}
function fillText(text,x,y,size,weight='800',color='#fff',align='left',family='Outfit'){
  ctx.save();ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${family}, Arial, sans-serif`;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(text,x,y);ctx.restore();
}
function trackText(text,x,y,spacing=5,size=21,color='#fff',weight='700'){
 ctx.save();ctx.font=`${weight} ${size}px 'Outfit', Arial, sans-serif`;ctx.textAlign='center';ctx.fillStyle=color;let letters=[...text];let width=letters.reduce((s,c)=>s+ctx.measureText(c).width,0)+spacing*(letters.length-1);let cursor=x-width/2;for(const c of letters){const cw=ctx.measureText(c).width;ctx.fillText(c,cursor+cw/2,y);cursor+=cw+spacing}ctx.restore();
}
function cover(img,x,y,w,h,zoomFactor=1,dx=0,dy=0){const base=Math.max(w/img.width,h/img.height)*zoomFactor;const dw=img.width*base,dh=img.height*base;const maxX=Math.max(0,(dw-w)/2),maxY=Math.max(0,(dh-h)/2);ctx.drawImage(img,x+(w-dw)/2+Math.max(-maxX,Math.min(maxX,dx)),y+(h-dh)/2+Math.max(-maxY,Math.min(maxY,dy)),dw,dh);}
function photoFrame(){const {x,y,w,h}=portrait;
 ctx.save();ctx.shadowColor='#0006';ctx.shadowBlur=40;ctx.shadowOffsetY=12;roundedPath(x-4,y-4,w+8,h+8,48);ctx.fillStyle='#e6a431';ctx.fill();ctx.restore();
 ctx.save();ctx.strokeStyle='#f3c98555';ctx.lineWidth=1;roundedPath(x-16,y-16,w+32,h+32,60);ctx.stroke();ctx.restore();
}
function photo(){const {x,y,w,h}=portrait;
 ctx.save();roundedPath(x,y,w,h,44);ctx.clip();
 if(userImage){cover(userImage,x,y,w,h,zoom,offsetX,offsetY);}else{
 const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#753450');g.addColorStop(1,'#2e0e24');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
 ctx.fillStyle='#a66581';ctx.beginPath();ctx.arc(x+w/2,y+172,90,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(x+w/2,y+510,250,235,0,Math.PI,2*Math.PI);ctx.fill();
 fillText('VOTRE PHOTO',x+w/2,y+363,25,'800','#f7cbd6','center');
 }
 const fade=ctx.createLinearGradient(0,y+420,0,y+h);fade.addColorStop(0,'#28051500');fade.addColorStop(1,'#280515a8');ctx.fillStyle=fade;ctx.fillRect(x,y,w,h);
 ctx.restore();
}
function renderBackground(){
 ctx=background.getContext('2d');
 ctx.clearRect(0,0,W,H);
 const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#760d40');bg.addColorStop(.42,'#4b0410');bg.addColorStop(1,'#210510');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 const bloom=ctx.createRadialGradient(480,350,65,480,350,620);bloom.addColorStop(0,'#e44c855c');bloom.addColorStop(1,'#e44c8500');ctx.fillStyle=bloom;ctx.fillRect(0,0,W,1030);
 const bloom2=ctx.createRadialGradient(970,1100,0,970,1100,510);bloom2.addColorStop(0,'#f49a1d3a');bloom2.addColorStop(1,'#f49a1d00');ctx.fillStyle=bloom2;ctx.fillRect(420,650,660,700);
 // Decorative gold ribbons.
 ctx.save();ctx.globalAlpha=.35;ctx.strokeStyle='#ffb612';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(1090,700,170,390,-.22,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.22;ctx.beginPath();ctx.ellipse(-30,970,170,390,-.22,0,Math.PI*2);ctx.stroke();ctx.restore();
 // Fine-grain dot texture.
 ctx.fillStyle='#ffffff0b';for(let x=15;x<W;x+=26){for(let y=13;y<H;y+=26){ctx.fillRect(x,y,1.3,1.3)}}
 ctx.strokeStyle='#f3c98566';ctx.lineWidth=2;roundedPath(35,35,1010,1280,28);ctx.stroke();
 // A compact identity row leaves the title its own generous space.
 if(logo.complete && logo.naturalWidth){
  const scale=Math.min(92/logo.naturalWidth,94/logo.naturalHeight);
  const lw=logo.naturalWidth*scale,lh=logo.naturalHeight*scale;
  ctx.drawImage(logo,494+(92-lw)/2,66+(94-lh)/2,lw,lh);
 }
 trackText('JAD LOCALE · TEMPLE ELIM',540,202,2.5,20,'#ffffff');
 // The event leads the composition; the personal message follows in script.
 trackText('CONCERT',540,280,11,52,'#ffbf38','900');
 trackText('D’ÉVANGÉLISATION',540,327,4,30,'#ffffff','800');
 ctx.save();ctx.strokeStyle='#e6a431';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(452,358);ctx.lineTo(520,358);ctx.moveTo(560,358);ctx.lineTo(628,358);ctx.stroke();ctx.translate(540,358);ctx.rotate(Math.PI/4);ctx.fillStyle='#ffbf38';ctx.fillRect(-4,-4,8,8);ctx.restore();
 fillText('Je serai là !',540,455,102,'400','#ffce65','center','"Great Vibes"');
 photoFrame();
 // Keep the message below the portrait, clear of the photo and its frame.
 trackText('UNE RENCONTRE QUI CHANGE',540,1062,2,24,'#ffffff','700');
 fillText('L’histoire d’une vie',540,1120,52,'italic 600','#ffcf78','center','"Cormorant Garamond"');
 trackText('3ÈME ÉDITION · JEAN 4:5-30',540,1164,2,16,'#e4bac7');
 ctx.fillStyle='#ffb612';roundedPath(224,1246,632,46,23);ctx.fill();
 fillText('29 NOVEMBRE 2026',540,1277,24,'900','#4b0410','center');
 fillText('ÉGLISE TEMPLE ELIM · SOMGANDÉ',540,1320,16,'700','#fff0e3','center');
 ctx=screen;
}
function draw(){
 cancelAnimationFrame(frame);frame=0;
 ctx=screen;
 ctx.drawImage(background,0,0);
 photo();
 const providedName=nameInput.value.trim().replace(/\s+/g,' ').toLocaleUpperCase('fr');
 if(providedName){let size=24;while(size>14){ctx.font=`800 ${size}px Outfit, Arial`;if(ctx.measureText(providedName).width<=750)break;size--;}fillText(providedName,540,1226,size,'800','#ffffff','center');}
}
function requestDraw(){if(!frame)frame=requestAnimationFrame(draw)}
// Phone photos are often 12+ megapixels; redrawing them on every touch move is what makes mobile stutter.
function shrink(img){const scale=Math.max(portrait.w/img.width,portrait.h/img.height)*MAX_ZOOM;if(scale>=1)return img;
 const c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);const g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(img,0,0,c.width,c.height);return c;}
function setImage(file){
 if(!file)return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)){status.textContent='Choisissez une photo JPG, PNG ou WEBP.';return;}
 if(file.size>15*1024*1024){status.textContent='Votre photo dépasse 15 Mo. Choisissez une image plus légère.';return;}
 const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>{URL.revokeObjectURL(url);userImage=shrink(img);offsetX=0;offsetY=0;zoom=1;zoomSlider.value='100';zoomValue.textContent='100 %';photoTools.hidden=false;handle.hidden=false;uploadZone.querySelector('strong').textContent='Changer de photo';status.textContent='Votre photo a été ajoutée.';draw();};img.onerror=()=>{URL.revokeObjectURL(url);status.textContent='Impossible d’ouvrir cette image.'};img.src=url;
}
fileInput.addEventListener('change',e=>setImage(e.target.files[0]));
for(const type of ['dragenter','dragover'])uploadZone.addEventListener(type,e=>{e.preventDefault();uploadZone.classList.add('drag-over')});
for(const type of ['dragleave','drop'])uploadZone.addEventListener(type,e=>{e.preventDefault();uploadZone.classList.remove('drag-over')});
uploadZone.addEventListener('drop',e=>setImage(e.dataTransfer.files[0]));
function setZoom(value){zoom=Math.max(1,Math.min(MAX_ZOOM,value));zoomSlider.value=String(Math.round(zoom*100));zoomValue.textContent=zoomSlider.value+' %';requestDraw()}
zoomSlider.addEventListener('input',()=>setZoom(Number(zoomSlider.value)/100));
nameInput.addEventListener('input',requestDraw);
document.getElementById('resetPhoto').addEventListener('click',()=>{offsetX=0;offsetY=0;zoom=1;zoomSlider.value=100;zoomValue.textContent='100 %';draw()});
function point(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
function spread(){const [a,b]=[...pointers.values()];return Math.hypot(a.x-b.x,a.y-b.y)}
// One finger moves the photo, two fingers pinch-zoom it; the handle only covers the portrait so the page still scrolls elsewhere.
handle.addEventListener('pointerdown',e=>{if(!userImage)return;e.preventDefault();handle.setPointerCapture(e.pointerId);pointers.set(e.pointerId,point(e));
 if(pointers.size===2){drag=null;pinch={distance:spread(),zoom}}else if(pointers.size===1){drag=point(e)}handle.classList.add('dragging')});
handle.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||!userImage)return;const p=point(e);pointers.set(e.pointerId,p);
 if(pinch&&pointers.size===2){setZoom(pinch.zoom*spread()/pinch.distance);return}
 if(!drag)return;offsetX+=p.x-drag.x;offsetY+=p.y-drag.y;drag=p;
 // Keep the offset inside what cover() can show, so the photo responds immediately when dragged back.
 const base=Math.max(portrait.w/userImage.width,portrait.h/userImage.height)*zoom;const maxX=Math.max(0,(userImage.width*base-portrait.w)/2),maxY=Math.max(0,(userImage.height*base-portrait.h)/2);
 offsetX=Math.max(-maxX,Math.min(maxX,offsetX));offsetY=Math.max(-maxY,Math.min(maxY,offsetY));requestDraw()});
function release(e){pointers.delete(e.pointerId);pinch=null;const rest=[...pointers.values()];drag=rest.length===1?rest[0]:null;if(!pointers.size)handle.classList.remove('dragging')}
for(const type of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(type,release);
async function download(type){if(!userImage){status.textContent='Ajoutez d’abord votre photo pour créer votre affiche.';fileInput.focus();return;}
 await fontsReady;
 draw();const ext=type==='image/png'?'png':'jpg';
 try{
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(result=>result?resolve(result):reject(new Error('La création de l’image a échoué.')),type,type==='image/jpeg'?.94:undefined));
  const url=URL.createObjectURL(blob);const link=document.createElement('a');link.download=`je-serai-la-temple-elim-2026.${ext}`;link.href=url;document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  status.textContent=`Votre affiche ${ext.toUpperCase()} est prête !`;
 }catch(error){status.textContent='Le téléchargement a échoué. Réessayez ou utilisez un autre navigateur.';console.error('Échec de la création du téléchargement :',error);}
}
document.getElementById('downloadPng').addEventListener('click',()=>download('image/png'));
document.getElementById('downloadJpg').addEventListener('click',()=>download('image/jpeg'));
renderBackground();draw();
})();
