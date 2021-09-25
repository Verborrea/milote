var map;
var lLayers = [];
var zonasLayer;
var fondoLayer;

var map_bounds;
var zonasjson;

var zona;
var area_total = 0;
var dir_via = "";
var alts;
var coefs;
var alibs;
var ests;
var rets;
var geometry;
var can2_margin = 30;

let lote_opacity = 0.5;
let lote_sel = null;
let usos_comp;
let sub_tipos;
let sel;
let idx; //para la calle
let tipos_html;
let sub_tipos_html;

var lote_x_px = [];
var lote_y_px = [];

const cuad = [
    [-71.64,-16.28],
    [-71.45,-16.50]
];

const pasox = (cuad[1][0] - cuad[0][0])/10;
const pasoy = (cuad[1][1] - cuad[0][1])/20;
let lim = [0,0,0,0];
let cuads = [];

let lotesStyle = {polygonOptions: {fillColor: 'rgba(0, 255, 0, 0.25)', strokeColor: 'rgba(0, 0, 255, 0.5)'}};
let fondoStyle = {polygonOptions: {fillColor: 'rgb(255, 255, 255, 0)', strokeColor: 'rgba(255, 255, 255, 0)'}};

// funciones auxiliares ==========================

function addLayer(layer, zindex){
  map.layers.insert(layer);
  layer.setZIndex(zindex);
}

function clear_spaces(){
  document.getElementById('chebo_multi').style.display = 'none';
  document.getElementById('coef').innerHTML = "";
  document.getElementById('alib_z').innerHTML = "";
  document.getElementById('alt').innerHTML = "";
  document.getElementById('ret').innerHTML = "";
  document.getElementById('acons').innerHTML = "";
  document.getElementById('alib_l').innerHTML = "";
}

function loadJSON(callback){   

  var request  = new XMLHttpRequest();
  
  request.overrideMimeType("application/json");
  request.open('GET', 'json/zonetas.json', true);
  request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == "200") {
          callback(request.responseText);
        }
  };
  request.send(null);  
}

function add_arrays(a, b){
  let len = a.length;
  let c = [];
  for(let i = 0; i < len; i++){
    c[i] = a[i] + b[i];
  }
  return c;
}

function sub_arrays(a, b){
  let len = a.length;
  let c = [];
  for(let i = 0; i < len; i++){
    c[i] = a[i] - b[i];
  }
  return c;
}

function redondear(str, e){
  return Number.parseFloat(str).toFixed(e);
}

function change_pisos(){
  let value = document.getElementById("pisos_lt").value;
  if (pisos_prev > value) {
    subpiso_3d();
  } else if (pisos_prev < value) {
    addpiso_3d();
  }
  pisos_prev = value;
}

// funciones importantes =========================

function sel_zona(){
  let zona_sel = document.getElementById('zona');
  zona = zona_sel.options[zona_sel.selectedIndex].textContent;
  //find by name
  for(let i = 0; i < zonasjson.features.length; i++){
    if(zona == zonasjson.features[i].tipo){
      zona = zonasjson.features[i];
      break;
    }
  }
  sub_tipos = zona.sub_tipos;
  alts = zona.alts;
  coefs = zona.coefs;
  alibs = zona.alibs;
  ests = zona.ests;
  rets = zona.rets;
  
  //mostrar subtipos & info del lote
  sub_tipos_html = "";
  for(let i = 0; i < sub_tipos.length; i++){
    sub_tipos_html+= "<option value=";
    sub_tipos_html+= i;
    sub_tipos_html+= ">";
    sub_tipos_html+= sub_tipos[i];
    sub_tipos_html+= "</option>";
  }
  document.getElementById('sel_tipo').innerHTML = sub_tipos_html;
  sel_subtipo();
}

function resize2d(){
  let cont_2d = document.getElementById("papa_2d");
  let ww = cont_2d.offsetWidth + "px";
  can2.style.width = ww
  cont_2d.style.height = ww;
  can2.style.height = ww;
  if(document.getElementById('area_lt').textContent){
    draw_lote_2d();
    draw_lote_2d();
    clear_3d();
    if(geometry.length == 5){
      draw_acons_2d();
      draw_3d();
      animate_3d();
    }
  }
  // let www = document.getElementById("papa_3d").offsetWidth + "px";
  // document.getElementById("papa_3d").style.height = www;
  // renderer.setSize( document.getElementById("papa_3d").offsetHeight , document.getElementById("papa_3d").offsetHeight ); 
}

function selectedSuggestion(suggestionResult) {
    map.entities.clear();
    map.setView({ bounds: suggestionResult.bestView });
    var pushpin = new Microsoft.Maps.Pushpin(suggestionResult.location);
    map.entities.push(pushpin);
}

function GetMap(){
  sel = document.getElementById('sel_tipo');
  
  // ============== load 3D canvas ================
  PrismGeometry.prototype = Object.create( THREE.ExtrudeGeometry.prototype );
  init_3d();
  
  // ============== preparativos 2d ================
  can2 = document.getElementById("modelo_2d");
  ctx2 = can2.getContext("2d");
  window.onresize = resize2d;
  resize2d();
  
  // ================ load zonas ==================
  loadJSON(function(response) {
    zonasjson = JSON.parse(response);
  });
  
  // ================= map stuff ===================
  map_bounds = Microsoft.Maps.LocationRect.fromLocations(
    new Microsoft.Maps.Location(-16.261,-71.679),
    new Microsoft.Maps.Location(-16.579,-71.401)
  );
  
  map = new Microsoft.Maps.Map("#map", {
    maxBounds: map_bounds,
    mapTypeId: Microsoft.Maps.MapTypeId.grayscale,
    showLocateMeButton: true,
    supportedMapTypes: [Microsoft.Maps.MapTypeId.grayscale, Microsoft.Maps.MapTypeId.aerial],
    navigationBarMode: Microsoft.Maps.NavigationBarMode.square,
    center: new Microsoft.Maps.Location(-16.3988, -71.537),
    zoom: 13,
    minZoom: 12
  });
  
  // fondoLayer = new Microsoft.Maps.Layer(); 
  
  Microsoft.Maps.loadModule('Microsoft.Maps.SpatialMath');

  // addLayer(lotesLayer, 20000);
  // addLayer(fondoLayer, 10000);

  Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', function () {
    var manager = new Microsoft.Maps.AutosuggestManager({
      maxResults: 6,
      map: map,
      bounds: map_bounds
    });
    manager.attachAutosuggest('#autocomplete', '#autocomplete-container', selectedSuggestion);
  });
  
  // ================== R A N G E ==================

  let map_range = document.getElementById("map_range");
  let lotes_range = document.getElementById("lotes_range");
  let zonas_range = document.getElementById("zonas_range");

  let map_range_span = document.getElementById("map_range_span");
  let lotes_range_span = document.getElementById("lotes_range_span");
  let zonas_range_span = document.getElementById("zonas_range_span");

  // map_range.oninput = function() {
  //   map_range_span.innerHTML = (this.value * 100).toFixed(0) +"%";
  //   changeOpacity(fondoLayer, "fondo", 1 - this.value);
  // }
  // lotes_range.oninput = function() {
  //   lotes_range_span.innerHTML = (this.value * 100).toFixed(0) +"%";
  //   changeOpacity(lotesLayer, "lotes", this.value);
  // }

  // ================== l i s t e n e r s ==================
  let lote_over = null;
  
  Microsoft.Maps.Events.addHandler(map, 'viewchangeend', function () {
    if(map.getZoom() > 15){
      map.layers.remove(zonasLayer);
      zonasLayer = undefined;
      let vb = map.getBounds().bounds;
      let nlim = [Math.floor((vb[0]-cuad[0][1])/pasoy),Math.floor((vb[3]-cuad[0][0])/pasox),Math.floor((vb[2]-cuad[0][1])/pasoy),Math.floor((vb[1]-cuad[0][0])/pasox)];
      let check = false;
      for(let i = 0; i < 4; i++) {
        if(lim[i] !== nlim[i]){
          check = true;
          break;
        }
      }
      let ncuads = [];
      if(check){
        for(let i = nlim[0]; i <= nlim[2]; i++){
          for(let j = nlim[1]; j <= nlim[3]; j++){
            ncuads.push(i*10+j);
          }
        }
        // let borrar = cuads.filter(x => !ncuads.includes(x));
        let cargar = ncuads.filter(x => !cuads.includes(x));
        let lenc = cargar.length;
        // let lenb = borrar.length;
        // for(let i = 0; i < lenb; i++){
        //   map.layers.removeAt(borrar[i]);
        // }
        for(let i = 0; i < lenc; i++){
          if (lLayers[cargar[i]] === undefined){
            lLayers[cargar[i]] = new Microsoft.Maps.Layer();
            let lurl = "json/"+(cargar[i]).toString()+".json";
            Microsoft.Maps.loadModule("Microsoft.Maps.GeoJson", function() {
              Microsoft.Maps.GeoJson.readFromUrl(lurl,(shapes) => {
                lLayers[cargar[i]].add(shapes);
                addLayer(lLayers[cargar[i]],20000);
                colorear(lLayers[cargar[i]],0.5);
              },null,lotesStyle);
            });
            Microsoft.Maps.Events.addHandler(lLayers[cargar[i]], 'mouseover', (e) => 
            {
              lote_over = e.primitive;
              setStyle(lote_over, false);
            });
            Microsoft.Maps.Events.addHandler(lLayers[cargar[i]], 'mouseout', (e) => 
            {
              if(lote_over != lote_sel){
                coco(lote_over,lote_opacity);
              }
            });
            Microsoft.Maps.Events.addHandler(lLayers[cargar[i]], 'click', (e) => 
            {
              if(lote_sel != null){coco(lote_sel,lote_opacity);}
              lote_sel = e.primitive;
              setStyle(lote_sel, true);
              dir_via = lote_sel.metadata.m;
              if (dir_via == 0){
                dir_via = lote_sel.metadata.v;
              }
              area_total = Microsoft.Maps.SpatialMath.Geometry.area(lote_sel);
              console.log(area_total);
              geometry = lote_sel.getRings();
              geometry = geometry[0];

              // clear display
              sel.innerHTML = "";
              // clear_spaces();

              //agregar info del lote
              document.getElementById('direccion').innerHTML = dir_via;
              document.getElementById('area_lt').innerHTML = Math.round(area_total) + " m<sup>2</sup>";

              // get zona
              let zona_op = lote_sel.metadata.z;
              console.log(zona_op);
              for(let i = 0; i < zonasjson.features.length; i++){
                if(zona_op == zonasjson.features[i].tipo){
                  zona_op = zonasjson.features[i];
                  break;
                }
              }
              //mostrar zona del lote
              tipos_html = "";
              for(let i = 0; i < zona_op.comp.length; i++){
                tipos_html+= "<option value=";
                tipos_html+= i;
                tipos_html+= ">";
                tipos_html+= zona_op.comp[i];
                tipos_html+= "</option>";
              }
              document.getElementById('zona').innerHTML = tipos_html;
              sel_zona();
            }); 
          }else{
            addLayer(lLayers[cargar[i]],20000);
          }
        }
        cuads = ncuads;
      }
      lim = nlim; 
    }
    else{
      lim = [0,0,0,0];
      cuads = [];
      lLayers.forEach(e => map.layers.remove(e));
      if(zonasLayer === undefined){
        zonasLayer= new Microsoft.Maps.Layer();
        Microsoft.Maps.loadModule("Microsoft.Maps.GeoJson", function() {
          Microsoft.Maps.GeoJson.readFromUrl("json/zonas.json",(shapes) => {
            zonasLayer.add(shapes);
            addLayer(zonasLayer,20000);
            colorear(zonasLayer,0.5);
          },null,lotesStyle);
        });
      }
    }
  });
}

function setStyle(lote, isSel) {
  let fcolor, scolor;
  if(isSel == true){
    fcolor = "rgba(238, 66, 102, " + lote_opacity/2 + ")";  //color del lote_sel
  }else{
    fcolor = "rgba(255, 210, 63, " + lote_opacity/2 + ")";  //color del lote_over
  }
  scolor = "rgba(238, 66, 102, " + lote_opacity + ")";
  lote.setOptions({fillColor: fcolor, strokeColor: scolor});
  return;
}

function changeOpacity(layer, tipo, opacity){
  let layerPrimitives = layer._primitives;
  let len = layerPrimitives.length;
  let fcolor, scolor;
  if(tipo == "lotes"){
    fcolor = "rgba(0, 255, 0, " + opacity/2 + ")";
    scolor = "rgba(0, 0, 255, " + opacity + ")";
    lote_opacity = opacity;
  }
  if(tipo == "fondo"){
    fcolor = "rgba(255, 255, 255, " + opacity + ")";
    scolor = "rgba(255, 255, 255, " + opacity + ")";
  }
  for(let i = 0; i < len; i++){    
    layerPrimitives[i].setOptions({fillColor: fcolor, strokeColor: scolor});
  }
  if(lote_sel){
    lote_sel.setOptions({
    fillColor: "rgba(238, 66, 102, " + lote_opacity/2 + ")",
    strokeColor: "rgba(238, 66, 102, " + lote_opacity + ")"});
  }
}

function coco(lote,opacity){
  let color, scolor;
  let tipo = lote.metadata.z;
  switch (tipo){
    case 'RDB':
      color = "rgba(253, 255, 155, " + opacity + ")";
      scolor= "rgba(253, 255, 155, " + opacity + ")";
      break;
    case 'RDM-1':
      color = "rgba(255, 238, 0, " + opacity + ")";
      scolor= "rgba(255, 238, 0, " + opacity + ")";
      break;
    case 'RDM-2':
      color = "rgba(255, 191, 0, " + opacity + ")";
      scolor= "rgba(255, 191, 0, " + opacity + ")";
      break;
    case 'RDA-1':
      color = "rgba(255, 132, 0,  " + opacity + ")";
      scolor= "rgba(255, 132, 0,  " + opacity + ")";
      break;
    case 'RDA-2':
      color = "rgba(255, 98, 0,  " + opacity + ")";
      scolor= "rgba(255, 98, 0,  " + opacity + ")";
      break;
    case 'CZ':
      color = "rgba(255, 0, 0,  " + opacity + ")";
      scolor= "rgba(255, 0, 0,  " + opacity + ")";
      break;
    case 'CE':
      color = "rgba(255, 0, 0,  " + opacity + ")";
      scolor= "rgba(255, 0, 0,  " + opacity + ")";
      break;
    case 'CS':
      color = "rgba(255, 0, 0,  " + opacity + ")";
      scolor= "rgba(255, 0, 0,  " + opacity + ")";
      break;
    case 'CM':
      color = "rgba(255, 0, 0,  " + opacity + ")";
      scolor= "rgba(255, 0, 0,  " + opacity + ")";
      break;
    case 'CI':
      color = "rgba(255, 0, 0,  " + opacity + ")";
      scolor= "rgba(255, 0, 0,  " + opacity + ")";
      break;
    case 'I1R':
      color = "rgba(255, 234, 193,  " + opacity + ")";
      scolor= "rgba(255, 234, 193,  " + opacity + ")";
      break;
    case 'I-2':
      color = "rgba(146, 14, 195,  " + opacity + ")";
      scolor= "rgba(146, 14, 195,  " + opacity + ")";
      break;
    case 'I-1':
      color = "rgba(146, 14, 195,  " + opacity + ")";
      scolor= "rgba(146, 14, 195,  " + opacity + ")";
      break;
    case 'ZRE-CH':
      color = "rgba(223, 223, 223,  " + opacity + ")";
      scolor= "rgba(0, 0, 0,  " + opacity + ")";
      break;
    case 'ZR':
      color = "rgba(153, 227, 93,  " + opacity + ")";
      scolor= "rgba(153, 227, 93,  " + opacity + ")";
      break;
    case 'SALUD':
      color = "rgba(0, 241, 227, " + opacity + ")";
      scolor= "rgba(0, 241, 227, " + opacity + ")";
      break;
    case 'EDUCACION':
      color = "rgba(119, 180, 255, " + opacity + ")";
      scolor= "rgba(119, 180, 255, " + opacity + ")";
      break;
    case 'ZA':
      color = "rgba(71, 130, 22, " + opacity + ")";
      scolor= "rgba(71, 130, 22, " + opacity + ")";
      break;
    case 'EA':
      color = "rgba(71, 130, 22, " + opacity + ")";
      scolor= "rgba(71, 130, 22, " + opacity + ")";
      break;
    case 'ZRP':
      color = "rgba(71, 130, 22, " + opacity + ")";
      scolor= "rgba(71, 130, 22, " + opacity + ")";
      break;
    case 'ZM':
      color = "rgba(71, 130, 22, " + opacity + ")";
      scolor= "rgba(71, 130, 22, " + opacity + ")";
      break;
    case 'ZAQ':
      color = "rgba(255, 132, 239, " + opacity + ")";
      scolor= "rgba(255, 132, 239, " + opacity + ")";
      break;
    case 'ZRE-RU':
      color = "rgba(255, 132, 239, " + opacity + ")";
      scolor= "rgba(255, 132, 239, " + opacity + ")";
      break;
    case 'ZRE-RI2':
      color = "rgba(255, 132, 239, " + opacity + ")";
      scolor= "rgba(255, 132, 239, " + opacity + ")";
      break;
    case 'ZRE-RI1':
      color = "rgba(255, 132, 239, " + opacity + ")";
      scolor= "rgba(255, 132, 239, " + opacity + ")";
      break;
    case 'ZRE-PP':
      color = "rgba(255, 132, 239, " + opacity + ")";
      scolor= "rgba(255, 132, 239, " + opacity + ")";
      break;
    case 'ZRE-PN':
      color = "rgba(255, 132, 239, " + opacity + ")";
      scolor= "rgba(255, 132, 239, " + opacity + ")";
      break;
    case 'ZRE-PA':
      color = "rgba(255, 132, 239, " + opacity + ")";
      scolor= "rgba(255, 132, 239, " + opacity + ")";
      break;
    case 'OU1':
      color = "rgba(145, 145, 145, " + opacity + ")";
      scolor= "rgba(145, 145, 145, " + opacity + ")";
      break;
    case 'OU2':
      color = "rgba(145, 145, 145, " + opacity + ")";
      scolor= "rgba(145, 145, 145, " + opacity + ")";
      break;
  }
  lote.setOptions({fillColor: color, strokeColor: scolor});
}

function colorear(layer,opacity){
  let lotesl = layer._primitives;
  let color, scolor;
  for(let i = 0; i < lotesl.length; i++){
    let tipo = lotesl[i].metadata.z;
    switch (tipo) {
      case 'RDB':
        color = "rgba(253, 255, 155, " + opacity + ")";
        scolor = "rgba(253, 255, 155, " + opacity + ")";
        break;
      case 'RDM-1':
        color = "rgba(255, 238, 0, " + opacity + ")";
        scolor = "rgba(255, 238, 0, " + opacity + ")";
        break;
      case 'RDM-2':
        color = "rgba(255, 191, 0, " + opacity + ")";
        scolor = "rgba(255, 191, 0, " + opacity + ")";
        break;
      case 'RDA-1':
        color = "rgba(255, 132, 0,  " + opacity + ")";
        scolor = "rgba(255, 132, 0,  " + opacity + ")";
        break;
      case 'RDA-2':
        color = "rgba(255, 98, 0,  " + opacity + ")";
        scolor = "rgba(255, 98, 0,  " + opacity + ")";
        break;
      case 'CZ':
        color = "rgba(255, 0, 0,  " + opacity + ")";
        scolor = "rgba(255, 0, 0,  " + opacity + ")";
        break;
      case 'CE':
        color = "rgba(255, 0, 0,  " + opacity + ")";
        scolor = "rgba(255, 0, 0,  " + opacity + ")";
        break;
      case 'CS':
        color = "rgba(255, 0, 0,  " + opacity + ")";
        scolor = "rgba(255, 0, 0,  " + opacity + ")";
        break;
      case 'CM':
        color = "rgba(255, 0, 0,  " + opacity + ")";
        scolor = "rgba(255, 0, 0,  " + opacity + ")";
        break;
      case 'CI':
        color = "rgba(255, 0, 0,  " + opacity + ")";
        scolor = "rgba(255, 0, 0,  " + opacity + ")";
        break;
      case 'I1R':
        color = "rgba(255, 234, 193,  " + opacity + ")";
        scolor = "rgba(255, 234, 193,  " + opacity + ")";
        break;
      case 'I-2':
        color = "rgba(146, 14, 195,  " + opacity + ")";
        scolor = "rgba(146, 14, 195,  " + opacity + ")";
        break;
      case 'I-1':
        color = "rgba(146, 14, 195,  " + opacity + ")";
        scolor = "rgba(146, 14, 195,  " + opacity + ")";
        break;
      case 'ZRE-CH':
        color = "rgba(223, 223, 223,  " + opacity + ")";
        scolor = "rgba(0, 0, 0,  " + opacity + ")";
        break;
      case 'ZR':
        color = "rgba(153, 227, 93,  " + opacity + ")";
        scolor = "rgba(153, 227, 93,  " + opacity + ")";
        break;
      case 'SALUD':
        color = "rgba(0, 241, 227, " + opacity + ")";
        scolor = "rgba(0, 241, 227, " + opacity + ")";
        break;
      case 'EDUCACION':
        color = "rgba(119, 180, 255, " + opacity + ")";
        scolor = "rgba(119, 180, 255, " + opacity + ")";
        break;
      case 'ZA':
        color = "rgba(71, 130, 22, " + opacity + ")";
        scolor = "rgba(71, 130, 22, " + opacity + ")";
        break;
      case 'EA':
        color = "rgba(71, 130, 22, " + opacity + ")";
        scolor = "rgba(71, 130, 22, " + opacity + ")";
        break;
      case 'ZRP':
        color = "rgba(71, 130, 22, " + opacity + ")";
        scolor = "rgba(71, 130, 22, " + opacity + ")";
        break;
      case 'ZM':
        color = "rgba(71, 130, 22, " + opacity + ")";
        scolor = "rgba(71, 130, 22, " + opacity + ")";
        break;
      case 'ZAQ':
        color = "rgba(255, 132, 239, " + opacity + ")";
        scolor = "rgba(255, 132, 239, " + opacity + ")";
        break;
      case 'ZRE-RU':
        color = "rgba(255, 132, 239, " + opacity + ")";
        scolor = "rgba(255, 132, 239, " + opacity + ")";
        break;
      case 'ZRE-RI2':
        color = "rgba(255, 132, 239, " + opacity + ")";
        scolor = "rgba(255, 132, 239, " + opacity + ")";
        break;
      case 'ZRE-RI1':
        color = "rgba(255, 132, 239, " + opacity + ")";
        scolor = "rgba(255, 132, 239, " + opacity + ")";
        break;
      case 'ZRE-PP':
        color = "rgba(255, 132, 239, " + opacity + ")";
        scolor = "rgba(255, 132, 239, " + opacity + ")";
        break;
      case 'ZRE-PN':
        color = "rgba(255, 132, 239, " + opacity + ")";
        scolor = "rgba(255, 132, 239, " + opacity + ")";
        break;
      case 'ZRE-PA':
        color = "rgba(255, 132, 239, " + opacity + ")";
        scolor = "rgba(255, 132, 239, " + opacity + ")";
        break;
      case 'OU1':
        color = "rgba(145, 145, 145, " + opacity + ")";
        scolor = "rgba(145, 145, 145, " + opacity + ")";
        break;
      case 'OU2':
        color = "rgba(145, 145, 145, " + opacity + ")";
        scolor = "rgba(145, 145, 145, " + opacity + ")";
        break;
    }
    lotesl[i].setOptions({fillColor: color, strokeColor: scolor});
  }
}

function analize(p1, po, p2, pos) {
  let v1 = [p1.latitude - po.latitude, p1.longitude - po.longitude];
  let v2 = [p2.latitude - po.latitude, p2.longitude - po.longitude];
  
  let prov = v1[0]*v2[0] + v1[1]*v2[1];
  let prom = Math.sqrt(Math.pow(v1[0],2) + Math.pow(v1[1],2)) * Math.sqrt(Math.pow(v2[0],2) + Math.pow(v2[1],2));
  
  let cosv = prov/prom;
  if(cosv < -0.95){  //coseno permitido
    geometry.splice(pos, 1); 
    if(pos == 0){
      geometry[geometry.length-1] = geometry[0];
    }
    return 1;
  }
  return 0;
}

function simplify() {
  analize(geometry[geometry.length-2], geometry[0], geometry[1], 0);
  for(let i = 0; i+2 < geometry.length; i++){
    if(analize(geometry[i], geometry[i+1], geometry[i+2], i+1)){
      i=i-1;
    }
  }
}

function sel_subtipo() {
  //-------------
  clear_spaces();
  draw_lote_2d();
  clear_3d();
  //-------------
  document.getElementById('coef').innerHTML = coefs[sel.value];
  document.getElementById('alib_z').innerHTML = alibs[sel.value]+ "%";
  document.getElementById('est').innerHTML = ests[sel.value];
  pisos = alts[sel.value];
  document.getElementById('alt').innerHTML = pisos + " pisos";
  document.getElementById('ret').innerHTML = rets[sel.value]+ " m";
  document.getElementById("pisos_lt").max = pisos;
  document.getElementById("pisos_lt").value = pisos;
  pisos_prev = pisos;
  change_pisos();

  if(area_total != 0){
    document.getElementById('acons').innerHTML = Math.round(area_total * coefs[sel.value])+ " m<sup>2</sup>";
    document.getElementById('a_cal').href = '/calculadora/' + Math.round(area_total * coefs[sel.value]);
    document.getElementById('alib_l').innerHTML = Math.round(area_total * (alibs[sel.value] /100)) + " m<sup>2</sup>";
  }
  // caso Multifamiliar*
  if(sel.options[sel.selectedIndex].textContent == "Multifamiliar*"){
    document.getElementById('chebo_multi').style.display = 'inline-block';
  }
  
  if(geometry.length > 5){
    simplify();
    idx = 0;
  }
  if(geometry.length == 5){
    draw_acons_2d();
    draw_3d();
    animate_3d();
  }
}

function idle_rings(rings){
  let len = rings.length;
  let x_array =[]; let y_array = [];
  for(let i = 0; i <len; i++){
    x_array.push(rings[i].longitude);
    y_array.push(rings[i].latitude);
  }
  for(let i = 0; i < len; i++){
    x_array[i] -= x_min;
    x_array[i] *= 1e12;
    y_array[i] -= y_min;
    y_array[i] *= 1e12;
  }
  let x_px = [];
  let y_px = [];
  for(let i = 0; i < len; i++){
    x_px[i] = x_array[i] * fact_esc;
    y_px[i] = (can2.width - 2 * can2_margin) - y_array[i] * fact_esc;
  }
  return {x_px, y_px, len}
}

function transform_rings(rings){
  let len = rings.length;
  let x_array =[]; let y_array = [];
  for(let i = 0; i <len; i++){
    x_array.push(rings[i].longitude);
    y_array.push(rings[i].latitude);
  }
  let distances = [];
  for(let i = 0; (i+1) < len; i++){
    distances.push(Microsoft.Maps.SpatialMath.getDistanceTo(
    new Microsoft.Maps.Location(y_array[i],x_array[i]),
    new Microsoft.Maps.Location(y_array[i+1],x_array[i+1])));
  }
  for(let i = 0; i < len; i++){
    x_array[i] -= x_min;
    x_array[i] *= 1e12;
    y_array[i] -= y_min;
    y_array[i] *= 1e12;
  }
  let x_px = [];
  let y_px = [];
  for(let i = 0; i < len; i++){
    x_px[i] = x_array[i] * fact_esc;
    y_px[i] = (can2.width - 2 * can2_margin) - y_array[i] * fact_esc;
  }
  let lx_px = [];
  let ly_px = [];
  for(let i = 0; (i+1) < len; i++){
    lx_px[i] = (x_px[i] + x_px[i+1])/2;
    ly_px[i] = (y_px[i] + y_px[i+1])/2;
  }
  return {x_px, y_px, lx_px, ly_px, distances, len}
}

function draw(data, scolor, fcolor, tcolor) {
  ctx2.lineWidth = 3;
  ctx2.beginPath();
  ctx2.moveTo(data.x_px[0]+can2_margin, data.y_px[0]+can2_margin);  //aumentar 10 a todo
  for(let i = 1; i < data.len; i++){
    ctx2.lineTo(data.x_px[i]+can2_margin, data.y_px[i]+can2_margin);
  }
  ctx2.closePath();
  ctx2.strokeStyle = scolor;
  ctx2.globalAlpha = 1;
  ctx2.stroke();
  ctx2.fillStyle = fcolor;
  ctx2.globalAlpha = 0.25;
  ctx2.fill();
  ctx2.globalAlpha = 1;
  ctx2.font = "24px Arial";
  ctx2.fillStyle = tcolor;
  for(let i = 0; i+1 < data.len; i++){
    ctx2.fillText(redondear(data.distances[i].toString(), 0) + 'm', data.lx_px[i]+can2_margin, data.ly_px[i]+can2_margin);
  }
}

function draw_lote_2d(){
  let x_array = [];
  let y_array = [];
  let distances = [];

  let lx_px = [];
  let ly_px = [];
  // ==================== pushin' from geometry to xy_arrays ====================
  for(let i = 0; i <geometry.length; i++){
    x_array.push(geometry[i].longitude);
    y_array.push(geometry[i].latitude);
  }
  let len = x_array.length;
  
  // ==================== calculatin' distances ====================
  for(let i = 0; (i+1) < len; i++){
    distances.push(Microsoft.Maps.SpatialMath.getDistanceTo(
    new Microsoft.Maps.Location(y_array[i],x_array[i]),
    new Microsoft.Maps.Location(y_array[i+1],x_array[i+1])));
  }
  
  // =================== calcular la calle
  idx = 0;
  for (let i = 1; i < distances.length; i++) {
    if (distances[i] < distances[idx]) {
      idx = i;
    }
  }

  // ==================== normalizin'====================
  x_min = Math.min(...x_array);
  y_min = Math.min(...y_array);
  for(let i = 0; i < len; i++){
    x_array[i] -= x_min;
    x_array[i] *= 1e12;
    y_array[i] -= y_min;
    y_array[i] *= 1e12;
  }

  let max = Math.max(Math.max(...x_array), Math.max(...y_array));
  fact_esc = (can2.width - 2 * can2_margin)/max;  //ya que el canvas es de 420x420
  // ==================== to_canvas units ====================
  for(let i = 0; i < len; i++){
    lote_x_px[i] = x_array[i] * fact_esc;
    lote_y_px[i] = (can2.width - 2 * can2_margin) - y_array[i] * fact_esc;
  }
  // ==================== para la altura de los pisos
  let raiz_pit = Math.sqrt(Math.pow(lote_x_px[1]-lote_x_px[0], 2) + Math.pow(lote_y_px[1]-lote_y_px[0], 2));
  met_to_px = raiz_pit/distances[0];
  
  // ==================== putting labels in canvas units ====================
  for(let i = 0; (i+1) < len; i++){
    lx_px[i] = (lote_x_px[i] + lote_x_px[i+1])/2;
    ly_px[i] = (lote_y_px[i] + lote_y_px[i+1])/2;
  }
  // ==================== rendering ====================
  let data = {x_px : lote_x_px, y_px : lote_y_px, lx_px: lx_px, ly_px: ly_px, distances: distances, len: len};
  ctx2.clearRect(0, 0, can2.width, can2.height);
  draw(data, "black", "silver", "cyan");
}

function draw_acons_2d(){
  let x_array = [];
  let y_array = [];
  
  for(let i = 0; i <geometry.length; i++){
    x_array.push(geometry[i].longitude);
    y_array.push(geometry[i].latitude);
  }
  let len = x_array.length;
  
  // solucion apriori
  let calle = [[x_array[idx], y_array[idx]], [x_array[idx+1], y_array[idx+1]]];
  let back = [[x_array[(idx+3)%4], y_array[(idx+3)%4]], [x_array[(idx+2)%4], y_array[(idx+2)%4]]];

  let v0 = sub_arrays(back[0], calle[0]);
  let v1 = sub_arrays(back[1], calle[1]);
  let ve = sub_arrays(back[0], back[1]); //esc

  let d0 = Microsoft.Maps.SpatialMath.getDistanceTo(
    new Microsoft.Maps.Location(back[0][1],back[0][0]),
    new Microsoft.Maps.Location(calle[0][1],calle[0][0]));
  let d1 = Microsoft.Maps.SpatialMath.getDistanceTo(
    new Microsoft.Maps.Location(back[1][1],back[1][0]),
    new Microsoft.Maps.Location(calle[1][1],calle[1][0]));
  let de = Microsoft.Maps.SpatialMath.getDistanceTo(
    new Microsoft.Maps.Location(back[0][1],back[0][0]),
    new Microsoft.Maps.Location(back[1][1],back[1][0])); 

  d0 = redondear(d0.toString(), 2);
  d1 = redondear(d1.toString(), 2);
  de = redondear(de.toString(), 2);

  let m0 = [v0[1]/d0, v0[0]/d0];  /*cada m mide 1 metro desde el origen*/
  let m1 = [v1[1]/d1, v1[0]/d1];
  let me = [ve[1]/de, ve[0]/de];

  let alib_t = area_total * (alibs[sel.value] /100);
  
  let ret_l = rets[sel.value];
  let ret_rings = [
    new Microsoft.Maps.Location(calle[0][1],calle[0][0]),
    new Microsoft.Maps.Location(calle[0][1]+(ret_l*m0[0]),calle[0][0]+(ret_l*m0[1])),
    new Microsoft.Maps.Location(calle[1][1]+(ret_l*m1[0]),calle[1][0]+(ret_l*m1[1])),
    new Microsoft.Maps.Location(calle[1][1],calle[1][0]),
    new Microsoft.Maps.Location(calle[0][1],calle[0][0]) /*comienzo*/
  ];
  calle[0][1]+=ret_l*m0[0];
  calle[0][0]+=ret_l*m0[1];
  calle[1][1]+=ret_l*m1[0];
  calle[1][0]+=ret_l*m1[1];
  let ret_a = Microsoft.Maps.SpatialMath.Geometry.area(new Microsoft.Maps.Polygon(ret_rings));
  ret_a = Number.parseFloat(ret_a.toString());

  let res_a = alib_t - ret_a;
  let res_c = 0;

  let resto_rings = [new Microsoft.Maps.Location(back[0][1],back[0][0]),
                     new Microsoft.Maps.Location(back[0][1]-m0[0],back[0][0]-m0[1]),
                     new Microsoft.Maps.Location(back[1][1]-m1[0],back[1][0]-m1[1]),
                     new Microsoft.Maps.Location(back[1][1],back[1][0]),
                     new Microsoft.Maps.Location(back[0][1],back[0][0])]; /*comienzo*/

  let libre = new Microsoft.Maps.Polygon(resto_rings);
  while(res_c < res_a){
    back[0][1] -= m0[0];
    back[0][0] -= m0[1];
    back[1][1] -= m1[0];
    back[1][0] -= m1[1];
    resto_rings[1] = new Microsoft.Maps.Location(back[0][1],back[0][0]);
    resto_rings[2] = new Microsoft.Maps.Location(back[1][1],back[1][0]);
    libre.setRings(resto_rings);
    res_c = redondear(Microsoft.Maps.SpatialMath.Geometry.area(libre).toString(), 2);
  }
  
  let acons_rings = [
    new Microsoft.Maps.Location(calle[0][1],calle[0][0]),
    new Microsoft.Maps.Location(calle[1][1],calle[1][0]),
    new Microsoft.Maps.Location(back[1][1],back[1][0]),
    new Microsoft.Maps.Location(back[0][1],back[0][0]),
    new Microsoft.Maps.Location(calle[0][1],calle[0][0]) /*comienzo*/
  ];
  
  a_r = transform_rings(ret_rings);
  a_c = transform_rings(acons_rings);
  a_l = transform_rings(resto_rings);
  
  if(redondear(a_c.distances[0].toString(), 0) > 5 && redondear(a_c.distances[1].toString(), 0) > 5){
    //escaleras en latlng
    let p_esc_rings = [
      new Microsoft.Maps.Location(back[1][1]-3*m1[0],back[1][0]-3*m1[1]),
      new Microsoft.Maps.Location(back[1][1]-3*m1[0]+3.5*me[0],back[1][0]-3*m1[1]+3.5*me[1]),
      new Microsoft.Maps.Location(back[1][1]+3.5*me[0],back[1][0]+3.5*me[1]),
      new Microsoft.Maps.Location(back[1][1],back[1][0]),
      new Microsoft.Maps.Location(back[1][1]-3*m1[0],back[1][0]-3*m1[1]) /*comienzo*/
    ];
    //escaleras en px
    p_esc = idle_rings(p_esc_rings); 
  }
  
  // ------------------------ r e n d e r ------------------------
  ctx2.clearRect(0, 0, can2.width, can2.height);
  pisos2 = Math.sqrt(Math.pow(a_l.x_px[1] - a_l.x_px[0], 2) + Math.pow(a_l.y_px[1] - a_l.y_px[0], 2));
  
  draw(a_r, 'black', 'gray', 'blue');
  draw(a_c, 'orange', 'orange', 'red');
  draw(a_l, 'green', 'green', 'darkgreen');
}

function chng_name(e, t1, t2){
  if(e.innerText == t1){
    e.innerText = t2;
  }else{
    e.innerText = t1;
  }
  setTimeout(500,resize2d());
}