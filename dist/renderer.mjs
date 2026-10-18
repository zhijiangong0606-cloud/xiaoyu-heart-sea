import {W,H} from './engine.mjs';
const TAU=Math.PI*2;
const palettes=[['#d8e9d7','#b5d8c3','#92c1af'],['#e4e6d8','#c3d8cb','#a1c1b0'],['#d7e1e9','#b3d1d3','#8db5b7']];
function ellipse(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=color;c.fill()}
function line(c,x,y,x2,y2,color,width=2){c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke()}
function star(c,x,y,r,color,rotation=0){c.save();c.translate(x,y);c.rotate(rotation);c.beginPath();for(let i=0;i<10;i++){let a=-Math.PI/2+i*Math.PI/5;let rr=i%2?r*.48:r;let px=Math.cos(a)*rr,py=Math.sin(a)*rr;i?c.lineTo(px,py):c.moveTo(px,py)}c.closePath();c.fillStyle=color;c.fill();c.restore()}
function sparkle(c,x,y,r,color){c.beginPath();c.moveTo(x,y-r);c.quadraticCurveTo(x+2,y-2,x+r,y);c.quadraticCurveTo(x+2,y+2,x,y+r);c.quadraticCurveTo(x-2,y+2,x-r,y);c.quadraticCurveTo(x-2,y-2,x,y-r);c.fillStyle=color;c.fill()}

export class SeaRenderer{
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.width=0;this.height=0;this.facing=1;this.bubbles=Array.from({length:24},(_,i)=>({x:(i*137.3+37)%1000,y:(i*83.6)%650,r:2+(i%5)*1.3,speed:8+(i%4)*4}));this.resize();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas)}
  resize(){const rect=this.canvas.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,2);this.width=rect.width;this.height=rect.height;this.canvas.width=Math.round(rect.width*dpr);this.canvas.height=Math.round(rect.height*dpr);this.dpr=dpr}
  draw(game,t,particles=[]){const c=this.ctx;if(!this.width||!this.height)return;c.setTransform(this.canvas.width/W,0,0,this.canvas.height/H,0,0);c.clearRect(0,0,W,H);const idle=game.state==='idle';this.background(c,t,idle?0:game.levelIndex);if(idle)this.preview(c,t);else{
      if(!game.endless&&game.stars.length>1){c.beginPath();c.moveTo(game.player.x,game.player.y);game.stars.forEach(s=>c.lineTo(s.x,s.y));c.strokeStyle='#fafbe52d';c.lineWidth=2;c.setLineDash([5,11]);c.stroke();c.setLineDash([])}
      for(const s of game.stars)this.collectible(c,s,t);
      for(const p of game.pickups)this.shield(c,p,t);
      for(const h of game.hazards)this.jelly(c,h.x,h.y,h.radius*1.17,t+h.phase,1);
      const p=game.player;if(Math.abs(p.vx)>1)this.facing=p.vx>0?1:-1;
      c.save();if(p.invincible>0&&p.dashTime<=0)c.globalAlpha=.5+.5*Math.abs(Math.sin(t*18));
      if(game.shieldTime>0||p.dashTime>0){const r=p.dashTime>0?49:44;ellipse(c,p.x,p.y,r,r,p.dashTime>0?'#ffffe82b':'#daf6f85c');c.beginPath();c.arc(p.x,p.y,r,0,TAU);c.strokeStyle=p.dashTime>0?'#fffaddc2':'#f4ffffbb';c.lineWidth=2;c.stroke();sparkle(c,p.x-r*.65,p.y-r*.65,6,'#fffdf4')}
      if(p.dashTime>0){for(let i=1;i<4;i++)line(c,p.x-this.facing*(40+i*16),p.y-13+i*10,p.x-this.facing*(65+i*22),p.y-13+i*10,'#fcffebb0',3)}
      this.fish(c,p.x,p.y,35,t,this.facing);c.restore();
    }
    for(const p of particles){c.save();c.globalAlpha=Math.max(0,p.life/p.maxLife);if(p.text){c.font=`600 ${p.size||22}px "Microsoft YaHei",sans-serif`;c.textAlign='center';c.fillStyle=p.color||'#fff8d5';c.fillText(p.text,p.x,p.y)}else{star(c,p.x,p.y,p.size||5,p.color||'#fff2ad',p.life*3)}c.restore()}
  }
  background(c,t,level){const pal=palettes[level]||palettes[0];const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,pal[0]);bg.addColorStop(.65,pal[1]);bg.addColorStop(1,pal[2]);c.fillStyle=bg;c.fillRect(0,0,W,H);
    c.save();c.globalAlpha=.14;for(let i=0;i<4;i++){c.beginPath();c.moveTo(200+i*220+Math.sin(t*.12)*10,-30);c.lineTo(280+i*240,650);c.lineTo(510+i*220,650);c.lineTo(285+i*220,-30);c.fillStyle='#ffffe7';c.fill()}c.restore();
    for(let i=0;i<3;i++){c.beginPath();c.moveTo(0,26+i*17);for(let x=0;x<=W;x+=10)c.lineTo(x,26+i*17+Math.sin(x*.012+t*.25+i)*9);c.lineTo(W,0);c.lineTo(0,0);c.closePath();c.fillStyle=['#eef3dc45','#f1f4df28','#fffbe317'][i];c.fill()}
    c.save();c.globalAlpha=.12;this.fish(c,830+Math.sin(t*.1)*12,180,15,t,-1,'#5e9d89');this.fish(c,860+Math.sin(t*.1)*12,199,10,t,-1,'#5e9d89');this.fish(c,153+Math.sin(t*.08)*15,165,11,t,1,'#5e9d89');c.restore();
    c.fillStyle='#a4c1a929';c.beginPath();c.moveTo(0,560);c.bezierCurveTo(190,430,270,625,460,556);c.bezierCurveTo(690,470,820,570,1000,505);c.lineTo(W,H);c.lineTo(0,H);c.fill();
    this.kelp(c,55,612,165,'#82af9470',t,7);this.kelp(c,933,613,210,'#73a68b65',t+1,6);this.kelp(c,878,630,115,'#8cb49a80',t+2,5);this.kelp(c,135,629,107,'#8ab09970',t+3,5);
    c.beginPath();c.moveTo(0,579);c.bezierCurveTo(120,535,235,584,362,605);c.bezierCurveTo(555,639,728,567,1000,574);c.lineTo(1000,H);c.lineTo(0,H);c.fillStyle='#dee0b8';c.fill();
    c.beginPath();c.moveTo(0,616);c.bezierCurveTo(174,579,233,622,404,626);c.bezierCurveTo(642,648,780,599,1000,608);c.lineTo(1000,H);c.lineTo(0,H);c.fillStyle='#e9e4c3';c.fill();
    c.save();c.globalAlpha=.4;for(let i=0;i<75;i++){const x=(i*137.71)%1000,y=603+(i*73.17)%43;ellipse(c,x,y,1+(i%3)*.6,1,'#b4b789')}c.restore();
    this.coral(c,73,617,95,t,'#d1aaa0','#e6c0ac');this.coral(c,960,624,78,t,'#d5b49e','#e7c9aa');this.kelp(c,23,637,119,'#73a68e',t,4);this.kelp(c,987,642,128,'#7aa98c',t+1,4);
    this.shell(c,180,610,19,'#d4b99d');this.shell(c,776,624,14,'#c5c7a5');star(c,862,600,19,'#d3b398',.3);ellipse(c,354,628,15,4,'#c9c6a1');ellipse(c,576,616,9,3,'#c9c6a1');
    for(const b of this.bubbles){const y=(b.y-t*b.speed)%700;const yy=y< -10?y+700:y;const x=b.x+Math.sin(t*.6+b.y)*5;c.beginPath();c.arc(x,yy,b.r,0,TAU);c.strokeStyle='#f8ffeb70';c.lineWidth=1.3;c.stroke();ellipse(c,x-b.r*.3,yy-b.r*.35,Math.max(1,b.r*.25),Math.max(1,b.r*.2),'#fcfff880')}
    for(let i=0;i<8;i++){const x=(i*197+42)%980,y=90+(i*67)%420;const alpha=.25+.2*Math.sin(t*.7+i);c.globalAlpha=alpha;sparkle(c,x,y,3+(i%3),'#f5f5d9')}c.globalAlpha=1;
  }
  fish(c,x,y,r,t,facing=1,color='#6d9e82'){
    c.save();c.translate(x,y+Math.sin(t*2)*1.8);c.scale(facing,1);c.rotate(Math.sin(t*2)*.022);const tail=Math.sin(t*7)*r*.10;
    c.beginPath();c.moveTo(-r*.75,0);c.quadraticCurveTo(-r*1.3,-r*.7+tail,-r*1.65,-r*.72+tail);c.quadraticCurveTo(-r*1.35,0,-r*1.6,r*.68+tail);c.quadraticCurveTo(-r*1.15,r*.5,-r*.75,0);c.fillStyle='#719f85';c.fill();
    c.beginPath();c.moveTo(-r*.2,-r*.5);c.quadraticCurveTo(-r*.05,-r*1.14,r*.4,-r*.6);c.fillStyle='#8fb698';c.fill();
    const grad=c.createLinearGradient(0,-r,0,r);grad.addColorStop(0,'#8db395');grad.addColorStop(.6,color);grad.addColorStop(1,'#527e69');ellipse(c,0,0,r*1.12,r*.77,grad);
    c.save();c.beginPath();c.ellipse(0,0,r*1.12,r*.77,0,0,TAU);c.clip();ellipse(c,r*.1,r*.55,r*.97,r*.35,'#cad7b2');c.restore();
    c.beginPath();c.moveTo(-r*.25,r*.1);c.quadraticCurveTo(-r*.75,r*.6,-r*.58,-r*.1);c.quadraticCurveTo(-r*.4,-r*.2,-r*.25,r*.1);c.fillStyle='#a1bea0';c.fill();
    ellipse(c,r*.54,-r*.16,r*.1,r*.13,'#244e44');ellipse(c,r*.56,-r*.2,r*.028,r*.04,'#f8ffe7');ellipse(c,r*.66,r*.14,r*.17,r*.1,'#d8b3a0');
    c.beginPath();c.arc(r*.78,r*.04,r*.14,.22,1.65);c.strokeStyle='#3c6954';c.lineWidth=Math.max(1.5,r*.035);c.lineCap='round';c.stroke();c.restore();
  }
  jelly(c,x,y,r,t,alpha=1){c.save();c.translate(x,y+Math.sin(t*1.7)*3);c.globalAlpha=alpha;const colors=['#b9abc2','#d3b9ca'];c.strokeStyle='#ad94b38c';c.lineWidth=2.6;c.lineCap='round';for(let i=0;i<4;i++){const xx=-r*.65+i*r*.43;c.beginPath();c.moveTo(xx,r*.1);c.bezierCurveTo(xx+Math.sin(t*2+i)*9,r*.7,xx-8,r*.95,xx+Math.cos(t*2+i)*7,r*1.4);c.stroke()}const g=c.createLinearGradient(0,-r,0,r*.4);g.addColorStop(0,colors[1]);g.addColorStop(1,colors[0]);c.beginPath();c.moveTo(-r,r*.15);c.bezierCurveTo(-r,-r*1.15,r,-r*1.15,r,r*.15);for(let i=4;i>=0;i--)c.quadraticCurveTo(-r+i*r*.5-r*.25,r*.44,-r+(i-1)*r*.5,r*.15);c.closePath();c.fillStyle=g;c.fill();c.beginPath();c.ellipse(-r*.28,-r*.42,r*.28,r*.13,-.5,0,TAU);c.fillStyle='#f2dce477';c.fill();ellipse(c,-r*.3,-r*.05,1.7,2,'#836b8a');ellipse(c,r*.3,-r*.05,1.7,2,'#836b8a');c.restore()}
  kelp(c,x,y,h,color,t,leaves){c.save();c.strokeStyle=color;c.fillStyle=color;c.lineCap='round';const bend=Math.sin(t*.7+x)*10;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x-8,y-h*.5,x+bend,y-h);c.lineWidth=3;c.stroke();for(let i=1;i<=leaves;i++){const yy=y-h*i/(leaves+1);const side=i%2?1:-1;const len=(14+15*Math.sin(i/(leaves+1)*Math.PI));const xx=x+bend*i/(leaves+1);c.beginPath();c.moveTo(xx,yy);c.quadraticCurveTo(xx+side*len*1.1,yy+1,xx+side*len*.8,yy-25);c.quadraticCurveTo(xx+side*3,yy-22,xx,yy);c.fill()}c.restore()}
  coral(c,x,y,h,t,color,light){c.save();c.strokeStyle=color;c.lineWidth=h*.085;c.lineCap='round';const branches=[[0,0,3,-h],[-1,-h*.35,-h*.32,-h*.61],[2,-h*.55,h*.28,-h*.87],[-h*.31,-h*.6,-h*.38,-h*.84],[h*.22,-h*.8,h*.4,-h*.98],[0,-h*.2,h*.34,-h*.43],[h*.31,-h*.43,h*.41,-h*.67]];for(const [a,b,d,e]of branches){c.beginPath();c.moveTo(x+a,y+b);c.quadraticCurveTo(x+d,y+b,x+d,y+e);c.stroke()}c.fillStyle=light;for(let i=0;i<11;i++)ellipse(c,x+(i%2?1:-1)*(i%4)*h*.1,y-h*(.3+i*.06),h*.045,h*.06,light);c.restore()}
  shell(c,x,y,r,color){c.save();c.translate(x,y);c.rotate(-.1);c.beginPath();c.moveTo(-r*.5,r*.4);c.bezierCurveTo(-r*1.7,-r*.7,-r*.7,-r*1.4,-r*.25,-r*.8);c.bezierCurveTo(-r*.1,-r*1.45,r*.8,-r*1.3,r*.6,-r*.8);c.bezierCurveTo(r*1.7,-r*1.1,r*1.3,r*.1,r*.5,r*.4);c.closePath();c.fillStyle=color;c.fill();for(let i=-1;i<=1;i++)line(c,i*r*.14,r*.3,i*r*.5,-r*.65,'#f5e9c7',1);c.restore()}
  collectible(c,s,t){const y=s.y+Math.sin(t*2+s.phase)*3;const glow=c.createRadialGradient(s.x,y,0,s.x,y,31);glow.addColorStop(0,'#fff8cb55');glow.addColorStop(1,'#fff8cb00');ellipse(c,s.x,y,32,32,glow);star(c,s.x,y,20,'#fbf2bc',Math.sin(t+s.phase)*.12);star(c,s.x-1,y-1,14,'#f0d58b',Math.sin(t+s.phase)*.12);sparkle(c,s.x+19,s.y-17,3,'#fffad8')}
  shield(c,p,t){const y=p.y+Math.sin(t*2+p.phase)*5;const r=22;const g=c.createRadialGradient(p.x-7,y-7,1,p.x,y,r);g.addColorStop(0,'#f5ffffbb');g.addColorStop(.7,'#b9dee07a');g.addColorStop(1,'#a4ccd955');ellipse(c,p.x,y,r,r,g);c.beginPath();c.arc(p.x,y,r,0,TAU);c.strokeStyle='#f2ffffbc';c.lineWidth=1.8;c.stroke();c.fillStyle='#4b96a0';c.font='18px Georgia';c.textAlign='center';c.fillText('♡',p.x,y+6)}
  preview(c,t){c.save();c.globalAlpha=.8;this.jelly(c,838,448,26,t+1,.6);this.jelly(c,408,128,17,t+4,.45);c.restore();this.fish(c,212+Math.sin(t*.4)*10,332+Math.sin(t*.7)*9,65,t,1);ellipse(c,159,375,5,3,'#abc8ac');ellipse(c,103,344,4,4,'#f4ffde87');ellipse(c,96,319,2.5,2.5,'#f4ffde87');star(c,332,280,20,'#f4e1a3',.1);sparkle(c,321,239,7,'#ffffdf');star(c,168,191,14,'#e5d7a5',-.2);star(c,893,240,16,'#e9d8a1',.2);star(c,734,495,14,'#f2d79a',-.4);c.save();c.translate(589,534);c.rotate(.23);c.fillStyle='#e8f0d383';c.strokeStyle='#fcffe4b0';c.lineWidth=1.6;c.beginPath();c.roundRect(-15,-25,30,51,6);c.fill();c.stroke();c.fillStyle='#ced2b2';c.fillRect(-8,-37,16,13);c.fillStyle='#e3d8b3';c.fillRect(-10,-8,20,20);c.fillStyle='#b8a380';c.font='13px Georgia';c.textAlign='center';c.fillText('♡',0,8);c.restore()}
}
