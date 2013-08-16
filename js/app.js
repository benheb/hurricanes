function init() {
  var width = document.width,
      height = document.height,
      velocity = [.002, -.002],
      t0 = Date.now(),
      spin = false,
      projection,
      svg,
      path;

    projection = d3.geo.orthographic()
        .scale(330)
        .translate([width / 2, height / 2])
        .clipAngle(90)
        .rotate([51.32930515638208, -0.002])
        .precision(.1);

    svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

    path = d3.geo.path()
      .projection(projection);

    svg.append("defs").append("path")
      .datum({type: "Sphere"})
      .attr("id", "sphere")
      .attr("d", path);

    svg.append("use")
        .attr("class", "stroke")
        .attr("xlink:href", "#sphere");

    svg.append("use")
        .attr("class", "fill")
      .attr("xlink:href", "#sphere");


  // load and display the World
  d3.json("data/world-110m.json", function(error, world) {
    //console.log('world', world)
      svg.insert("path")
        .datum(topojson.feature(world, world.objects.countries))
        .attr("class", "land")
        .attr("d", path);

    getHurricanes("1991");
    $('#year').html( "1991" );
    
  });

  var years = [ "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011" ];
  
  var i = 0;
  var interval = setInterval(function() {
    i++;
    
    getHurricanes( years[ i ] );
    if ( i >= years.length - 1 ) i = -1;
  },5000);
  

  function getHurricanes( year ) {
    var g = svg.append("g");

    //update year
    setTimeout( function() { $('#year').html( year ) }, 2000);

    d3.selectAll('.hurricane')
      .transition()
      .duration(900)
        .attr('opacity', 0)
        .remove();
    
    var count = 0, name = "";

    d3.json("data/hurricane-"+year+".json", function(error, hurricane) {
      //console.log('hur', hurricane, 'YEAR: ', year)
      g.selectAll("path")
        .data(topojson.feature(hurricane, hurricane.objects[ year+"hur" ]).features)
      .enter().append("path")
        .attr("class", "hurricane")
        .attr('opacity', 0)
        .attr("stroke", function(d) { 
          /*
          if ( name != d.properties.Name ) {
            count++;
            name = d.properties.Name;
            console.log('count', count )
          }
          */
          if ( d.properties.basin === "NA" ) {
            if ( d.properties.ATC_wind < 64 ) {
              return "#3498db";
            } else if ( d.properties.ATC_wind > 64 && d.properties.ATC_wind < 82 ) {
              return "#f1c40f";
            } else if ( d.properties.ATC_wind >= 82 && d.properties.ATC_wind < 95 ) {
              return "#f39c12";
            } else if ( d.properties.ATC_wind >= 95 && d.properties.ATC_wind < 112 ) {
              return "#e67e22";
            } else if ( d.properties.ATC_wind >= 112 && d.properties.ATC_wind < 136 ) {
              return "#d35400";
            } else if ( d.properties.ATC_wind >= 136 ) {
              return "#c0392b";
            }
          } else {
            return "rgb(0, 194, 255)";
          }
          
        })
        .attr("d", path)
        .transition()
          .duration(2000)
          .attr('opacity', 1);

        //if ( !spin ) rotate();
    });
  }

  function rotate() {
    spin = true;
    var λ = d3.scale.linear()
        .domain([0, width])
        .range([-180, 180]);

    var φ = d3.scale.linear()
        .domain([0, height])
        .range([90, -90]);

    d3.timer(function() {

      var t = Date.now() - t0,
          o = [λ(750) + velocity[0] * t, φ( height / 2 ) + velocity[1] * 1];

      projection.rotate(o);
      
      svg.selectAll(".land").attr("d", function( d ) {
        return path( d );
      });

      d3.selectAll('.hurricane').attr('d', function( d ) {
        //return path( d );
        var val = path( d );
        if ( !val ) {
          val = "M0 0";
        }
        return val;
      });

    });
  }

  /*
  *
  * Histogram
  *
  */

  // Generate an Irwin–Hall distribution of 10 random variables.
  //var values = d3.range(1000).map(d3.random.irwinHall(10));

  var values = [ 94, 119, 97, 111, 93, 107, 112, 98, 105,109, 99, 96, 100, 98, 119, 95, 89, 102, 98, 89, 93 ]

  var chart = d3.select("#hurricane-chart").append("svg")
      .attr("width", 800)
      .attr("height", 200)
  

  var max = 119, w = 800 / values.length, h = 200;
  $.each( values, function(i, val) {
    var left = w * i;
    chart.append("rect")
      .attr("x",  left)
      .attr("y", ( h - val ))
      .attr('width', w - 2)
      .attr("height", val );
  });
  
}
