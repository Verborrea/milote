var fact_esc = 0;  //para el canvas
var x_min, y_min;

var can2;
var ctx2;
var canvas_height = 400;
var canvas_width = 400;

var container;

var camera, controls, scene, renderer;
var light;
var CircleMirror;

var a_c, a_l, a_r;
var met_to_px = 1;
var pisos = 3;
var pisos2 = 1;

let mat_b, mat_p1, mat_p2;
let georet, geolib, geocons, geoesca;

let prisms = [];
let escale = [];
let ret_forma = 0;
let lib_forma = 0;
var pisos_prev;

var p_esc = [];
var escalera = 0;

PrismGeometry = function ( vertices, height ) {

	var Shape = new THREE.Shape();

	( function f( ctx ){

    ctx.moveTo( vertices[0].x, vertices[0].y );
    for (var i=1; i < vertices.length; i++){
      ctx.lineTo( vertices[i].x, vertices[i].y );
    }
    ctx.lineTo( vertices[0].x, vertices[0].y );

	} )( Shape );
	
  THREE.ExtrudeGeometry.call( this, Shape, {depth: height, bevelEnabled: false});
};

function init_3d() {
    // camera
    camera = new THREE.PerspectiveCamera( 40, 1, 1, 10000 );
    camera.position.set(400,400,400);

    scene = new THREE.Scene();

    // lights

    light = new THREE.DirectionalLight( 0xebebeb, 1 / 2 );
    light.position.set( 0, 300, 500 );
    scene.add( light );
    
    light = new THREE.DirectionalLight( 0xebebeb, 1 / 2 );
    light.position.set( 0, -300, 500 );
    scene.add( light );				

    // renderer
    container = document.getElementById('papa_3d');
  
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0x3a364b );
    let wwww = document.getElementById('papa_2d').offsetWidth;
    renderer.setSize( wwww,  wwww);

    container.appendChild( renderer.domElement );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.rotateSpeed = 1;
    controls.noZoom = false;
    controls.zoomSpeed = 1.2;
    controls.staticMoving = true;
  
    mat_re = new THREE.MeshBasicMaterial({ color: 0xc8c9c5});
    mat_al = new THREE.MeshBasicMaterial({ color: 0xb0de18});
    mat_p1 = new THREE.MeshBasicMaterial({ color: 0xff7e42});
    mat_p2 = new THREE.MeshBasicMaterial({ color: 0xffae78});
    mat_es = new THREE.MeshBasicMaterial({ color: 0xffeb38});
}

function addpiso_3d(){
  let pos = prisms.length;
  if(georet != 0){
    prisms.push(new THREE.Mesh( geocons, (pos&1 ? mat_p1 : mat_p2)));
    prisms[pos].position.set( 0, pos*2.45*met_to_px, 0 );
    prisms[pos].rotation.x = -Math.PI / 2;
    scene.add( prisms[pos] );
    if(escalera){
      escale.push(new THREE.Mesh( geoesca, mat_es));
      escale[pos].position.set( 0, pos*2.45*met_to_px, 0 );
      escale[pos].rotation.x = -Math.PI / 2;
      scene.add( escale[pos] ); 
    }
  }
}

function subpiso_3d(){
  let pos = prisms.length;
  if(georet != 0){
    scene.remove(prisms[pos - 1]);
    prisms[pos - 1] = 0;
    prisms.pop();
    if(escalera){
      scene.remove(escale[pos - 1]);
      escale[pos - 1] = 0;
      escale.pop(); 
    }
  }
}

function make_3d(geo, mat, hg) {
  let forma = new THREE.Mesh( geo, mat);
  forma.position.set( 0, hg, 0 );
  forma.rotation.x = -Math.PI / 2;
  scene.add(forma); 
  return forma;
}

function draw_3d() {
  let r1 = new THREE.Vector2( a_r.x_px[0], a_r.y_px[0] );	
  let r2 = new THREE.Vector2( a_l.x_px[1], a_l.y_px[1] );	
  let r3 = new THREE.Vector2( a_l.x_px[2], a_l.y_px[2] );
  let r4 = new THREE.Vector2( a_r.x_px[3], a_r.y_px[3] );
  
  let l1 = new THREE.Vector2( a_l.x_px[0], a_l.y_px[0] );	
  let l2 = new THREE.Vector2( a_l.x_px[1], a_l.y_px[1] );	
  let l3 = new THREE.Vector2( a_l.x_px[2], a_l.y_px[2] );
  let l4 = new THREE.Vector2( a_l.x_px[3], a_l.y_px[3] );

  let c1 = new THREE.Vector2( a_c.x_px[0], a_c.y_px[0] );	
  let c2 = new THREE.Vector2( a_c.x_px[1], a_c.y_px[1] );	
  let c3 = new THREE.Vector2( a_c.x_px[2], a_c.y_px[2] );
  let c4 = new THREE.Vector2( a_c.x_px[3], a_c.y_px[3] );
  let c5, c6;

  //calcular el menor lado:
  let dis_c1c2 = Math.sqrt(Math.pow(c2.x,2) + Math.pow(c1.x,2)) * Math.sqrt(Math.pow(c2.y,2) + Math.pow(c1.y,2));
  let dis_c2c3 = Math.sqrt(Math.pow(c3.x,2) + Math.pow(c2.x,2)) * Math.sqrt(Math.pow(c3.y,2) + Math.pow(c2.y,2));
  
  let e1, e2, e3, e4;
  escalera = 0;
  if(dis_c1c2 > 5*met_to_px && dis_c2c3 > 5*met_to_px){
    escalera = 1;  //hay escalera
    e1 = new THREE.Vector2( p_esc.x_px[0], p_esc.y_px[0] );	
    e2 = new THREE.Vector2( p_esc.x_px[1], p_esc.y_px[1] );	
    e3 = new THREE.Vector2( p_esc.x_px[2], p_esc.y_px[2] );	
    e4 = new THREE.Vector2( p_esc.x_px[3], p_esc.y_px[3] );	
    
    c6 = c4;
    c3 = e1;
    c4 = e2;
    c5 = e3;
  }

  let height = 2.45 * met_to_px;	 
  georet = new PrismGeometry([r1,r2,r3,r4 ], 0 );
  geolib = new PrismGeometry([l1,l2,l3,l4 ], 0 );
  if(escalera){
    geoesca = new PrismGeometry([e1,e2,e3,e4 ], height );
    geocons = new PrismGeometry([c1,c2,c3,c4,c5,c6 ], height );
  }else{
    geocons = new PrismGeometry([c1,c2,c3,c4 ], height );
  }

  pisos2 = (pisos2*3 / height).toFixed(0);

  if(pisos2 > pisos){
    pisos2 = pisos;
  }
  document.getElementById("pisos_lt").value = pisos2;
  pisos_prev = pisos2;

  for(let i = 0; i < pisos2; i++){
    prisms[i] = make_3d(geocons, (i&1 ? mat_p1 : mat_p2), i*height);
    
    if(escalera){
      escale[i] = make_3d(geoesca, mat_es, i*height);
    }
  }
  ret_forma = make_3d( georet, mat_re, -1);
  lib_forma = make_3d( geolib, mat_al, -1);
}

function clear_3d(){
  if(ret_forma != 0){
    scene.remove(ret_forma);
    ret_forma = 0;
  }
  if(lib_forma != 0){
    scene.remove(lib_forma);
    lib_forma = 0;
  }
  while(prisms.length){
    scene.remove(prisms[prisms.length - 1]);
    prisms[prisms.length - 1] = 0;
    prisms.pop();
  }
  while(escale.length){
    scene.remove(escale[escale.length - 1]);
    escale[escale.length - 1] = 0;
    escale.pop();
  }
  // animate_3d();
}

function animate_3d() {
    requestAnimationFrame(animate_3d);
    //render
    controls.update();
    renderer.render(scene, camera);
}

function dis_2d() {
  document.getElementById('papa_3d').style.display = 'none';
  document.getElementById('papa_2d').style.display = 'block';
  document.getElementById('modelo_2d').style.display = 'block';
  document.getElementById('btn_2d').style.background = '#ebebeb';
  document.getElementById('btn_3d').style.background = '#fafafa';
}
function dis_3d() {
  document.getElementById('modelo_2d').style.display = 'none';
  document.getElementById('papa_2d').style.display = 'none';
  document.getElementById('papa_3d').style.display = 'block';
  document.getElementById('btn_2d').style.background = '#fafafa';
  document.getElementById('btn_3d').style.background = '#ebebeb';
}

function dis_1() {
  document.getElementById('info1').style.display = 'block';
  document.getElementById('info2').style.display = 'none';
  document.getElementById('info3').style.display = 'none';
  document.getElementById('btn_1').style.background = '#1ed760';
  document.getElementById('btn_2').style.background = '#fafafa';
  document.getElementById('btn_3').style.background = '#fafafa';
}
function dis_2() {
  document.getElementById('info1').style.display = 'none';
  document.getElementById('info2').style.display = 'block';
  document.getElementById('info3').style.display = 'none';
  document.getElementById('btn_1').style.background = '#fafafa';
  document.getElementById('btn_2').style.background = '#1ed760';
  document.getElementById('btn_3').style.background = '#fafafa';
}
function dis_3() {
  document.getElementById('info1').style.display = 'none';
  document.getElementById('info2').style.display = 'none';
  document.getElementById('info3').style.display = 'block';
  document.getElementById('btn_1').style.background = '#fafafa';
  document.getElementById('btn_2').style.background = '#fafafa';
  document.getElementById('btn_3').style.background = '#1ed760';
}