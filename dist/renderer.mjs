import {W,H} from './engine.mjs?v=20261019';
const TAU=Math.PI*2;
// 可爱粉色系配色
const palettes=[['#FFE5F1','#FFC9E5','#FFB3D9'],['#FFE8F4','#FFD1E8','#FFBADE'],['#FFF0F7','#FFDAED','#FFC4E3']];
function ellipse(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=color;c.fill()}
function line(c,x,y,x2,y2,color,width=2){c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke()}
function star(c,x,y,r,color,rotation=0){c.save();c.translate(x,y);c.rotate(rotation);c.beginPath();for(let i=0;i<10;i++){let a=-Math.PI/2+i*Math.PI/5;let rr=i%2?r*.48:r;let px=Math.cos(a)*rr,py=Math.sin(a)*rr;i?c.lineTo(px,py):c.moveTo(px,py)}c.closePath();c.fillStyle=color;c.fill();c.restore()}
function sparkle(c,x,y,r,color){c.beginPath();c.moveTo(x,y-r);c.quadraticCurveTo(x+2,y-2,x+r,y);c.quadraticCurveTo(x+2,y+2,x,y+r);c.quadraticCurveTo(x-2,y+2,x-r,y);c.quadraticCurveTo(x-2,y-2,x,y-r);c.fillStyle=color;c.fill()}
function heart(c,x,y,size,color){c.save();c.translate(x,y);c.scale(size/20,size/20);c.beginPath();c.moveTo(0,6);c.bezierCurveTo(-20,-8,-10,-20,0,-12);c.bezierCurveTo(10,-20,20,-8,0,6);c.closePath();c.fillStyle=color;c.fill();c.restore()}

export class SeaRenderer{
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.width=0;this.height=0;this.facing=1;this.fishMood='happy';this.blinkTime=0;this.dogX=100;this.dogY=100;this.dogBounce=0;this.bubbles=Array.from({length:24},(_,i)=>({x:(i*137.3+37)%1000,y:(i*83.6)%650,r:2+(i%5)*1.3,speed:8+(i%4)*4}));this.resize();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas)}
  resize(){const rect=this.canvas.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,2);this.width=rect.width;this.height=rect.height;this.canvas.width=Math.round(rect.width*dpr);this.canvas.height=Math.round(rect.height*dpr);this.dpr=dpr}
  draw(game,t,particles=[],dogMessage=''){const c=this.ctx;if(!this.width||!this.height)return;c.setTransform(this.canvas.width/W,0,0,this.canvas.height/H,0,0);c.clearRect(0,0,W,H);const idle=game.state==='idle';this.background(c,t,idle?0:game.levelIndex);
    // 眨眼逻辑
    this.blinkTime-=0.016;
    if(this.blinkTime<=0)this.blinkTime=Math.random()*3+2;

    if(idle)this.preview(c,t);else{
      // GZJ小狗向导 - 跟随玩家
      if(!idle){
        this.dogX=this.dogX*0.95+game.player.x*0.05-80;
        this.dogY=this.dogY*0.95+(game.player.y-50)*0.05;
        this.drawDog(c,this.dogX,this.dogY,25,t);
        // 对话气泡
        if(dogMessage){
          this.drawDogMessage(c,this.dogX,this.dogY-60,dogMessage);
        }
      }

      if(!game.endless&&game.stars.length>1){c.beginPath();c.moveTo(game.player.x,game.player.y);game.stars.forEach(s=>c.lineTo(s.x,s.y));c.strokeStyle='#FFE5F160';c.lineWidth=2;c.setLineDash([5,11]);c.stroke();c.setLineDash([])}
      for(const s of game.stars)this.collectible(c,s,t);
      for(const p of game.pickups)this.shield(c,p,t);
      for(const item of game.items)this.drawItem(c,item,t);
      for(const h of game.hazards)this.jelly(c,h.x,h.y,h.radius*1.17,t+h.phase,1);
      const p=game.player;if(Math.abs(p.vx)>1)this.facing=p.vx>0?1:-1;
      c.save();if(p.invincible>0&&p.dashTime<=0)c.globalAlpha=.5+.5*Math.abs(Math.sin(t*18));
      if(game.shieldTime>0||p.dashTime>0){const r=p.dashTime>0?49:44;ellipse(c,p.x,p.y,r,r,p.dashTime>0?'#FFE5F14D':'#FFB3D980');c.beginPath();c.arc(p.x,p.y,r,0,TAU);c.strokeStyle=p.dashTime>0?'#FFC9E5':'#FF9ECE';c.lineWidth=2;c.stroke();sparkle(c,p.x-r*.65,p.y-r*.65,6,'#FFE5F1')}
      if(p.dashTime>0){for(let i=1;i<4;i++)line(c,p.x-this.facing*(40+i*16),p.y-13+i*10,p.x-this.facing*(65+i*22),p.y-13+i*10,'#FFD1E8C0',3)}
      // 根据游戏状态设置小鱼心情
      if(game.combo>=5)this.fishMood='happy';
      else if(p.invincible>0&&p.dashTime<=0)this.fishMood='surprised';
      else this.fishMood='happy';
      this.fish(c,p.x,p.y,35,t,this.facing);c.restore();
    }
    for(const p of particles){c.save();c.globalAlpha=Math.max(0,p.life/p.maxLife);if(p.text){c.font=`600 ${p.size||22}px "Microsoft YaHei",sans-serif`;c.textAlign='center';c.fillStyle=p.color||'#FFE5F1';c.fillText(p.text,p.x,p.y)}else{star(c,p.x,p.y,p.size||5,p.color||'#FFD1E8',p.life*3)}c.restore()}
  }

  // GZJ对话气泡
  drawDogMessage(c,x,y,message){
    c.save();
    const padding=10;
    c.font='14px "Microsoft YaHei",sans-serif';
    const width=c.measureText(message).width+padding*2;
    const height=30;

    // 气泡背景
    c.fillStyle='#FFFFFF';
    c.strokeStyle='#FF69B4';
    c.lineWidth=2;
    c.beginPath();
    c.roundRect(x-width/2,y-height,width,height,8);
    c.fill();
    c.stroke();

    // 小尾巴
    c.beginPath();
    c.moveTo(x-10,y);
    c.lineTo(x-5,y-height);
    c.lineTo(x,y);
    c.fillStyle='#FFFFFF';
    c.fill();
    c.stroke();

    // 文字
    c.fillStyle='#FF69B4';
    c.textAlign='center';
    c.fillText(message,x,y-height+20);
    c.restore();
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
  // 可爱版女生小鱼（粉色带蝴蝶结和腮红）
  fish(c,x,y,r,t,facing=1,color='#FFB3D9'){
    c.save();c.translate(x,y+Math.sin(t*2)*1.8);c.scale(facing,1);c.rotate(Math.sin(t*2)*.022);const tail=Math.sin(t*7)*r*.10;
    // 尾巴 - 粉色渐变
    c.beginPath();c.moveTo(-r*.75,0);c.quadraticCurveTo(-r*1.3,-r*.7+tail,-r*1.65,-r*.72+tail);c.quadraticCurveTo(-r*1.35,0,-r*1.6,r*.68+tail);c.quadraticCurveTo(-r*1.15,r*.5,-r*.75,0);c.fillStyle='#FF9ECE';c.fill();
    // 背鰭
    c.beginPath();c.moveTo(-r*.2,-r*.5);c.quadraticCurveTo(-r*.05,-r*1.14,r*.4,-r*.6);c.fillStyle='#FFC9E5';c.fill();
    // 身体主体 - 粉色渐变
    const grad=c.createLinearGradient(0,-r,0,r);grad.addColorStop(0,'#FFD1E8');grad.addColorStop(.6,color);grad.addColorStop(1,'#FF85C3');ellipse(c,0,0,r*1.12,r*.77,grad);
    // 肚子 - 更亮的粉色
    c.save();c.beginPath();c.ellipse(0,0,r*1.12,r*.77,0,0,TAU);c.clip();ellipse(c,r*.1,r*.55,r*.97,r*.35,'#FFF0F7');c.restore();
    // 鱼鳍
    c.beginPath();c.moveTo(-r*.25,r*.1);c.quadraticCurveTo(-r*.75,r*.6,-r*.58,-r*.1);c.quadraticCurveTo(-r*.4,-r*.2,-r*.25,r*.1);c.fillStyle='#FFBADE';c.fill();
    // 大眼睛
    ellipse(c,r*.54,-r*.16,r*.13,r*.16,'#FFFFFF');ellipse(c,r*.54,-r*.16,r*.08,r*.11,'#4A4A4A');
    // 眨眼动画
    if(Math.abs(Math.sin(t*0.3))<0.05){ellipse(c,r*.56,-r*.2,r*.028,r*.04,'#FFFFFF')}
    // 可爱腮红
    c.globalAlpha=0.6;ellipse(c,r*.66,r*.14,r*.17,r*.1,'#FF85C3');c.globalAlpha=1;
    // 嘴巴 - 根据心情变化
    c.beginPath();
    if(this.fishMood==='happy'){c.arc(r*.78,r*.04,r*.14,.22,1.65)}
    else if(this.fishMood==='surprised'){c.ellipse(r*.78,r*.1,r*.08,r*.12,0,0,TAU)}
    else{c.arc(r*.78,r*.14,r*.14,-.2,1.2)}
    c.strokeStyle='#FF6BB8';c.lineWidth=Math.max(1.5,r*.035);c.lineCap='round';c.stroke();
    // 蝴蝶结发饰
    c.save();c.translate(-r*.3,-r*.85);
    c.fillStyle='#FF1493';
    c.beginPath();c.moveTo(-r*.15,0);c.quadraticCurveTo(-r*.25,-r*.1,-r*.15,-r*.15);c.quadraticCurveTo(0,-r*.08,-r*.03,0);c.quadraticCurveTo(0,r*.08,-r*.15,r*.15);c.quadraticCurveTo(-r*.25,r*.1,-r*.15,0);c.fill();
    c.beginPath();c.moveTo(r*.15,0);c.quadraticCurveTo(r*.25,-r*.1,r*.15,-r*.15);c.quadraticCurveTo(0,-r*.08,r*.03,0);c.quadraticCurveTo(0,r*.08,r*.15,r*.15);c.quadraticCurveTo(r*.25,r*.1,r*.15,0);c.fill();
    ellipse(c,0,0,r*.08,r*.08,'#FF69B4');
    c.restore();
    c.restore();
  }

  // GZJ小狗向导（可爱柯基）
  drawDog(c,x,y,size,t){
    c.save();
    this.dogBounce=Math.sin(t*3)*3;
    c.translate(x,y+this.dogBounce);
    const s=size/25;
    c.scale(s,s);

    // 身体 - 橙棕色
    const bodyGrad=c.createLinearGradient(0,-15,0,15);
    bodyGrad.addColorStop(0,'#F4A460');
    bodyGrad.addColorStop(1,'#D2691E');
    c.beginPath();
    c.ellipse(0,0,28,18,0,0,TAU);
    c.fillStyle=bodyGrad;
    c.fill();

    // 白色肚子
    ellipse(c,0,8,22,12,'#FFFFFF');

    // 腿
    c.fillStyle='#D2691E';
    [-15,-5,5,15].forEach(px=>{
      c.beginPath();
      c.roundRect(px-3,12,6,10,3);
      c.fill();
      ellipse(c,px,22,4,3,'#8B4513');
    });

    // 头 - 更大更可爱
    const headGrad=c.createLinearGradient(0,-35,0,-15);
    headGrad.addColorStop(0,'#F4A460');
    headGrad.addColorStop(1,'#D2691E');
    ellipse(c,0,-25,20,18,headGrad);

    // 白色脸颊
    ellipse(c,-8,-24,10,8,'#FFFFFF');
    ellipse(c,8,-24,10,8,'#FFFFFF');

    // 可爱大耳朵
    c.fillStyle='#D2691E';
    c.beginPath();
    c.ellipse(-14,-35,8,12,-.3,0,TAU);
    c.fill();
    c.beginPath();
    c.ellipse(14,-35,8,12,.3,0,TAU);
    c.fill();

    // 耳朵内侧
    c.fillStyle='#FFB6C1';
    ellipse(c,-14,-35,5,8,'#FFB6C1');
    ellipse(c,14,-35,5,8,'#FFB6C1');

    // 大眼睛
    ellipse(c,-8,-26,5,6,'#FFFFFF');
    ellipse(c,8,-26,5,6,'#FFFFFF');
    ellipse(c,-7,-26,3,4,'#4A4A4A');
    ellipse(c,7,-26,3,4,'#4A4A4A');
    // 眼睛高光
    ellipse(c,-6.5,-27,1.5,2,'#FFFFFF');
    ellipse(c,7.5,-27,1.5,2,'#FFFFFF');

    // 可爱的鼻子
    heart(c,0,-19,5,'#FF69B4');

    // 嘴巴
    c.strokeStyle='#8B4513';
    c.lineWidth=1.5;
    c.lineCap='round';
    c.beginPath();
    c.moveTo(0,-19);
    c.lineTo(0,-15);
    c.stroke();
    c.beginPath();
    c.arc(-4,-13,4,0,Math.PI/2);
    c.stroke();
    c.beginPath();
    c.arc(4,-13,4,Math.PI/2,Math.PI);
    c.stroke();

    // 粉色围巾
    c.save();
    c.fillStyle='#FF69B4';
    c.strokeStyle='#FF1493';
    c.lineWidth=1;
    c.beginPath();
    c.moveTo(-22,-12);
    c.lineTo(-15,-8);
    c.lineTo(15,-8);
    c.lineTo(22,-12);
    c.lineTo(15,-16);
    c.lineTo(-15,-16);
    c.closePath();
    c.fill();
    c.stroke();
    // 围巾条纹
    for(let i=-10;i<=10;i+=5){
      line(c,i,-16,i+3,-8,'#FFB3D9',1);
    }
    c.restore();

    // 小尾巴摇摆
    c.save();
    c.translate(-25,0);
    c.rotate(Math.sin(t*5)*0.3);
    c.fillStyle='#D2691E';
    c.beginPath();
    c.ellipse(0,0,8,5,0,0,TAU);
    c.fill();
    c.restore();

    c.restore();
  }
  // 可爱版水母（淡紫粉色）
  jelly(c,x,y,r,t,alpha=1){c.save();c.translate(x,y+Math.sin(t*1.7)*3);c.globalAlpha=alpha;const colors=['#E6C9FF','#F0D9FF'];c.strokeStyle='#D4B3E58c';c.lineWidth=2.6;c.lineCap='round';for(let i=0;i<4;i++){const xx=-r*.65+i*r*.43;c.beginPath();c.moveTo(xx,r*.1);c.bezierCurveTo(xx+Math.sin(t*2+i)*9,r*.7,xx-8,r*.95,xx+Math.cos(t*2+i)*7,r*1.4);c.stroke()}const g=c.createLinearGradient(0,-r,0,r*.4);g.addColorStop(0,colors[1]);g.addColorStop(1,colors[0]);c.beginPath();c.moveTo(-r,r*.15);c.bezierCurveTo(-r,-r*1.15,r,-r*1.15,r,r*.15);for(let i=4;i>=0;i--)c.quadraticCurveTo(-r+i*r*.5-r*.25,r*.44,-r+(i-1)*r*.5,r*.15);c.closePath();c.fillStyle=g;c.fill();c.beginPath();c.ellipse(-r*.28,-r*.42,r*.28,r*.13,-.5,0,TAU);c.fillStyle='#FFF0F777';c.fill();ellipse(c,-r*.3,-r*.05,1.7,2,'#B88BC8');ellipse(c,r*.3,-r*.05,1.7,2,'#B88BC8');c.restore()}
  kelp(c,x,y,h,color,t,leaves){c.save();c.strokeStyle=color;c.fillStyle=color;c.lineCap='round';const bend=Math.sin(t*.7+x)*10;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x-8,y-h*.5,x+bend,y-h);c.lineWidth=3;c.stroke();for(let i=1;i<=leaves;i++){const yy=y-h*i/(leaves+1);const side=i%2?1:-1;const len=(14+15*Math.sin(i/(leaves+1)*Math.PI));const xx=x+bend*i/(leaves+1);c.beginPath();c.moveTo(xx,yy);c.quadraticCurveTo(xx+side*len*1.1,yy+1,xx+side*len*.8,yy-25);c.quadraticCurveTo(xx+side*3,yy-22,xx,yy);c.fill()}c.restore()}
  coral(c,x,y,h,t,color,light){c.save();c.strokeStyle=color;c.lineWidth=h*.085;c.lineCap='round';const branches=[[0,0,3,-h],[-1,-h*.35,-h*.32,-h*.61],[2,-h*.55,h*.28,-h*.87],[-h*.31,-h*.6,-h*.38,-h*.84],[h*.22,-h*.8,h*.4,-h*.98],[0,-h*.2,h*.34,-h*.43],[h*.31,-h*.43,h*.41,-h*.67]];for(const [a,b,d,e]of branches){c.beginPath();c.moveTo(x+a,y+b);c.quadraticCurveTo(x+d,y+b,x+d,y+e);c.stroke()}c.fillStyle=light;for(let i=0;i<11;i++)ellipse(c,x+(i%2?1:-1)*(i%4)*h*.1,y-h*(.3+i*.06),h*.045,h*.06,light);c.restore()}
  shell(c,x,y,r,color){c.save();c.translate(x,y);c.rotate(-.1);c.beginPath();c.moveTo(-r*.5,r*.4);c.bezierCurveTo(-r*1.7,-r*.7,-r*.7,-r*1.4,-r*.25,-r*.8);c.bezierCurveTo(-r*.1,-r*1.45,r*.8,-r*1.3,r*.6,-r*.8);c.bezierCurveTo(r*1.7,-r*1.1,r*1.3,r*.1,r*.5,r*.4);c.closePath();c.fillStyle=color;c.fill();for(let i=-1;i<=1;i++)line(c,i*r*.14,r*.3,i*r*.5,-r*.65,'#f5e9c7',1);c.restore()}
  collectible(c,s,t){const y=s.y+Math.sin(t*2+s.phase)*3;const glow=c.createRadialGradient(s.x,y,0,s.x,y,31);glow.addColorStop(0,'#FFF4A370');glow.addColorStop(1,'#FFF4A300');ellipse(c,s.x,y,32,32,glow);star(c,s.x,y,20,'#FFF4A3',Math.sin(t+s.phase)*.12);star(c,s.x-1,y-1,14,'#FFE066',Math.sin(t+s.phase)*.12);sparkle(c,s.x+19,s.y-17,3,'#FFFACC')}
  shield(c,p,t){const y=p.y+Math.sin(t*2+p.phase)*5;const r=22;const g=c.createRadialGradient(p.x-7,y-7,1,p.x,y,r);g.addColorStop(0,'#FFE5F1CC');g.addColorStop(.7,'#FFB3D990');g.addColorStop(1,'#FF9ECE70');ellipse(c,p.x,y,r,r,g);c.beginPath();c.arc(p.x,y,r,0,TAU);c.strokeStyle='#FFC9E5CC';c.lineWidth=1.8;c.stroke();c.fillStyle='#FF69B4';c.font='18px Georgia';c.textAlign='center';c.fillText('♡',p.x,y+6)}
  preview(c,t){c.save();c.globalAlpha=.8;this.jelly(c,838,448,26,t+1,.6);this.jelly(c,408,128,17,t+4,.45);c.restore();this.fish(c,212+Math.sin(t*.4)*10,332+Math.sin(t*.7)*9,65,t,1);this.drawDog(c,350,450,30,t);ellipse(c,159,375,5,3,'#FFB3D9');ellipse(c,103,344,4,4,'#FFE5F187');ellipse(c,96,319,2.5,2.5,'#FFE5F187');star(c,332,280,20,'#FFF4A3',.1);sparkle(c,321,239,7,'#FFFACC');star(c,168,191,14,'#FFE066',-.2);star(c,893,240,16,'#FFF4A3',.2);star(c,734,495,14,'#FFE066',-.4);c.save();c.translate(589,534);c.rotate(.23);c.fillStyle='#FFE5F183';c.strokeStyle='#FFC9E5B0';c.lineWidth=1.6;c.beginPath();c.roundRect(-15,-25,30,51,6);c.fill();c.stroke();c.fillStyle='#FF9ECE';c.fillRect(-8,-37,16,13);c.fillStyle='#FFD1E8';c.fillRect(-10,-8,20,20);c.fillStyle='#FF69B4';c.font='13px Georgia';c.textAlign='center';c.fillText('♡',0,8);c.restore()}

  // 绘制道具
  drawItem(c,item,t){
    const y=item.y+Math.sin(t*2+item.phase)*4;
    const r=18;
    // 发光效果
    const glow=c.createRadialGradient(item.x,y,0,item.x,y,r+8);
    const colors={
      candy:'#FFA3D7',
      heart:'#FF6B9D',
      clover:'#90EE90',
      clock:'#87CEEB',
      chest:'#FFD700'
    };
    const color=colors[item.type]||'#FFB3D9';
    glow.addColorStop(0,color+'60');
    glow.addColorStop(1,color+'00');
    ellipse(c,item.x,y,r+8,r+8,glow);

    // 道具主体
    c.save();
    c.translate(item.x,y);
    c.rotate(Math.sin(t*2+item.phase)*0.1);

    switch(item.type){
      case 'candy':
        // 彩虹糖
        c.fillStyle=color;
        c.beginPath();
        c.arc(0,0,r,0,TAU);
        c.fill();
        c.strokeStyle='#FF69B4';
        c.lineWidth=2;
        c.stroke();
        // 螺旋纹
        for(let i=0;i<3;i++){
          c.strokeStyle='#FFFFFF60';
          c.lineWidth=2;
          c.beginPath();
          c.arc(0,0,r-4-i*3,0,Math.PI*1.5);
          c.stroke();
        }
        break;

      case 'heart':
        // 爱心能量饮料
        heart(c,0,-3,r*1.2,color);
        c.strokeStyle='#FF1493';
        c.lineWidth=2;
        c.stroke();
        sparkle(c,r*.4,-r*.6,4,'#FFFFFF');
        break;

      case 'clover':
        // 四叶草
        c.fillStyle=color;
        [-1,1].forEach(sx=>[-1,1].forEach(sy=>{
          c.save();
          c.scale(sx,sy);
          c.beginPath();
          c.ellipse(r*.4,r*.4,r*.5,r*.4,0,0,TAU);
          c.fill();
          c.restore();
        }));
        // 茎
        c.fillStyle='#228B22';
        c.fillRect(-2,r*.6,4,r*.6);
        // 高光
        c.fillStyle='#FFFFFF40';
        [-1,1].forEach(sx=>[-1,1].forEach(sy=>{
          ellipse(c,sx*r*.35,sy*r*.35,r*.15,r*.12,'#FFFFFF60');
        }));
        break;

      case 'clock':
        // 时钟
        c.fillStyle=color;
        c.beginPath();
        c.arc(0,0,r,0,TAU);
        c.fill();
        c.strokeStyle='#4682B4';
        c.lineWidth=2;
        c.stroke();
        // 表盘刻度
        for(let i=0;i<12;i++){
          const a=i*Math.PI/6-Math.PI/2;
          const r1=r*.7,r2=r*.85;
          line(c,Math.cos(a)*r1,Math.sin(a)*r1,Math.cos(a)*r2,Math.sin(a)*r2,'#4682B4',2);
        }
        // 时针分针
        const angle=t*2;
        line(c,0,0,Math.cos(angle)*r*.5,Math.sin(angle)*r*.5,'#1E90FF',3);
        line(c,0,0,Math.cos(angle*12)*r*.7,Math.sin(angle*12)*r*.7,'#1E90FF',2);
        ellipse(c,0,0,3,3,'#1E90FF');
        break;

      case 'chest':
        // 宝箱
        c.fillStyle=color;
        c.fillRect(-r*.8,-r*.7,r*1.6,r*1.4);
        c.strokeStyle='#DAA520';
        c.lineWidth=2;
        c.strokeRect(-r*.8,-r*.7,r*1.6,r*1.4);
        // 盖子
        c.fillStyle='#FFA500';
        c.beginPath();
        c.moveTo(-r*.8,-r*.7);
        c.lineTo(-r*.8,-r*1.2);
        c.quadraticCurveTo(0,-r*1.5,r*.8,-r*1.2);
        c.lineTo(r*.8,-r*.7);
        c.closePath();
        c.fill();
        c.stroke();
        // 锁
        c.fillStyle='#8B4513';
        c.fillRect(-r*.2,-r*.4,r*.4,r*.5);
        ellipse(c,0,-r*.5,r*.15,r*.15,'#DAA520');
        // 星星装饰
        star(c,0,-r,5,'#FFFFFF',.2);
        break;
    }
    c.restore();
  }
}
