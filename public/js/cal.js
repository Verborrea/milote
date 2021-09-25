let cant_pisos = 1;
let ops = [];
let pos = 7;

let pref = [];
let acum = [];
let c_id = 'myc';

let moneda = 0;
const cambio = 0.27;
let dist = 0;
let sim = 's/ ';
let object = { maximumFractionDigits: 2, minimumFractionDigits: 2 };

function converse(div, cant){
  if(div){
    cant *= 0.27;
  }else{
    cant *= 3.69;
  }
  return cant.toFixed(2);
}

function cambio_mon() {
  let ops_prev = ops;
  moneda = parseInt(document.getElementById('moneda_input').value, 10);
  sim = (moneda?'$ ':'s/ ');
  document.getElementById('moneda1').innerText = sim;
  document.getElementById('moneda2').innerText = sim;
  
  let divs = document.getElementsByClassName('div_op');
  let cant;
  for(let i = 0; i < divs.length; i++){
    cant = divs[i].children[0].value;
    cant = converse(moneda, cant);
    divs[i].children[0].value = cant;
    divs[i].children[1].children[1].innerText = sim + cant;
  }
  for(let i=0; i<7 ;i++){
    show_op(i);
    show_op(i);
    calcular(); 
  }
}

function calcular() {
  let total = 0;
  let lot = document.getElementById('area_input').value;
  for (let i = 0; i < ops.length; i++) {
    if(ops[i].checked == true) {
      acum[pos] = ops[i].value;
      pref[pos] = i;
      break;
    }
  } 
  for(let i=0; i < acum.length ; i++){
    if(acum[i]){
     total += parseFloat(acum[i]); 
    }
  }
  document.getElementById('res1').innerHTML = (total).toLocaleString('en-US', object);
  document.getElementById('res2').innerHTML = (total*lot).toLocaleString('en-US', object);
}

function elegir(e){
  pos = e.parentNode.parentNode.getAttribute('pos');
  let sp = e.id.slice(0, 3);
  c_id = e.id.slice(0, 3);
  ops = document.getElementsByName(c_id);
  let divs = document.getElementById(c_id).getElementsByClassName('div_op');
  if(divs[0].style.display == 'none' || divs[1].style.display == 'none') {
    e.checked = false;
    for(let i=0; i< ops.length;i++){
      divs[i].style.display = 'block';
    }
    return;
  }
  for(let i=0; i< ops.length;i++){
    if(ops[i].checked == false) {
      divs[i].style.display = 'none';
    }
  }
  if(pos < 6){
    window.scrollBy(0, dist);
    show_op(parseInt(pos, 10)+1); 
  }
}

function show_op(p) {
  let divs = document.getElementsByClassName('options');
  let op = precios[p];
  let id = op.id;
  c_id = id;
  let res;
  pos = p;
  ops = document.getElementsByName(id.toString());
  //switch
  if(divs[p].style.display == 'block'){
    divs[p].style.display = 'none';
  }else{
    divs[p].style.display = 'block';
  }
  //esconder todos menos donde se hizo click
  for(let i=0; i < divs.length; i++){
    if(p != i && pref[i] == undefined){
      divs[i].style.display = 'none'; 
    }else if(p == i && pref[i] != undefined){
      divs[i].style.display = 'block'; 
    }
  }
  // si esta en blanco: poner todas las opciones
  if(document.getElementById(id).innerHTML == ''){
    let len = op.tipos.length;
    let op_html = "";
    for(let i = 0; i < len; i++){
      res = op.tipos[i].price;
      if(moneda){res*=cambio;}
      op_html += "<div class=\"div_op\">";
      op_html += "<input type=\"radio\" name=\"" + id;
      op_html += "\" id=\"" + id + i.toString() + "\" onclick=\"calcular(); elegir(this);\" value=\"" + res +'\"';
      op_html += "><div class=\"radio_op\"><label for=\"" + id + i.toString() + '\">' + op.tipos[i].name + '</label>';
      op_html += "<div class=\"price\">" + sim + res.toFixed(2) + '</div></div></div>';
    }
    document.getElementById(id).innerHTML = op_html;
  }
}

function init() {  
  // ================ load json ==================
  show_op(0);
  dist = document.getElementById('bts').children[0].scrollHeight;
  dist += document.getElementsByClassName('div_op')[0].scrollHeight;
  calcular();
}