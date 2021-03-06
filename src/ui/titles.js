//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Draws appropriate titles
//------------------------------------------------------------------------------
d3plus.ui.titles = function(vars) {

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // If there is no data or the title bar is not needed,
  // set the total value to 'null'
  //----------------------------------------------------------------------------
  if (!vars.data.app || !vars.title.total.value || vars.small) {
    var total = null
  }
  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Otherwise, let's calculate it!
  //----------------------------------------------------------------------------
  else {

    if (vars.dev.value) {
      d3plus.console.group("Calculating Total Value")
      d3plus.console.time(vars.size.key)
    }

    var total_key = vars.size.key ? vars.size.key
      : vars.color.type == "number" ? vars.color.key : null

    if (vars.focus.value) {
      var total = vars.data.app.filter(function(d){
        return d[vars.id.key] == vars.focus.value
      })
      total = d3.sum(total,function(d){
        return d3plus.variable.value(vars,d,total_key)
      })
    }
    else if (total_key) {
      var total = d3.sum(vars.data.pool,function(d){
        return d3plus.variable.value(vars,d,total_key)
      })
    }

    if (total === 0) {
      total = false
    }

    if (typeof total == "number") {

      var pct = ""

      if (vars.mute.length || vars.solo.length || vars.focus.value) {

        var overall_total = d3.sum(vars.data.filtered.all, function(d){
          if (vars.time.solo.value.length > 0) {
            var match = vars.time.solo.value.indexOf(d3plus.variable.value(vars,d,vars.time.key)) >= 0
          }
          else if (vars.time.mute.value.length > 0) {
            var match = vars.time.solo.value.indexOf(d3plus.variable.value(vars,d,vars.time.key)) < 0
          }
          else {
            var match = true
          }
          if (match) {
            return d3plus.variable.value(vars,d,total_key)
          }
        })

        if (overall_total > total) {

          var pct = (total/overall_total)*100,
              ot = vars.format(overall_total,vars.size.key)

          var pct = " ("+vars.format(pct,"share")+"% of "+ot+")"

        }
      }

      total = vars.format(total,vars.size.key)
      var obj = vars.title.total.value
        , prefix = obj.prefix || vars.format("Total")+": "
      total = prefix + total
      obj.suffix ? total = total + obj.suffix : null
      total += pct

    }

    if (vars.dev.value) {
      d3plus.console.timeEnd(vars.size.key)
      d3plus.console.groupEnd()
    }

  }


  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Initialize titles and detect footer
  //----------------------------------------------------------------------------
  var title_data = []

  if (vars.footer.value) {
    title_data.push({
      "link": vars.footer.link,
      "style": vars.style.footer,
      "type": "footer",
      "value": vars.footer.value
    })
  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // If not in "small" mode, detect titles available
  //----------------------------------------------------------------------------
  if (!vars.small) {

    if (vars.title.value) {
      title_data.push({
        "link": vars.title.link,
        "style": vars.style.title,
        "type": "title",
        "value": vars.title.value
      })
    }
    if (vars.title.sub.value) {
      title_data.push({
        "link": vars.title.sub.link,
        "style": vars.style.title.sub,
        "type": "sub",
        "value": vars.title.sub.value
      })
    }
    if (vars.title.total.value && total) {
      title_data.push({
        "link": vars.title.total.link,
        "style": vars.style.title.total,
        "type": "total",
        "value": total
      })
    }

  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Title positioning
  //----------------------------------------------------------------------------
  function position(title) {

    title
      .attr("text-anchor",function(t){

        var align = t.style.font.align

        if (align == "center") {
          return "middle"
        }
        else if ((align == "left" && !d3plus.rtl) || (align == "right" && d3plus.rtl)) {
          return "start"
        }
        else if ((align == "left" && d3plus.rtl) || (align == "right" && !d3plus.rtl)) {
          return "end"
        }

      })
      .attr("x",function(t){

        var align = t.style.font.align

        if (align == "center") {
          return vars.width.value/2
        }
        else if ((align == "left" && !d3plus.rtl) || (align == "right" && d3plus.rtl)) {
          return vars.style.padding
        }
        else if ((align == "left" && d3plus.rtl) || (align == "right" && !d3plus.rtl)) {
          return vars.width.value-vars.style.padding
        }

      })
      .attr("y",0)

  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Enter Titles
  //----------------------------------------------------------------------------
  function style(title) {

    title
      .attr("font-size",function(t){
        return t.style.font.size
      })
      .attr("fill",function(t){
        return t.link ? vars.style.link.font.color : t.style.font.color
      })
      .attr("font-family",function(t){
        return t.link ? vars.style.link.font.family : t.style.font.family
      })
      .attr("font-weight",function(t){
        return t.link ? vars.style.link.font.weight : t.style.font.weight
      })
      .style("text-decoration",function(t){
        return t.link ? vars.style.link.font.decoration : t.style.font.decoration
      })
      .style("text-transform",function(t){
        return t.link ? vars.style.link.font.transform : t.style.font.transform
      })

  }

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Enter Titles
  //----------------------------------------------------------------------------
  if (vars.dev.value) d3plus.console.log("Drawing Titles")
  var titles = vars.svg.selectAll("g.d3plus_title")
    .data(title_data,function(t){
      return t.type
    })

  var title_width = vars.style.title.width || vars.width.value

  titles.enter().append("g")
    .attr("class","d3plus_title")
    .attr("opacity",0)
    .attr("transform",function(t){
      var y = t.style.position == "top" ? 0 : vars.height.value
      return "translate(0,"+y+")"
    })
    .append("text")
      .call(position)
      .call(style)

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Wrap text and calculate positions, then transition style and opacity
  //----------------------------------------------------------------------------
  titles
    .each(function(d){

      d3plus.util.wordwrap({
        "text": d.value,
        "parent": d3.select(this).select("text").node(),
        "width": title_width,
        "height": vars.height.value/8,
        "resize": false
      })

      d.y = vars.margin[d.style.position]
      vars.margin[d.style.position] += this.getBBox().height + d.style.padding*2

    })
    .on(d3plus.evt.over,function(t){
      if (t.link) {
        d3.select(this)
          .transition().duration(vars.style.timing.mouseevents)
          .style("cursor","pointer")
          .select("text")
            .attr("fill",vars.style.link.hover.font.color)
            .attr("font-family",vars.style.link.hover.font.family)
            .attr("font-weight",vars.style.link.hover.font.weight)
            .style("text-decoration",vars.style.link.hover.font.decoration)
            .style("text-transform",vars.style.link.hover.font.transform)
      }
    })
    .on(d3plus.evt.out,function(t){
      if (t.link) {
        d3.select(this)
          .transition().duration(vars.style.timing.mouseevents)
          .style("cursor","auto")
          .select("text")
            .call(style)
      }
    })
    .on(d3plus.evt.click,function(t){
      if (t.link) {
        var target = t.link.charAt(0) != "/" ? "_blank" : "_self"
        window.open(t.link,target)
      }
    })
    .transition().duration(vars.timing)
      .attr("opacity",1)
      .attr("transform",function(t){
        var pos = t.style.position,
            y = pos == "top" ? 0+t.y : vars.height.value-t.y
        if (pos == "bottom") {
          y -= this.getBBox().height+t.style.padding
        }
        else {
          y += t.style.padding
        }
        return "translate(0,"+y+")"
      })
      .select("text")
        .call(position)
        .call(style)

  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Exit unused titles
  //----------------------------------------------------------------------------
  titles.exit().transition().duration(vars.timing)
    .attr("opacity",0)
    .remove()

  var min = vars.style.title.height
  if (min && vars.margin[vars.style.title.position] < min) {
    vars.margin[vars.style.title.position] = min
  }

}
