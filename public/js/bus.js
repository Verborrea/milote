function geocode(dir, mznro) {
  var req = new XMLHttpRequest();
  req.responseType = 'json';
  req.open("GET","https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDNw4XgclEE_dweeJTWGENDouXsV4Iwu6A&address=" + encodeURI(dir),true);
  req.onreadystatechange = function(aEvt) {
    if (req.readyState == 4) {
      if (req.status == 200) {
        let lareq = req.response;
        map.entities.clear();
        if(lareq.status=='OK'){
          let results = [];
          //guardar resultados relevantes y distintos
          let locations = [];
          for(let i = 0; i < lareq.results.length; i++){
            locations.push([lareq.results[i].geometry.location.lat,lareq.results[i].geometry.location.lng]);
            results.push(lareq.results[i]);
            for(let j=0;j<locations.length-1;j++){
              if(Math.round(locations[j][0]*1000)==Math.round(locations[locations.length-1][0]*1000)&&Math.round(locations[j][1]*1000)==Math.round(locations[locations.length-1][1]*1000)){
                locations.pop();
                results.pop();
              }
            }
          }
          
//           for(let i = 0;i < lareq.results.length;i++){
//             alert(results[i].formatted_address)
//           }

          // for(let k=0; k<locations.length;k++){
            let locBounds;
            //seteo vista del mapa
            if('bounds' in results[0].geometry){
              locBounds = new Microsoft.Maps.LocationRect.fromCorners(
              new Microsoft.Maps.Location(results[0].geometry.bounds.northeast.lat,results[0].geometry.viewport.southwest.lng),
              new Microsoft.Maps.Location(results[0].geometry.bounds.southwest.lat,results[0].geometry.viewport.northeast.lng));
            }else{
              locBounds = new Microsoft.Maps.LocationRect.fromCorners(
              new Microsoft.Maps.Location(results[0].geometry.viewport.northeast.lat,results[0].geometry.viewport.southwest.lng),
              new Microsoft.Maps.Location(results[0].geometry.viewport.southwest.lat,results[0].geometry.viewport.northeast.lng));
            }

        
  //         document.getElementById('distrito').value = results[k].geometry.bounds.northeast.lat.toString() +' '+ results[k].geometry.bounds.southwest.lng.toString();
  //         document.getElementById('calle').value = results[k].geometry.bounds.southwest.lat.toString() +' '+ results[k].geometry.bounds.northeast.lng.toString();;

            map.setView({bounds:locBounds});

            setTimeout(function(){
              //calculo los lotes dentro de la vista en un array ncuads
              let vb = map.getBounds().bounds;
              let nlim = [Math.floor((vb[0]-cuad[0][1])/pasoy),Math.floor((vb[3]-cuad[0][0])/pasox),Math.floor((vb[2]-cuad[0][1])/pasoy),Math.floor((vb[1]-cuad[0][0])/pasox)];
              let ncuads = [];
              for(let i = nlim[0]; i <= nlim[2];i++){
                for(let j = nlim[1]; j <= nlim[3];j++){
                  ncuads.push(i*10+j);
                }
              }

              let posibilidades = [];
              if(mznro){
                for(let i=0;i<ncuads.length;i++){
                  let primi = lLayers[ncuads[i]].getPrimitives();
                  for(let j=0;j<primi.length;j++){
                    if(locBounds.contains(Microsoft.Maps.SpatialMath.Geometry.centroid(primi[j]))){
                      if(primi[j].metadata.title==mznro){
                        posibilidades.push(Microsoft.Maps.SpatialMath.Geometry.centroid(primi[j]));
                      }
                    }
                  }
                }
              }

              if(posibilidades.length){
                for(let i=0;i<posibilidades.length;i++){
                  let centroid = new Microsoft.Maps.Pushpin(posibilidades[i]);
                  map.entities.push(centroid);
                }
              }else{
                let push = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(locations[0][0], locations[0][1]));
                map.entities.push(push);
              }
            }, 6000);
          // }
        }
      } else alert.log("Error buscando la locación");
    }
  };
  req.send(null);
}

function buscar() {
  let direccion = "";

  let distrito = document.getElementById("distrito").value;
  let calle = document.getElementById("calle").value;
  let mznro = document.getElementById('mznro').value.replace(/-|\./,'');

  if (calle) {
    direccion += calle + " ";
  }
  if (distrito) {
    direccion += distrito + " ";
  }
  if (calle) {
    direccion += "arequipa";
    geocode(direccion, mznro);
  } else {
    alert("Debe ingresar al menos una calle para empezar a buscar");
  }
}
