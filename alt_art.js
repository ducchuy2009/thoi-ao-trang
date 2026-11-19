/* Thời Áo Trắng — ALT ART / thử nghiệm độc lập.
 * Dựa trên kích thước sprite của src/02_art.js và src/02b_art2.js.
 * KHÔNG được import vào src/*.js hoặc index.html của game chính.
 * Dùng từ alt_art.html: buildSprites(); const art = buildAltArt();
 */
'use strict';
function buildAltArt() {
  const original = { ...SPR }, oldGround = { ...GROUND };
  const C = {
    ink:'#30293b', edge:'#514052', mortar:'#ad7562', cream:'#ffe5ad',
    wall:'#f3d69e', wallHi:'#fff0bf', wallSh:'#cba97c',
    red:'#ba5943', redHi:'#e88d65', redSh:'#873f3f',
    blue:'#506f92', blueHi:'#8eaec7', blueSh:'#344f70',
    green:'#52875b', greenHi:'#83b66a', greenSh:'#3d684b',
    window:'#83b6cb', glass:'#c0e5e8', wood:'#956542', gold:'#f4cb69',
    path:'#dfb38e', water:'#70b8c0'
  };
  const rr = (x,c,a,b,w,h) => R(x,c,Math.round(a),Math.round(b),w,h);
  const dot = (x,c,a,b) => R(x,c,a,b,1,1);
  const label = (x,s,a,b,w,color) => {
    x.font='bold 6px monospace'; x.textAlign='center'; x.textBaseline='middle';
    x.fillStyle=color || '#fff8df'; x.fillText(s,a+w/2,b+4,w-4);
  };
  function brick(x,a,b,w,h,c) {
    rr(x,c,a,b,w,h);
    for(let y=b+5,j=0;y<b+h;y+=6,j++) {
      rr(x,C.mortar,a,y,w,1);
      for(let i=a+(j%2?4:9);i<a+w;i+=13) rr(x,C.mortar,i,y-5,1,5);
    }
  }
  function roof(x,a,b,w,h,base,light) {
    const dark=shade(base,-26), hi=light||shade(base,22);
    rr(x,C.ink,a,b+3,w,h-3);
    rr(x,dark,a+2,b+2,w-4,h-3);
    // Pixel-art 3/4 roof plane with highlighted ridgeline and individual tiles
    for(let y=b+3;y<b+h-4;y++){
      const inset=Math.round((h-4-(y-b))*0.12);
      rr(x,base,a+2+inset,y,w-4-2*inset,1);
    }
    rr(x,hi,a+8,b+3,w-16,2);
    rr(x,dark,a,b+h-4,w,4);
    rr(x,hi,a+3,b+h-5,w-6,1);
    for(let y=b+9,k=0;y<b+h-5;y+=7,k++){
      rr(x,dark,a+4,y,w-8,1);
      for(let i=a+5+(k%2)*5;i<a+w-6;i+=11) {
        rr(x,shade(base,-15),i,y-5,1,5);
        dot(x,hi,i+3,y-4);
      }
    }
  }
  function wall(x,a,b,w,h,col) {
    rr(x,C.ink,a,b,w,h); rr(x,col,a+2,b+2,w-4,h-4);
    rr(x,shade(col,13),a+3,b+3,w-6,2);
    rr(x,shade(col,-18),a+2,b+h-8,w-4,6);
    rr(x,C.wallSh,a+2,b+h-2,w-4,2);
  }
  function win(x,a,b,w,h,shutter) {
    rr(x,C.ink,a-1,b-1,w+2,h+3);
    rr(x,C.wood,a,b,w,h+1);
    rr(x,C.window,a+2,b+2,w-4,h-4);
    rr(x,C.glass,a+3,b+3,w-6,3);
    rr(x,C.blueSh,a+Math.floor(w/2),b+2,1,h-4);
    rr(x,C.blueSh,a+2,b+Math.floor(h/2),w-4,1);
    rr(x,C.wallHi,a,b+h+1,w,2);
    rr(x,'#e9f6eb',a+3,b+3,2,5);
    if(shutter) {
      for(const d of [-5,w]) {
        rr(x,shutter,a+d,b,4,h);
        for(let j=3;j<h-1;j+=5) rr(x,shade(shutter,-28),a+d+1,b+j,2,1);
      }
    }
  }
  function door(x,a,b,w,h,col) {
    rr(x,C.ink,a-2,b-2,w+4,h+2);
    rr(x,shade(col,-25),a,b,w,h);
    rr(x,col,a+2,b+2,w-4,h-4);
    rr(x,shade(col,17),a+3,b+3,w-6,2);
    rr(x,shade(col,-17),a+3,b+8,w-6,h-12);
    dot(x,C.gold,a+w-5,b+Math.floor(h/2));
    rr(x,'#d8baa0',a-3,b+h-2,w+6,2);
  }
  function banner(x,a,b,w,h,base,txt,txtcol) {
    rr(x,C.ink,a-2,b-1,w+4,h+3);
    rr(x,shade(base,-24),a,b,w,h);
    rr(x,base,a+1,b+1,w-2,h-2);
    rr(x,shade(base,24),a+2,b+1,w-4,2);
    if(txt) label(x,txt,a,b,w,txtcol);
  }
  function pots(x,a,b) {
    for(let k=0;k<2;k++){
      let xx=a+k*14;
      rr(x,C.redSh,xx+2,b+7,9,9); rr(x,C.redHi,xx+1,b+6,11,3);
      ell(x,C.greenSh,xx+6,b+5,6,5);
      ell(x,C.greenHi,xx+4,b+3,3,3);
      dot(x,k?'#ff9bb7':'#f7cb68',xx+6,b+2);
    }
  }
  function awning(x,a,b,w,col1,col2) {
    rr(x,C.ink,a-1,b-1,w+2,13);
    for(let i=0;i<w;i+=8){
      rr(x,(i/8)%2?col1:col2,a+i,b,Math.min(8,w-i),11);
      rr(x,shade((i/8)%2?col1:col2,-20),a+i,b+9,Math.min(8,w-i),2);
    }
    rr(x,C.ink,a,b+11,w,1);
  }
  function simpleHouse(name,wallColor,roofColor,doorColor,shutters) {
    def(name,96,80,x=>{
      wall(x,4,26,88,54,wallColor);
      roof(x,0,1,96,29,roofColor);
      rr(x,C.wallHi,7,29,81,2);
      rr(x,C.wood,6,29,2,49); rr(x,C.wood,88,29,2,49);
      win(x,14,39,17,17,shutters);
      win(x,65,39,17,17,shutters);
      door(x,40,52,17,27,doorColor);
      rr(x,C.wallHi,35,77,27,3);
      rr(x,C.greenSh,12,62,21,3); rr(x,C.greenSh,64,62,21,3);
      for(let i=0;i<9;i++) {
        dot(x,i%2?'#ec8da9':'#f9cd6b',13+(i%5)*4,60+Math.floor(i/5));
        dot(x,C.greenHi,66+(i%5)*4,60+Math.floor(i/5));
      }
      // old-style Vietnamese house number tile
      rr(x,C.wallHi,57,62,7,6); rr(x,C.blue,58,63,5,3);
      rr(x,C.redSh,2,76,92,4);
    });
  }
  simpleHouse('house','#f5d7a0','#ae5b47','#7b624c','#668f70');
  simpleHouse('houseB','#e8d6bf','#6b8398','#79513e','#b67673');
  simpleHouse('houseC','#eecbb7','#967453','#795b46','#738e73');
  simpleHouse('houseD','#e4cee1','#7d6792','#755a50','#84a9bd');
  simpleHouse('houseE','#f0cfcc','#c37863','#92604b','#7a9d77');

  def('shop',96,76,x=>{
    wall(x,2,8,92,68,'#f0d5a6');
    roof(x,0,0,96,13,'#8a7973');
    banner(x,8,13,80,12,'#f6cb63','TAP HOA CO BA',C.ink);
    awning(x,0,26,96,'#4d7999','#fff0dd');
    rr(x,C.ink,6,40,85,31); rr(x,'#594f44',8,42,81,27);
    for(let j=0;j<3;j++){
      rr(x,'#f4dbac',10,45+j*8,75,1);
      for(let i=0;i<13;i++) {
        const cols=['#db8066','#f4bd57','#83af80','#8da8b5','#e1a4ac'];
        rr(x,cols[(i+j*2)%cols.length],12+i*5,43+j*8,4,6);
        dot(x,'#ffebcb',13+i*5,44+j*8);
      }
    }
    rr(x,C.wood,38,40,3,31); rr(x,C.wallHi,2,71,92,5);
    rr(x,C.redSh,1,62,18,10); rr(x,C.redHi,3,61,14,3);
    for(let i=0;i<6;i++) ell(x,i%2?C.greenHi:'#eabc67',5+i*2,62,2,2);
    rr(x,C.blue,78,55,12,18); rr(x,C.glass,80,57,8,11);
  });
  def('center',96,76,x=>{
    wall(x,2,15,92,61,'#f2ddbd');
    roof(x,0,0,96,18,C.blue);
    banner(x,9,19,78,12,C.cream,'HOC THEM',C.blueSh);
    for(let i=0;i<3;i++) win(x,11+i*27,36,17,15);
    door(x,38,53,21,23,C.greenSh);
    rr(x,C.wallHi,2,74,92,2);
    pots(x,4,59); pots(x,74,59);
  });
  def('school',320,100,x=>{
    wall(x,2,19,316,81,'#edd6a0');
    roof(x,0,2,320,21,C.red);
    // school corridor across two levels
    rr(x,'#fff0cf',3,55,314,4);
    rr(x,C.wallSh,2,58,316,2);
    for(let i=0;i<10;i++) {
      const a=13+i*31;
      if(i>2 && i<7) continue;
      win(x,a,29,17,19,C.green);
      if(i===1||i===8) door(x,a+1,68,16,27,C.greenSh);
      else win(x,a,67,17,20,C.green);
      rr(x,C.wallHi,a+22,59,3,36);
    }
    wall(x,111,13,98,87,'#f5dda9');
    roof(x,105,0,110,14,C.red);
    banner(x,120,19,80,15,C.blue,'THPT HOA PHUONG','#fff6d8');
    rr(x,C.wallHi,119,35,82,3);
    // Vietnamese red flag in central window
    rr(x,'#c43f39',153,40,14,11); rr(x,C.gold,159,42,3,4);
    rr(x,C.ink,139,59,42,41);
    door(x,143,61,16,39,C.wood);
    door(x,160,61,16,39,C.wood);
    rr(x,C.wallHi,135,96,50,4);
  });
  def('gate',128,46,x=>{
    for(const a of [1,112]){
      rr(x,C.ink,a,7,15,39); rr(x,C.wall,a+2,10,11,34);
      rr(x,C.redSh,a-1,5,17,5); rr(x,C.redHi,a,5,15,2);
      rr(x,C.wallHi,a+2,11,3,29);
    }
    banner(x,12,0,104,14,C.blue,'TRUONG THPT HOA PHUONG');
    for(let i=0;i<7;i++) {
      rr(x,C.greenSh,16+i*4,21,2,23);
      rr(x,C.greenSh,82+i*4,21,2,23);
    }
    rr(x,C.greenHi,16,25,29,2); rr(x,C.greenHi,82,25,29,2);
    rr(x,C.gold,2,44,124,2);
  });
  def('canteen',76,54,x=>{
    wall(x,2,8,72,46,'#f2d2a3');
    roof(x,0,0,76,13,C.red);
    banner(x,13,11,50,9,C.cream,'CAN TIN',C.ink);
    awning(x,0,22,76,'#f3e3c8',C.green);
    rr(x,C.ink,7,35,62,16); rr(x,'#75584a',9,37,58,11);
    for(let i=0;i<4;i++) { rr(x,'#deb16f',13+i*13,40,8,3); rr(x,'#f8d8a5',14+i*13,39,6,1); }
    rr(x,C.wood,1,45,74,9); rr(x,C.redSh,0,51,76,3);
    rr(x,C.wallHi,9,33,58,2);
  });
  def('bikeshed',96,42,x=>{
    roof(x,0,0,96,16,C.blue);
    for(const a of [3,47,92]) rr(x,C.wood,a,14,3,28);
    rr(x,C.wallSh,0,36,96,6);
    for(let i=0;i<5;i++){
      let xx=8+i*18;
      for(const k of [0,12]) {
        ell(x,C.ink,xx+k,33,5,5); ell(x,C.wallHi,xx+k,33,3,3);
      }
      line(x,i%2?C.red:C.blue,xx,33,xx+5,25);
      line(x,i%2?C.red:C.blue,xx+5,25,xx+12,33);
    }
    banner(x,35,12,28,9,C.cream,'NHA XE',C.blueSh);
  });
  def('booth',30,40,x=>{
    wall(x,2,11,26,29,C.wall);
    roof(x,0,0,30,13,C.blue);
    win(x,5,17,11,12);
    door(x,19,20,8,20,C.greenSh);
  });
  def('libhouse',120,84,x=>{
    wall(x,4,22,112,62,'#f1dab4');
    roof(x,0,0,120,27,C.red);
    banner(x,35,27,50,12,C.cream,'THU VIEN',C.blueSh);
    for(const a of [12,90]) {
      win(x,a,42,19,20);
      for(let j=0;j<3;j++) rr(x,C.wood,a+5,48+j*4,9,1);
    }
    door(x,47,48,27,35,C.wood);
    rr(x,C.wallHi,41,81,39,3);
    pots(x,5,64); pots(x,94,64);
  });
  def('mall',176,104,x=>{
    wall(x,2,22,172,82,'#e4d8ca');
    roof(x,0,4,176,22,C.blue);
    banner(x,22,26,132,15,C.red,'HOA PHUONG PLAZA');
    for(let i=0;i<7;i++) {
      if(i===3) continue;
      win(x,8+i*24,46,18,25);
    }
    door(x,68,66,40,38,C.blueSh);
    rr(x,C.wallHi,62,99,52,5);
    pots(x,42,85); pots(x,117,85);
  });
  def('teashop',80,76,x=>{
    wall(x,2,18,76,58,'#f3d4cc');
    roof(x,0,0,80,22,C.blue);
    banner(x,8,23,64,11,'#f7c3d1','TRA SUA MAY',C.ink);
    awning(x,0,36,80,'#f0cfdf','#fff3e1');
    win(x,7,50,33,19);
    door(x,50,49,19,27,C.wood);
    rr(x,C.red,4,68,40,6);
  });
  def('arcade',96,76,x=>{
    wall(x,2,13,92,63,'#4d4664');
    roof(x,0,0,96,17,C.blueSh);
    banner(x,8,17,80,13,'#a45b9b','GAME ARCADE','#fff0d7');
    rr(x,C.ink,7,35,52,36); rr(x,'#322a47',9,37,48,32);
    for(let i=0;i<3;i++){
      rr(x,['#e7aeca','#86c8d2','#f6d481'][i],13+i*14,47,10,10);
      rr(x,'#fff0dc',14+i*14,49,3,2);
    }
    door(x,64,40,25,36,C.blueSh);
    for(let i=0;i<8;i++) dot(x,i%2?'#f7d06d':'#e78fb2',5+i*12,33);
  });
  def('station',128,84,x=>{
    wall(x,2,21,124,63,'#f0d5aa');
    roof(x,0,1,128,24,C.red);
    banner(x,27,26,74,13,C.blue,'GA HOA PHUONG');
    for(const a of [9,99]) win(x,a,45,20,18);
    door(x,49,45,30,38,C.wood);
    rr(x,C.wallHi,43,81,42,3);
  });
  def('wcblock',72,58,x=>{
    wall(x,2,13,68,45,'#e9ddd1');
    roof(x,0,0,72,16,C.blue);
    banner(x,10,15,52,10,C.cream,'VE SINH',C.blueSh);
    door(x,7,31,21,27,C.blue);
    door(x,44,31,21,27,'#bf829e');
    rr(x,'#d9ecf0',15,27,8,3); rr(x,'#f8d4e0',52,27,8,3);
  });
  def('busshelter',44,36,x=>{
    roof(x,0,0,44,10,C.blue);
    for(const a of [4,38]) rr(x,C.wood,a,9,3,27);
    rr(x,C.glass,8,12,29,14);
    rr(x,C.wallHi,7,26,30,3);
    rr(x,C.wood,10,27,24,3);
    for(const a of [12,30]) rr(x,C.wood,a,30,2,6);
    banner(x,8,11,27,8,C.blue,'BUS');
  });
  def('pagoda',176,112,x=>{
    wall(x,9,58,158,45,'#efc99a');
    roof(x,12,18,152,26,C.redSh);
    roof(x,0,43,176,23,C.red);
    roof(x,35,0,106,26,C.redSh);
    rr(x,C.gold,28,59,120,2);
    for(const a of [18,46,124,152]) { rr(x,C.redSh,a,61,8,42); rr(x,C.redHi,a+1,62,2,38); }
    door(x,74,72,28,31,C.wood);
    for(const a of [32,117]) win(x,a,74,19,21);
    banner(x,60,65,56,11,C.redSh,'CHUA HOA PHUONG',C.gold);
    for(const a of [15,161]) {
      ell(x,C.red,a,70,4,5); rr(x,C.gold,a-2,75,4,2);
    }
    rr(x,'#d0b9a0',4,104,168,8);
  });
  def('congty',152,82,x=>{
    wall(x,2,20,148,62,'#ced1c9');
    roof(x,0,0,152,23,C.blue);
    banner(x,22,24,108,13,C.blueSh,'CONG TY SEN VANG');
    for(let j=0;j<2;j++) for(let i=0;i<7;i++){
      if(j===1 && (i===3)) continue;
      win(x,7+i*20,42+j*18,13,13);
    }
    door(x,62,60,28,22,C.wood);
  });
  def('nhamayB',200,92,x=>{
    wall(x,1,27,198,65,'#e6d1af');
    roof(x,0,8,200,24,C.blueSh);
    rr(x,C.wallSh,151,0,15,27); rr(x,C.red,151,4,15,3);
    banner(x,28,33,145,13,'#efac67','BANH KEO HOA PHUONG',C.ink);
    for(let i=0;i<6;i++) win(x,12+i*29,50,18,14);
    door(x,78,67,44,25,C.blueSh);
    rr(x,C.wallHi,2,89,196,3);
  });
  def('nhahangB',110,82,x=>{
    wall(x,2,20,106,62,'#f1d2a2');
    roof(x,0,0,110,24,C.red);
    banner(x,15,25,80,13,C.redSh,'SEN HONG',C.gold);
    awning(x,6,40,98,'#fff0dd',C.redHi);
    for(const a of [12,77]) win(x,a,53,20,16);
    door(x,43,54,24,28,C.wood);
    pots(x,1,64); pots(x,94,64);
  });
  def('karaokeB',100,82,x=>{
    wall(x,2,19,96,63,'#514862');
    roof(x,0,0,100,23,C.blueSh);
    banner(x,9,24,82,14,'#994b83','KARAOKE','#fff1c4');
    for(const a of [9,70]) win(x,a,43,20,18);
    door(x,37,54,26,28,C.blue);
    for(let i=0;i<11;i++) dot(x,i%2?'#e6a4c2':'#86c4d8',9+i*8,41);
  });
  // Trees: stacked clusters, dark pixel contours, red/orange flamboyant flowers.
  function altTree(name,base,flower) {
    def(name,34,46,x=>{
      rr(x,C.wood,14,23,6,21); rr(x,shade(C.wood,-23),18,24,2,20);
      line(x,C.wood,16,34,7,23); line(x,C.wood,17,30,27,20);
      for(const [a,b,rx,ry] of [[9,20,9,11],[25,20,8,10],[18,10,13,9],[17,24,16,10]]) {
        ell(x,shade(base,-32),a,b+2,rx+1,ry+1);
        ell(x,base,a,b,rx,ry);
        ell(x,shade(base,27),a-3,b-3,Math.max(2,rx-4),Math.max(2,ry-4));
      }
      const r=rng(name.length*177);
      for(let i=0;i<(flower?43:13);i++){
        const a=2+(r()*30|0),b=3+(r()*29|0);
        if(flower){ rr(x,i%3?'#dc644c':flower,a,b,2,2); dot(x,'#ffd28f',a,b); }
        else dot(x,i%2?C.greenHi:'#b6d978',a,b);
      }
    });
  }
  altTree('tree','#568d52',null); altTree('tree2','#477d57',null);
  altTree('treeRed','#528252','#d94d3f');
  altTree('treePink','#648b62','#ee94aa');
  altTree('treeOrange','#62905b','#e69b50');
  def('bush',20,13,x=>{
    ell(x,C.greenSh,10,9,9,5);ell(x,C.green,10,7,9,6);ell(x,C.greenHi,6,4,4,3);
    for(const a of [3,7,13,17]) dot(x,a%2?'#f3be63':'#eb94ae',a,5);
  });
  def('hedge',16,14,x=>{
    rr(x,C.greenSh,0,5,16,9);rr(x,C.green,1,3,14,9);
    for(let i=0;i<5;i++){rr(x,C.greenHi,(i*7)%15,2+(i%3),4,2);}
    rr(x,C.greenSh,0,12,16,2);
  });
  def('wallseg',16,20,x=>{
    brick(x,0,3,16,17,C.wall);
    rr(x,C.redSh,0,0,16,4);rr(x,C.redHi,0,0,16,1);
    rr(x,C.wallSh,0,18,16,2);
  });
  def('fence',16,14,x=>{
    for(const a of [1,7,13]) {rr(x,C.wallHi,a,1,3,13);rr(x,C.wallSh,a+2,1,1,13);}
    rr(x,C.wallHi,0,4,16,2);rr(x,C.wallHi,0,9,16,2);
    rr(x,C.wallSh,0,12,16,2);
  });
  def('bench',28,14,x=>{
    rr(x,C.wood,0,1,28,4);rr(x,'#d69c6b',1,1,26,1);
    rr(x,C.wood,0,7,28,4);rr(x,'#d69c6b',1,7,26,1);
    for(const a of [3,23]) rr(x,C.ink,a,9,2,5);
  });
  def('benchstone',28,13,x=>{
    rr(x,'#b9a89b',0,3,28,6);rr(x,'#e8d5bc',1,1,26,4);
    for(const a of [2,21]) rr(x,'#a49488',a,9,5,4);
  });
  def('lamp',10,42,x=>{
    rr(x,C.ink,4,10,3,32);rr(x,'#74685c',5,10,1,28);
    rr(x,C.ink,1,4,9,6);rr(x,C.gold,2,6,7,3);
    rr(x,C.blueSh,2,2,7,3);rr(x,C.blueHi,3,2,5,1);
  });
  def('signpost',26,28,x=>{
    rr(x,C.wood,12,8,3,20);banner(x,0,1,26,10,C.greenSh,'->');
  });
  SPR.signpostL=flipH(SPR.signpost);
  // Re-color ground tiles while preserving 16x16 geometry and kind names.
  GROUND.grass=(x,px,py,tx,ty)=>{
    rr(x,'#84a86a',px,py,16,16);
    const r=rng(tx*2801+ty*1997+11);
    for(let i=0;i<5;i++){let a=px+(r()*15|0),b=py+(r()*15|0);rr(x,i%2?'#72975a':'#9fba76',a,b,2,1);}
    if(r()<.22) dot(x,'#e9c886',px+5,py+10);
  };
  GROUND.flowers=(x,px,py,tx,ty)=>{
    GROUND.grass(x,px,py,tx,ty);
    const r=rng(tx*113+ty*911+5);
    for(let i=0;i<3;i++){let a=px+2+(r()*10|0),b=py+2+(r()*10|0);rr(x,i%2?'#ef9eaf':'#fff0c6',a,b,3,2);dot(x,'#f0b74e',a+1,b);}
  };
  GROUND.road=(x,px,py,tx,ty)=>{
    rr(x,'#747275',px,py,16,16);const r=rng(tx*119+ty*289);
    for(let i=0;i<4;i++) dot(x,r()<.5?'#898585':'#62686e',px+(r()*16|0),py+(r()*16|0));
  };
  GROUND.walk=(x,px,py,tx,ty)=>{
    rr(x,'#d0a58b',px,py,16,16);
    for(let i=0;i<2;i++){rr(x,'#b88372',px,py+7+i*8,16,1);rr(x,'#e6c0a1',px,py+i*8,16,1);}
    rr(x,'#b88372',px+((tx+ty)%2?5:12),py,1,7);
    rr(x,'#b88372',px+((tx+ty)%2?12:5),py+8,1,7);
  };
  GROUND.yard=(x,px,py,tx,ty)=>{
    rr(x,'#e5c9a0',px,py,16,16);rr(x,'#cbb08d',px,py+15,16,1);
    rr(x,'#f7dfbb',px,py,16,1);rr(x,'#cbb08d',px+15,py,1,16);
    if((tx+ty)%3===0)rr(x,'#ebd3aa',px+4,py+6,5,1);
  };
  GROUND.dirt=(x,px,py,tx,ty)=>{
    rr(x,'#bc986b',px,py,16,16);const r=rng(tx*551+ty*541);
    for(let i=0;i<7;i++)rr(x,i%2?'#d9b58b':'#a9885b',px+(r()*15|0),py+(r()*15|0),2,1);
  };
  GROUND.court=(x,px,py,tx,ty)=>{
    rr(x,'#6c9d82',px,py,16,16);
    for(let i=0;i<4;i++)rr(x,i%2?'#6a9880':'#8daf8e',px+((tx*5+i*3)%16),py+((ty*7+i*4)%16),2,1);
  };
  GROUND.water=(x,px,py,tx,ty)=>{
    rr(x,'#70b0bd',px,py,16,16);
    rr(x,'#95d0cf',px+2+(tx%3),py+5,8,1);
    rr(x,'#4a94a8',px+8,py+11,5,1);
  };
  GROUND.grass2=(x,px,py,tx,ty)=>GROUND.grass(x,px,py,tx,ty);
  GROUND.flowers2=(x,px,py,tx,ty)=>GROUND.flowers(x,px,py,tx,ty);
  GROUND.sand=(x,px,py,tx,ty)=>{rr(x,'#f2d6a2',px,py,16,16);dot(x,'#cfb282',px+3,py+6);dot(x,'#fff1c2',px+11,py+11);};
  GROUND.plank=(x,px,py)=>{rr(x,'#b88864',px,py,16,16);for(let k=0;k<4;k++)rr(x,k%2?'#926949':'#d6ab78',px,py+4*k,16,1);};
  return { original, oldGround, alternative:{...SPR}, ground:{...GROUND}, palette:C };
}
