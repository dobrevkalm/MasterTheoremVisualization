import Tree from './tree.js';

const svg = d3.select('svg')
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight - 65)
    .attr('class', 'svg_container');

// allow drowing with enter press
document.addEventListener('keypress', e => {
    var key = e.which || e.keyCode;
    if (key == 13) {
        var current = document.getElementsByClassName("active");
        if (current.length > 0) {
            current[0].className = current[0].className.replace("active", "");
        }
        document.getElementById("mode1").className = "active";
        drawRecuerenceRelationTree(1);
    }
});

//add button listeners
var btns = document.getElementsByTagName("button");
for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function () {
        var current = document.getElementsByClassName("active");
        if (current.length > 0) {
            current[0].className = current[0].className.replace("active", "");
        }
        this.className = "active";
        drawRecuerenceRelationTree(parseInt(this.value));
    });
}

function drawTree(tree, mode) {
    var svgHeight = svg.attr('height');
    var svgMiddleX = svg.attr('width') / 2;
    var noOfTreeLevels = tree.noOfTreeLevels;
    var spaceBetweenNodeLevels = 20;
    var colorVar = 0.5;
    var colorGradient = 0.5 / noOfTreeLevels;
    // calculate nodeHeight in a way that there is 30px between levels and node height takes the rest of the window space
    // if calculated hight is bigger than 35 set on defualt height of 35 px
    var nodeHeight = Math.min((svgHeight - ((noOfTreeLevels + 1) * spaceBetweenNodeLevels)) / noOfTreeLevels, 35);
    var y = spaceBetweenNodeLevels;
    // we're in mode 1 or mode 2
    if (mode === 1 || mode === 2) {
        for (var i = 0; i < tree.nodePerLevels.length; i++) {
            var treeLvl = tree.nodePerLevels[i];
            // position of the first node
            var x;
            if (mode === 1) {
                x = treeLvl.calculateX1(svgMiddleX, tree.space);
            } else {
                //there should be no space between nodes
                x = treeLvl.calculateX1(svgMiddleX, 0);
            }
            var color = d3.interpolateBlues(colorVar);
            // draw nodes for the level
            for (var nodeNo = 0; nodeNo < treeLvl.noOfNodes; nodeNo++) {
                drawNode(x, y, nodeHeight, color, treeLvl.workPerNode);
                // adjust x for the next node
                if (mode === 1) {
                    x += treeLvl.workPerNode + tree.space;
                } else {
                    x += treeLvl.workPerNode;
                }
            }
            // adjust y for the next level of nodes
            y += nodeHeight + spaceBetweenNodeLevels;
            // adjust color
            colorVar += colorGradient;
        }
    } else {
        // we got to mode 3
        //get middle of height of the svg image
        y = svgHeight / 2 - nodeHeight;
        // mode 3 total starts to be drawn 10% to the left from the window beginning
        var x = svgMiddleX - ((tree.totalWorkDoneByTree * tree.scale) / 2);
        for (var i = 0; i < tree.nodePerLevels.length; i++) {
            var treeLvl = tree.nodePerLevels[i];
            var color = d3.interpolateBlues(colorVar);
            var workDonePerLevelScaled = treeLvl.totalWorkPerLevel * tree.scale;
            drawNode(x, y, nodeHeight, color, workDonePerLevelScaled);
            // adjust x for the next node
            x += workDonePerLevelScaled;
            // adjust color
            colorVar += colorGradient;
        }
    }

}

// create a single node
function drawNode(x, y, height, color, width) {
    return svg.append('rect')
        // position on the svg
        .attr('x', x)
        // y is the y position of rectangle
        .attr('y', y)
        // the width of the node
        .attr('width', width)
        // height of the node
        .attr('height', height)
        // color of the node
        .attr('fill', color);
}

// get the input parameters
function getParameters() {
    var params = {
        "N": parseInt(document.getElementById('N').value),
        "a": parseInt(document.getElementById('a').value),
        "b": parseInt(document.getElementById('b').value),
        "c": parseInt(document.getElementById('c').value)
    }

    for (var i in params) {
        if (isNaN(params[i])) {
            document.getElementById('formula').style.visibility = "hidden";
            alert("Missing parameter!");
            return;
        }
    }

    // if b is one then levels below are = to infinity
    if (params.b < 2) {
        document.getElementById('formula').style.visibility = "hidden";
        alert("Parameter b can't be smaller than 2!");
        return;
    }

    if (Math.log(params.N)/Math.log(params.b) % 1 !== 0) {
        document.getElementById('formula').style.visibility = "hidden";
        alert("Parameter N must be a power of parameter b!");
        return;
    }

    //display the formula
    displayFormula(params.N, params.a, params.b, params.c);

    return params;
}

function displayFormula(n, a, b, c) {
    var formula = document.getElementById('formula');
    formula.style.visibility = "visible";
    formula.innerHTML = `T(${n}) = ${a}T(${n}/${b}) + ${n}<sup>${c}</sup>`;
}

function drawRecuerenceRelationTree(mode) {
    // clear the SVG
    svg.html("");

    var params = getParameters();

    if (!params) return;
    var tree = new Tree(svg, params.N, params.a, params.b, params.c);
    console.log(tree);
    drawTree(tree, mode);
}

//draw defualt tree
drawRecuerenceRelationTree(1);