const svg = d3.select('svg')
    // use these width and height in dev
    .attr('width', 800)
    .attr('height', 600)
    // actual width and height
/*  .attr('width', window.innerWidth)
    .attr('height', window.innerHeight) */
    .attr('class', 'svg_container');

// allow drowing with enter press
(function listenForEnterPress() {
    document.addEventListener('keypress', e => {
        if(e.which == 13) drawRecuerenceRelationTree(1);
})})();

// will brighten up given hex color with given percent
function lightenColor(color, percent) {
    var num = parseInt(color.replace("#", ""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        B = (num >> 8 & 0x00FF) + amt,
        G = (num & 0x0000FF) + amt;

    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
};

// root position from top
const rootY = 30,
// node height
    nodeH = 30,
// distane between tree levels
    levelDist = 20,
// this will be used to calculate the distance between the nodes
    nodeGap = 1.5;
// node color
var defaultColor = "#000050";

// keep track of the total nodes drawn
var totalNodes = 0;

// has mode 2 been enabled
var mode2 = true;

// create a single node
function createNode(x, y1, y2, color, width) {
    totalNodes++;
    return svg.append('line')
        // position on the svg
        .attr('x1', x)
        .attr('x2', x)
        // y1 and y2 are the height of the node
        .attr('y1', y1)
        .attr('y2', y2)
        // color of the node
        .attr('stroke', color)
        // the width of the node
        .attr('stroke-width', width);
}

// get the input parameters
function getParameters() {
    var N = parseInt(document.getElementById('N').value),
        a = parseInt(document.getElementById('a').value),
        b = parseInt(document.getElementById('b').value),
        // not yet used
        c = parseInt(document.getElementById('c').value);

    var params = {
        "N": N,
        "a": a,
        "b": b,
        "c": c
    }

    for(var i in params) {
        // make sure we have all parameters
        if(isNaN(params[i])) {
            alert("Missing parameter!");
            return;
        }
        // if b is one then levels below are = to infinity
        if(i === "b" && params[i] < 2) {
            alert("Parameter b can't be smaller than 2!");
            return;
        }
    }

    return params;
}

function drawRecuerenceRelationTree(mode) {
    var params = getParameters();

    // clear the SVG
    svg.html("");

    // draw the root
    var root = createNode((svg.attr('width'))/2, rootY, rootY + nodeH, defaultColor, params.N);
    
    // draw the tree nodes
    drawTreeNodes(root, params, mode);
    console.log("Total nodes: ", totalNodes);

    // reset the total nodes
    totalNodes = 0;

    // enable mode 2
    if(mode2) initMode2();
}

function drawTreeNodes(root, params, mode) {
    // root for the current level
    var currentRoot = root,
    // current level
        currentLevel = 1,
    // color for the current level
        nodeColor = defaultColor;
    console.log("We start with root -> ", root);
    // calculate the number of levels
    var levels = Math.log(params.N) / Math.log(params.b),
    // how many nodes per lvl
        nodes = params.a,
    // distance between the level nodes
        nodeDist = 0;
    // only mode 1 has distance between the nodes
    if(mode == 1) nodeDist = Math.pow(nodeGap, levels) * params.a;
    console.log("levels -> ", levels);
    // draw all the levels
    while (currentLevel < levels) {
        // change node color
        nodeColor = lightenColor(nodeColor, currentLevel*(20/levels));
        // the width of the node
        var nodeW = currentRoot.attr('stroke-width') / params.b,
        // node Y position
            nodeY = parseInt(currentRoot.attr('y2')) + levelDist,
        // node X position
            nodeX = svg.attr('width')/2 - ((nodes-1)*nodeW)/2,
            currNode = 0;
        // keep into account the distance between the nodes for mode 1
        if(mode == 1) nodeX -= ((nodes-1)*nodeDist)/2;
        console.log("Doing level ", currentLevel, " it has ", nodes, " nodes with nodeWidth: ", nodeW);
        // draw all the nodes per level
        while (currNode < nodes && totalNodes < params.N) {
            var node = createNode(nodeX, nodeY, nodeY + nodeH, nodeColor, nodeW);
            if (currNode == 0) currentRoot = node;
            nodeX += nodeW + nodeDist;
            currNode++;
        }
        currentLevel++;
        nodes *= params.b;
        nodeDist /= nodeGap;
    }
}

// creates the button for mode 2
function initMode2(){
    // set mode2 to false
    mode2 = false;
    // container needed to avoid redundant styling
    var btnContainer = document.createElement('div'),
        btn = document.createElement('button');
    // set btn attributes
    btn.innerText = "Mode 2";
    btn.id = "m2";
    // to draw mode 2 on click
    btn.addEventListener('click', () => {
        if(btn.innerText === "Mode 2") drawMode2();
        else {
            drawRecuerenceRelationTree(1);
            btn.innerText = "Mode 2";
        }
    });
    // append the button
    btnContainer.appendChild(btn);
    document.getElementById('inputContainer').appendChild(btnContainer);
};

function drawMode2() {
    var btn = document.getElementById('m2');
    btn.innerText = "Mode 1";
    drawRecuerenceRelationTree(2);
}