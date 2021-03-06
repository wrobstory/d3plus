d3plus.zoom.mouse = function(vars) {

  var translate = d3.event.translate,
      scale = d3.event.scale,
      limits = vars.zoom.bounds,
      xoffset = (vars.app_width-(vars.zoom.size.width*scale))/2,
      xmin = xoffset > 0 ? xoffset : 0,
      xmax = xoffset > 0 ? vars.app_width-xoffset : vars.app_width,
      yoffset = (vars.app_height-(vars.zoom.size.height*scale))/2,
      ymin = yoffset > 0 ? yoffset : 0,
      ymax = yoffset > 0 ? vars.app_height-yoffset : vars.app_height

  // Auto center visualization
  if (translate[0]+limits[0][0]*scale > xmin) {
    translate[0] = -limits[0][0]*scale+xmin
  }
  else if (translate[0]+limits[1][0]*scale < xmax) {
    translate[0] = xmax-(limits[1][0]*scale)
  }

  if (translate[1]+limits[0][1]*scale > ymin) {
    translate[1] = -limits[0][1]*scale+ymin
  }
  else if (translate[1]+limits[1][1]*scale < ymax) {
    translate[1] = ymax-(limits[1][1]*scale)
  }

  vars.zoom_behavior.translate(translate).scale(scale)

  vars.zoom.translate = translate
  vars.zoom.scale = scale

  if (d3.event.sourceEvent.type == "wheel") {
    var delay = vars.timing ? 100 : 500
    clearTimeout(vars.zoom.wheel)
    vars.zoom.wheel = setTimeout(function(){
      d3plus.zoom.labels(vars)
    },delay)
  }
  else {
    d3plus.zoom.labels(vars)
  }

  if (d3.event.sourceEvent.type == "dblclick") {
    d3plus.zoom.transform(vars,vars.style.timing.transitions)
  }
  else {
    d3plus.zoom.transform(vars,0)
  }

}
