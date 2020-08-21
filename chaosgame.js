var polygon_list = [];
var temp_coordinates_list = [];
var colors = [];
var block_action = false;


const copyToClipboard = str => {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

// This function always returns a random number between min and max (both included):
function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function getRandomItem(list) {
    var random_index = getRandomInteger(0, list.length - 1);
    return list[random_index];
}

function draw_polygon(){
    if (block_action === true) {
        return;
    }
    block_action = true;

    var color = document.getElementById('current_color').value;
    colors.push(color);

    var ctx = canvas.getContext('2d');
    ctx.beginPath();

    for (item=0; item<temp_coordinates_list.length ; item+=1 ){
        ctx.lineTo(temp_coordinates_list[item][0] , temp_coordinates_list[item][1])}

    ctx.closePath();

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();

    polygon_list.push(temp_coordinates_list);

    temp_coordinates_list = [];
    block_action = false;
}


function start_chaos_game(ctx, canvas, iterations=1500000){
    if (block_action === true) {
        return;
    }
    block_action = true;

    var bg_color = document.getElementById('background_color').value;

    ctx.fillStyle = bg_color;
    canvas.style.backgroundColor = bg_color;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var switch_poly = document.getElementById('switch_poly').value;
    var switch_strategy = document.getElementById('switch-strategy').value;
    var divisor = parseFloat(document.getElementById('divisor').value);

    var polygon_index = 0;
    var color = colors[polygon_index];
    var start_point = [0, 0];

    for (i=0; i<iterations; i+=1) {
        if (i % switch_poly === 0) {
            if (switch_strategy === 'random') {
                polygon_index = getRandomInteger(0, polygon_list.length - 1);
            } else {
                polygon_index = (polygon_index + 1) % polygon_list.length;
            }
            color = colors[polygon_index % colors.length];
        }

        var random_point = getRandomItem(polygon_list[polygon_index]);
        var midpoint = [
            start_point[0] + (random_point[0] - start_point[0]) / divisor,
            start_point[1] + (random_point[1] - start_point[1]) / divisor,
        ];

        ctx.fillStyle = color;
        ctx.fillRect(midpoint[0], midpoint[1], 1, 1);

        start_point = midpoint;
    }
    block_action = false;
}


document.addEventListener('DOMContentLoaded', function(event) {
    var canvas = document.getElementById('canvas');
    canvas.width  = window.innerWidth - 4;
    canvas.height = window.innerHeight - 4;
    var ctx = canvas.getContext('2d');

    // Add points on mouse down
    canvas.addEventListener("mousedown", event => {
        let bound = canvas.getBoundingClientRect();
        let x = event.clientX - bound.left - canvas.clientLeft;
        let y = event.clientY - bound.top - canvas.clientTop;
        temp_coordinates_list.push([x, y]);

        ctx.fillStyle = '#FFF';
        ctx.fillRect(x - 1,y - 1,2,2);
    })

    document.addEventListener('keyup', event => {
        if (event.code === 'Space') {
            draw_polygon();
        }
    })
    document.getElementById('add_polygon').addEventListener("mouseup", event => {draw_polygon()});
    document.getElementById('start').addEventListener("mouseup", event => {start_chaos_game(ctx, canvas)});

    document.addEventListener('keydown', function(event) {
        // on ctrl-c: add the list of polygons to the clipboard (as a Python list of lists of tuples)
        if (event.code == 'KeyC' && (event.ctrlKey || event.metaKey)) {
            var clip_str = 'polygon_list = [\n'
            for (poly_index=0; poly_index<polygon_list.length; poly_index+=1 ){
                clip_str += '    [\n'
                for (index=0; index<polygon_list[poly_index].length; index+=1 ){
                    clip_str += '        (' + polygon_list[poly_index][index][0] + ', ' + polygon_list[poly_index][index][1] + '),\n'
                }
                clip_str += '    ],\n'
            }
            clip_str += ']'
            copyToClipboard(clip_str);
        }

        if (event.keyCode === 13) {
            start_chaos_game(ctx, canvas);
        }
    });
})
