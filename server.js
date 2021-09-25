// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();

const fs = require('fs');

// let rawdata = fs.readFileSync(__dirname + "/public/json/prueba.json");
// let lotes = JSON.parse(rawdata);

app.set('view engine', 'hbs');

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin","*");
  response.header("Access-Control-Allow-Headers","X-Requested-With");
  next();
});

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded());

app.get("/", (request, response) => {
  response.render('index');
});

app.get("/map", (request, response) => {
  response.sendFile(__dirname + "/views/map.html");
});

app.get("/nosotros", (request, response) => {
  response.render('nosotros');
});

app.get("/calculadora/", (request, response) => {
  response.render('cal', {output: 100});
});

app.get("/calculadora/:area", (request, response) => {
  response.render('cal', {output: request.params.area});
});

app.get("/doc", (request, response) => {
  response.render('doc/doc');
});

function dist(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;

  return 12742000 * Math.asin(Math.sqrt(a));
}

function compro(coor,dim){
  for(let i=0; i+1 < 5; i++){
    if(dist(coor[i][1],coor[i][0],coor[i+1][1],coor[i+1][0]).toFixed() == dim){
      return true
    }
  }
  return false
}

// function ml(dim){
//   let area = parseInt(dim) * parseInt(dim) * 2;
//   dim = dim *2;
//   let total = 0;
//   let c = 0;
//   for(const i in lotes["features"]){
//     if(lotes["features"][i]["c"].length == 5){
//       total += 1;
//       let larea = parseInt(lotes["features"][i]["a"]);
//       if(larea >= area-2 && larea <= area+2){
//         if(compro(lotes["features"][i]["c"],dim)){
//           c += 1;
//         }
//       }
//     }
//   }
//   return [c.toString(), (c/total*100).toFixed(2).toString() + "%"];
// }

// function buscar(area){
//   let error = 2;
//   let c = 0;
//   let total = 266300;
  
//   area = parseInt(area);
//   console.log(area-error, area+error);
  
//   for(const i in lotes["features"]){
//     if(lotes["features"][i]["a"] > (area-error) && lotes["features"][i]["a"] < (area+error)){
//       c+=1;
//     }
//   }
//   return [c.toString(), (c/total*100).toFixed(2).toString() + "%"];
// }

// app.get("/tab", (request, response) => {
//   response.render('tab', {area: 0, cant1: '0', prcntj1: '0%', cant2: '0', prcntj2: '0%'});
// });

// app.post("/area", (request, response) => {
//   let A = buscar(request.body.area);
//   response.render('tab', {area: request.body.area, cant1: A[0], prcntj1: A[1], cant2: 0, prcntj2: 0});
// });

// app.post("/dim", (request, response) => {
//   let stringg = request.body.dim;
//   let a= stringg.substr(0, stringg.indexOf(' ')); 
//   let A = ml(parseInt(a));
//   response.render('tab', {dim: request.body.dim, cant2: A[0], prcntj2: A[1], cant1: 0, prcntj1: 0});
// });

app.get("/doc/:page", (request, response) => {
  response.render('doc/' + request.params.page.substring(0,3));
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
