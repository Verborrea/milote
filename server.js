const express = require("express");
const app = express();

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


app.get("/doc/:page", (request, response) => {
  response.render('doc/' + request.params.page.substring(0,3));
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
