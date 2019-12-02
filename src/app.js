document.addEventListener("DOMContentLoaded", () => {
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

    //Represents the tree level
    class TreeLvl {
        constructor(lvl, value, noOfNodes, workPerNode) {
            this.lvl = lvl;
            this.value = value;
            this.noOfNodes = noOfNodes;
            this.workPerNode = workPerNode;
            this.totalWorkPerLevel = this.calculateTotalWorkPerLvl();
            // calculates the position of the first node for the level
            this.calculateX1 = function (middleX, space) {
                var nodesTilCenter = this.noOfNodes / 2;
                var spacesBetweenNodesTilCenter = (this.noOfNodes - 1) / 2;
                var distanceFromMiddle = (nodesTilCenter * this.workPerNode) + (spacesBetweenNodesTilCenter * space);
                return middleX - distanceFromMiddle;
            };
        }

        calculateTotalWorkPerLvl() {
            return this.noOfNodes * this.workPerNode;
        }
    }

    class Tree {
        constructor(n, a, b, c) {
            this.noOfTreeLevels = getNoOfTreeLevels(n, b);
            if (this.noOfTreeLevels === -1) return;
            this.nodePerLevels = new Array();
            this.createTree(n, a, b, c);
            //scale used for mode 3
            this.scale = this.getTreeScale();
            //calculate appropriate space for nodes
            this.calculateSpace(10);
        }

        createTree(n, a, b, c) {
            var totalWork = 0;
            for (var lvl = 0; lvl < this.noOfTreeLevels; lvl++) {
                //node value
                var nodeValue = n / (Math.pow(b, lvl));
                //number of nodes in current level
                var noOfNodes = Math.pow(a, lvl);
                //work per node
                var workPerNode = Math.pow(nodeValue, c);
                this.nodePerLevels[lvl] = new TreeLvl(lvl, nodeValue, noOfNodes, workPerNode);
                totalWork += noOfNodes * workPerNode;
            }
            this.totalWorkDoneByTree = totalWork;
        }

        getTreeScale() {
            //if total work done by the tree is smaller than 80% of the screen width, no scaling is needed
            if ((svg.attr('width') * 0.8) > this.totalWorkDoneByTree) {
                return 1;
            } else {
                //total work done by the tree in mode 3 should take 80% of the screen width 
                return (svg.attr('width') * 0.8) / this.totalWorkDoneByTree;
            }
        }

        calculateSpace(space) {
            var spaceSet = false;
            while (space > 1 && !spaceSet) {
                var nodesTilCenter = this.nodePerLevels[this.noOfTreeLevels - 1].noOfNodes / 2;
                var spacesBetweenNodesTilCenter = (this.nodePerLevels[this.noOfTreeLevels - 1].noOfNodes - 1) / 2;
                var distanceFromMiddle = (nodesTilCenter * this.nodePerLevels[this.noOfTreeLevels - 1].workPerNode) + spacesBetweenNodesTilCenter * space;
                if ((svg.attr('width') / 2) >= distanceFromMiddle) {
                    spaceSet = true;
                }
                space--;
            }
            this.space = space;
        }
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
        var N = parseInt(document.getElementById('N').value),
            a = parseInt(document.getElementById('a').value),
            b = parseInt(document.getElementById('b').value),
            c = parseInt(document.getElementById('c').value);

        var params = {
            "N": N,
            "a": a,
            "b": b,
            "c": c
        }

        for (var i in params) {
            // make sure we have all parameters
            if (isNaN(params[i])) {
                alert("Missing parameter!");
                document.getElementsByClassName('formula')[0].style.visibility = "hidden";
                return;
            }
        }

        // if b is one then levels below are = to infinity
        if (params.b < 2) {
            alert("Parameter b can't be smaller than 2!");
            document.getElementsByClassName('formula')[0].style.visibility = "hidden";
            return;
        }

        var n = params.N;
        while (n > 1) {
            n /= params.b;
        }
        if (n !== 1) {
            alert("Parameter N must be a power of parameter b!");
            document.getElementsByClassName('formula')[0].style.visibility = "hidden";
            return;
        }

        //display the formula
        displayFormula(params.N, params.a, params.b, params.c);

        return params;
    }

    function displayFormula(n, a, b, c) {
        document.getElementById('formula').style.visibility = "visible";
        document.getElementById('fa').innerHTML = a;
        document.getElementById('fb').innerHTML = b;
        document.getElementById('fc').innerHTML = c;
        var nEl = document.getElementsByClassName('fn');
        Object.keys(nEl).forEach(e => nEl[e].innerHTML = n);
    }

    function drawRecuerenceRelationTree(mode) {
        // clear the SVG
        svg.html("");

        var params = getParameters();

        if (!params) return;
        var tree = new Tree(params.N, params.a, params.b, params.c);
        console.log(tree);
        drawTree(tree, mode);
    }

    function getNoOfTreeLevels(n, b) {
        if (!isNaN(n) && !isNaN(b) && n > 0 && b > 1) {
            var levels = 0;
            while (n >= 1) {
                n /= b;
                levels++;
            }
            return levels;
        }
        return -1;
    }

    //draw defualt tree
    drawRecuerenceRelationTree(1);
});