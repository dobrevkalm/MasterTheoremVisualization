export default class TreeLevel {
    constructor(level, value, noOfNodes, workPerNode) {
        this.level = level;
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