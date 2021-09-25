function show_table(){
  if(document.getElementById("side").style.display == "block"){
    document.getElementById("side").style.background_color = "#eee";
    document.getElementById("side").style.display = "none"; 
  }else{
    document.getElementById("side").style.background_color = "#ccc";
    document.getElementById("side").style.display = "block"; 
  }
}