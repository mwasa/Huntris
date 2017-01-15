import PointFactory from './point/PointFactory';
import blockScheme from '../scheme/block-scheme';

class Block {
    static createBlock(typeNumber) {
        const blockCode = Object.keys(blockScheme)[typeNumber];
        const props = Object.assign({}, blockScheme[blockCode]);
        return new Block(props);
    }

    static createRandomBlock() {
        const randomType = parseInt(Math.random() * Object.keys(blockScheme).length, 10);
        return Block.createBlock(randomType);
    }

    constructor(props = {}) {
        this.props = props;
        this.type = props.type;
        this.color = props.color;
        this.point = PointFactory.createPoint(
            props.rotateType,
            props.point.x,
            props.point.y,
            props.relPoints
        );
    }

    rotate(blockTable) {
        this.point.rotate(blockTable);
    }

    down(blockTables) {
        return this.point.down(blockTables);
    }

    drop(blockTables) {
        while (true) {
            const isMoved = this.down(blockTables);
            if (isMoved === false) {
                return;
            }
        }
    }

    left(blockTables) {
        this.point.left(blockTables);
    }

    right(blockTables) {
        this.point.right(blockTables);
    }

    moveTo({ x, y }) {
        this.point.x = x;
        this.point.y = y;
    }
}

export default Block;