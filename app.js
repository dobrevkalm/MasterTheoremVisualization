const svg = d3.select('svg')
// change to window.innerWidth and innerHeight when not testing
    .attr('width', 800)
    .attr('height', 600)
    .attr('class', 'svg_container');

(function listenForEnterPress() {
    document.addEventListener('keypress', e => {
        if(e.which == 13) drawMergeSort();
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

var totalNodes = 0;
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

function getParameters() {
    var N = parseInt(document.getElementById('N').value),
        a = parseInt(document.getElementById('a').value),
        b = parseInt(document.getElementById('b').value),
        // not yet used
        c = parseInt(document.getElementById('c').value);

    if(isNaN(N) || isNaN(a) || isNaN(b) || isNaN(c)) {
        alert("Missing parameter!");
        return;
    }

    // if b is one then levels below are = to infinity, thus, we loop forever QQ
    if(b < 2) {
        alert("Paramether b must be at least 2!");
        return;
    }

    return {
        "N": N,
        "a": a,
        "b": b,
        "c": c
    };
}

function drawMergeSort() {
    var params = getParameters();

    // clear the SVG
    svg.html("");

    // draw the root
    var root = createNode((svg.attr('width'))/2, rootY, rootY + nodeH, defaultColor, params.N);

    (function drawMergeSortNodes(root, currentLevel = 1) {
        var nodeColor = defaultColor;
        console.log("We start with root -> ", root);
        // calculate the number of levels
        var levels = Math.log(params.N) / Math.log(params.b),
        // how many nodes per lvl
            nodes = params.a,
        // distance between the level nodes
            nodeDist = Math.pow(nodeGap, levels) * params.a;
        console.log("levels -> ", levels);
        // draw all the levels
        while (currentLevel < levels) {
            // change node color
            nodeColor = lightenColor(nodeColor, currentLevel*(20/levels));
            // the width of the node
            var nodeW = root.attr('stroke-width') / params.b,
            // node Y position
                nodeY = parseInt(root.attr('y2')) + levelDist,
            // node X position
                nodeX = svg.attr('width')/2 - ((nodes-1)*nodeW)/2 - ((nodes-1)*nodeDist)/2,
                currNode = 0;
            console.log("Doing level ", currentLevel, " it has ", nodes, " nodes with nodeWidth: ", nodeW);
            // draw all the nodes per level
            while (currNode < nodes && totalNodes < params.N) {
                var node = createNode(nodeX, nodeY, nodeY + nodeH, nodeColor, nodeW);
                if (currNode == 0) root = node;
                nodeX += nodeW + nodeDist;
                currNode++;
            }
            currentLevel++;
            nodes *= params.b;
            nodeDist /= nodeGap;
        }
    })(root)
    console.log("Total nodes: ", totalNodes);
    totalNodes = 0;
}