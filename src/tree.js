import TreeLevel from './treeLevel.js';

export default class Tree {
    constructor(svg, n, a, b, c) {
        this.svg = svg;
        this.noOfTreeLevels = this.getNoOfTreeLevels(n, b);
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
            this.nodePerLevels[lvl] = new TreeLevel(lvl, nodeValue, noOfNodes, workPerNode);
            totalWork += noOfNodes * workPerNode;
        }
        this.totalWorkDoneByTree = totalWork;
    }

    getTreeScale() {
        //if total work done by the tree is smaller than 80% of the screen width, no scaling is needed
        if ((this.svg.attr('width') * 0.8) > this.totalWorkDoneByTree) {
            return 1;
        } else {
            //total work done by the tree in mode 3 should take 80% of the screen width 
            return (this.svg.attr('width') * 0.8) / this.totalWorkDoneByTree;
        }
    }

    calculateSpace(space) {
        var spaceSet = false;
        while (space > 1 && !spaceSet) {
            var nodesTilCenter = this.nodePerLevels[this.noOfTreeLevels - 1].noOfNodes / 2;
            var spacesBetweenNodesTilCenter = (this.nodePerLevels[this.noOfTreeLevels - 1].noOfNodes - 1) / 2;
            var distanceFromMiddle = (nodesTilCenter * this.nodePerLevels[this.noOfTreeLevels - 1].workPerNode) + spacesBetweenNodesTilCenter * space;
            if ((this.svg.attr('width') / 2) >= distanceFromMiddle) {
                spaceSet = true;
            }
            space--;
        }
        this.space = space;
    }

    getNoOfTreeLevels(n, b) {
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
}