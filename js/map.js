const canvas_w  =   1500;
const canvas_h  =   1000;

let projection  =   d3.geoMercator()
                          .center( [ 32, 45 ] )
                          .translate( [ canvas_w / 1.5, canvas_h / 1.5 ] )
                          .scale( [ canvas_w / 1.5] );

let path        =   d3.geoPath()
                          .projection( projection );
                          
let svg         =   d3.select( '#mapas' )
                      .append( 'svg' )
                      .attr( 'width', canvas_w )
                      .attr( 'height', canvas_h);                          

d3.json( './json/euro.json').then( function ( data ) {
    let colour = '#008899'
    svg.selectAll( 'path')
       .data( data.features )
       .enter()
       .append( 'path' )
       .attr( 'd', path)
       .attr( 'fill', colour  )
       .attr( 'stroke', '#ffff' )
       .on('mouseover', function () {
            d3.select(this)
              .attr('fill', '#BDFFF6' );
        })
       .on('mouseout', function () {
            d3.select(this)
              .attr('fill', colour );
        });
});