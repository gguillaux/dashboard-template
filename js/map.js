// aux functions
function randBetween(min, max){
  return Math.floor(Math.random() * (max - min) + min);
}

function getWidth( id ) { 
  return document.getElementById( id ).clientWidth;
}

function resizeMap() {
  const new_w = window.innerWidth;
  const new_h = window.innerHeight * 0.88;

  svg.attr('width', new_w)
     .attr('height', new_h);

  projection.scale( [ new_w * 0.68 ] )
            .translate( [ new_w * 0.68, new_h * 0.68 ] );

  path.projection( projection );
  svg.selectAll('path')
     .transition()
     .attr('d', path);
}

// =============================================
// main part of the code
// variables declaration
let canvas_w  =   getWidth('mapas');
let canvas_h  =   window.innerHeight * 0.88;
const json_file_path = './json/euro.json';

let projection  =   d3.geoMercator()
                      .scale( [ canvas_w * 0.68 ] )
                      .translate( [ canvas_w * 0.68, canvas_h * 0.68 ] )
                      .center( [ 32, 45 ] );
                       
let color       =   d3.scaleQuantize().range([
                      // shades of blue
                      // '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf',
                      // '#3690c0', '#0570b0', '#045a8d', '#023858'
                      
                      // shades for red
                      '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a',
                      '#ef3b2c', '#cb181d', '#a50f15', '#67000d'
                      ]);                          

let path        =   d3.geoPath()
                          .projection( projection );
                          
let svg         =   d3.select( '#mapas' )
                      .append( 'svg' )
                      .attr( 'width', canvas_w )
                      .attr( 'height', canvas_h);

let tooltip     =   d3.select('body')
                      .append( 'div' )
                      .attr( 'class', 'tooltip')
                      .style( 'opacity', 0 );

// =============================================
// generate random data for countries
let countries = {};
d3.json( json_file_path ).then ( function( d ) {
  for (let i = 0; i < d.features.length; i++) {
    countries[d.features[i].properties.name]  = randBetween(0, 999) / 1000 ;
  }
});


// get data from geojson file
d3.json( json_file_path ).then( function ( data ) {

    let colour = '';
    svg.selectAll( 'path')
       .data( data.features )
       .enter()
       .append( 'path' )
       .attr( 'd', path)
       .attr( 'fill', function(d) {
         let name = d.properties.name;
         colour = color(countries[name]);
         return colour;
       })
       .attr( 'stroke', '#ffff' )
       .attr( 'stroke-width', 1 )
       .on('mouseover', function ( d ) {
            // change color
            d3.select(this)
              // light blue
              // .attr('fill', '#f7fbff' );
              .attr('fill', '#fff5f0' );
            
            // show tooltipz
            let x = d3.event.x;
            let y = d3.event.y;
            let c = d.properties.name + '<br> Sales : ' + countries[d.properties.name] * 1000 + 'M';
            tooltip.transition()
                   .style( 'opacity', .97 );
            tooltip.html( c )
                   .style( 'left', x + 'px')
                   .style( 'top', y + 'px')
                   .style( 'display', 'block');
        })
       .on('mouseout', function (d ) {
            // change color         
            d3.select(this)
              .attr('fill', color(countries[d.properties.name]));
            
            // tooltip
            tooltip.transition()
                   .style( 'opacity', 0);
        });
});

// =============================================
// events
window.addEventListener("resize", resizeMap);
