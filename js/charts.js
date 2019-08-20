// =============================================================
// =============================================================
// SUPPORT FUNCTIONS

function getWidth( id ) { 
    return document.getElementById( id ).clientWidth;
}

function getHeight( id ) { 
    return document.getElementById( id ).clientHeight;
}

function randBetween(min, max){
    return Math.floor(Math.random() * (max - min) + min);
}

function getRandomHex() {
    return "#" + Math.random().toString(16).slice(2, 8);
}

function invertHex(hex) {
    return '#' + (Number(`0x1${hex.replace('#', '')}`) ^ 0xFFFFFF).toString(16)
                                                 .substr(1)
                                                 .toUpperCase()
}

function updateTagText( id ) {
    let old = document.getElementById( id ).firstChild.nodeValue.trim();
    let base = old.slice(0 , old.length - 4);
    let year = Number(old.slice(old.length - 4,old.length));
    year += 1;
    document.getElementById( id ).firstChild.nodeValue =  base + year.toString();
}

function generateRandomData(factor, bar_number) {
// generate random data for the bar graph
    let dados = []

    // generate array of random numbers
    for (let i = 0; i < bar_number; i++){
        let aux = Math.floor(Math.random() * factor);
        dados.push(aux);
    }
    return dados;
}

function insertBars(svg, dados, x_scale, y_scale, svg_height) {
// bind data to the svg and insert bars
    let colour = getRandomHex();
    let inv_colour = invertHex(colour);
    let bars = svg.selectAll('rect')
                    .data( dados )
                    .enter()
                    .append('rect')                    
                    .attr('fill', colour )  //'#7ED26D') //green
                    .attr('x', function( d, i ){ return x_scale( i ); } )
                    .attr('y', function ( d ) {return svg_height - y_scale( d ) } )
                    .attr('width', x_scale.bandwidth() )
                    .attr('height', function ( d ) {return y_scale( d ) } )
                    .on('mouseover', function () {
                        d3.select(this)
                          .attr('fill', inv_colour );
                    })
                    .on('mouseout', function () {
                        d3.select(this)
                          .attr('fill', colour );
                    });
    return bars;
}                

function insertBarsLabels (svg, dados, x_scale, y_scale, svg_height) {
// add text labels to the bar chart
    let text_labels = svg.selectAll('text')
                        .data( dados )
                        .enter()
                        .append('text')
                        .text(function(d){return d})
                        .attr('x', function( d, i ){return x_scale(i) + (x_scale.bandwidth() / 2);})
                        .attr('y', function ( d ) {return svg_height - y_scale( d ) - 5 }) // to place on top of the bar
                        //.attr('fill', '#fff')                                                          // case inside, font might be white
                        .attr('font-size', 15)
                        .attr('text-anchor', 'middle')
                        .attr('fill', '#FFFF');
                        
    return text_labels;
}

function insertAxis(svg, svg_height, x_axis) {
// add axis for the bar chart
    let axis = svg.append('g')
                    .attr('class', 'x_axis')
                    .attr('transform', 'translate(0, ' + (svg_height + 20)  +  ')')
                    .call(x_axis)
                    .call(g => g.select(".domain").remove());
    return axis;

}

function resizeGraphs(){
    for (let i = 0 ; i < charts.length ; i++ ) {
        let chart = charts[i];
        let new_width = getWidth( chart ) * (area_usage + 0.05);

        // create a new x_scale for the resized area
        let x_scale = d3.scaleBand()
                    .domain( d3.range( bar_number ) )
                    .rangeRound( [ 0, new_width * 0.97 ] )
                    .paddingInner( bar_padding );

        // resize SVG
        let svg =  d3.select( '#' + chart + ' svg');
        svg.attr('width', new_width);

        // resize RECT elements
        d3.selectAll( '#' + chart + ' svg rect')
          .transition()
          .attr('x', function( d, i ){ return x_scale( i ); } )
          .attr('width', x_scale.bandwidth());
        
        // resize LABELS
        d3.selectAll( '#' + chart + ' svg text')
          .transition()
          .attr('x', function( d, i ){return x_scale(i) + (x_scale.bandwidth() / 2);});

        // resize AXIS
        let ord_scale = d3.scaleBand()
            .domain( months )
            .range( [0, new_width * 0.98]);

        let x_axis = d3.axisTop()
            .scale(ord_scale)
            .tickSizeInner(0)    // remove axis lines and ticks
            .tickSizeOuter(0);           

        svg.select('.x_axis').remove();     // remove old axis
        insertAxis(svg, svg_height, x_axis) // apply new axis
    }
}

function plotPieChart() {
    let width = getWidth( 'pie_chart_5' ) * (area_usage);
    let height = 450 * area_usage; 
    let margin = 30;
    let radius = Math.min(width, height) / 2 - margin
}

// ========================================================================================
// ========================================================================================
// ************** MAIN  **************

let charts = [ 'chart_1' , 'chart_2', 'chart_3', 'chart_4', 'chart_5' ];
let months = [ 'Jan',  'Feb',  'Mar',  'Apr',
               'May',  'Jun',  'Jul',  'Aug',
               'Sep',  'Oct',  'Nov',  'Dec' ]
let mult_factor = 250;                    // factor to multiply random data
let bar_padding = 0.05;                  // space between bars
let area_usage = 0.9;
let svg_height = getHeight('chart_1') * area_usage;
let bar_number =  months.length; 

for (let i = 0 ; i < charts.length ; i++ ) {
// iterate over each chart and create SVGs
    let chart = charts[ i ];
    let svg_width = getWidth( chart ) * (area_usage + 0.05);
    
    // hardcoded for 12 months
    //let bar_number =  months.length; //randBetween(9, 18);    // number of bars to plot
    
    // generate random array
    let dados = generateRandomData(mult_factor, bar_number);
    console.log(dados);
    
    // scales
    let x_scale = d3.scaleBand()
                    .domain( d3.range( bar_number ) )
                    .rangeRound( [ 0, svg_width * 0.97 ] )
                    .paddingInner( bar_padding );
    
    let y_scale = d3.scaleLinear()
                    .domain( [ 0, d3.max( dados )  ] ) 
                    .range( [ 0, svg_height * area_usage ] ); // leave 10% free

    let ord_scale = d3.scaleBand()
                      .domain( months )
                      .range( [0, svg_width * 0.98]);                            

    let svg = d3.select( '#' + chart )
                .append('svg')
                .attr('width', svg_width)
                .attr('height', svg_height * 1.05);

    let x_axis = d3.axisTop()
                   .scale(ord_scale)
                   .tickSizeInner(0)    // remove axis lines and ticks
                   .tickSizeOuter(0);

    insertBars(svg, dados, x_scale, y_scale, svg_height);
    insertBarsLabels(svg, dados, x_scale, y_scale, svg_height);
    insertAxis(svg, svg_height, x_axis);
}

// ========================================================================================
// ========================================================================================
// ************** EVENTS **************
window.addEventListener("resize", resizeGraphs);

// refresh data when button clicked
d3.selectAll('.button')
    .on('click', function() {
        console.log('You clicked on button for chart ' + this.parentNode.id);
        
        let chart = this.parentNode.id;
        // change tag text
        updateTagText( chart );

        let new_data = generateRandomData(mult_factor, bar_number);    // generate new data
        let y_scale = d3.scaleLinear()
                        .domain( [ 0, d3.max( new_data )  ] ) 
                        .range( [ 0, svg_height * area_usage ] ); // redefine y scale
        
        let svg =  d3.select( '#' + chart + ' svg');
        
        // update rectangles
        let colour = getRandomHex();
        let inv_colour = invertHex(colour);
        let rect = svg.selectAll('rect')

        // update colors when mouse hover
        rect.on('mouseover', function () {
            d3.select(this)
              .attr('fill', inv_colour );
            })
            .on('mouseout', function () {
                d3.select(this)
                .attr('fill', colour );
            });

        // update chart data    
        rect.data(new_data)
            .transition()
            .duration(800)
            .attr('fill', colour)
            .attr('y', function ( d ) {return svg_height - y_scale( d ) } )
            .attr('height', function ( d ) {return y_scale( d )});

        // update chart labels
        svg.selectAll('text')
            .data(new_data)
            .transition()
            .duration(800)
            .text( function( d ){ return d } )
            .attr('y', function ( d ) {return svg_height - y_scale( d ) - 5})
    });
/*
colors = [
'#e8ce86',
'#007cce',
'#95da9d',
'#c7e32f',
'#931ee2',
'#7f5240',
'#38b39a',
'#75dc31',
'#9b283e'
]
*/