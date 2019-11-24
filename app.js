const svgWidth = window.innerWidth,
    svgHeight = window.innerHeight;

// the SVG container
const svg = d3.select('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .attr('class', 'svg_container');

// root position from top
const rootY = 50,
// node height
    nodeH = 30,
// distane between tree levels
    levelDist = 20,
// node color
    color = '#00008b',
// this will be used to calculate the distance between the nodes
    nodeGap = 1.5;

// merge sort params
var a = 2,
    b = 2,
    c = 2;

function createNode(x, y1, y2, color, width) {
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

(function listenForEnterPress() {
    document.addEventListener('keypress', (e) => {
        if(e.which == 13) drawMergeSort();
})})();

function draw() {
    
}

function drawMergeSort() {
    var input = document.getElementById('N'),
        N = parseInt(input.value);

    // clear the SVG
    svg.html("");

    // draw the root
    var root = createNode((svg.attr('width')) / 2, rootY, rootY + nodeH, color, N);

    (function drawMergeSortNodes(root, currentLevel = 1) {
        console.log("We start with root -> ", root);
        // calculate the number of levels
        var levels = Math.log(root.attr('stroke-width')) / Math.log(b),
        // how many nodes per lvl
            nodes = a,
        // distance between the level nodes
            nodeDist = Math.pow(nodeGap, levels) * a;
            console.log("levels -> ", levels);
        // draw all the levels
        while (currentLevel < levels) {
            // the width of the node
            var nodeW = root.attr('stroke-width') / 2,
            // node Y position
                nodeY = parseInt(root.attr('y2')) + levelDist,
            // node X position
            // Here, I have NO IDEA why nodes-4 would work, however, it does... ¯\_(ツ)_/¯
                nodeX = (svgWidth - (nodes * nodeW + (nodes - 4) * nodeDist)) / 2,
                currNode = 1;
            console.log("Doing level ", currentLevel, " it has ", nodes, " nodes with nodeWidth: ", nodeW);
            // draw all the nodes per level
            while (currNode <= nodes) {
                var node = createNode(nodeX, nodeY, nodeY + nodeH, color, nodeW);
                if (currNode == 1) root = node;
                nodeX += nodeW + nodeDist;
                currNode++;
            }
            currentLevel++;
            nodes *= b;
            nodeDist /= nodeGap;
        }
    })(root)
}