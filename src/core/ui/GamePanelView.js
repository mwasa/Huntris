import autobind from 'autobind-decorator';

import Block from '../models/Block';
import Board from '../models/Board';
import MessageBoxView from './MessageBoxView';

import { SPACE, LEFT, UP, RIGHT, DOWN, PERIOD } from '../../consts/keycode';

class GamePanelView {

    constructor(props) {
        this._initProps(props);
        this._attachKeyHandler();

        const controlBlock = this._createControlBlock();
        this._attachBlockListener(controlBlock);

        this.controlBlock = controlBlock;
        this.messageBoxView = this._createMessageBoxView();
    }

    play() {
        this._startTick();
    }

    _initProps(props) {
        this.tickInterval = 700;

        this.unitSize = props.unitSize;
        this.width = props.colCount * this.unitSize;
        this.height = props.rowCount * this.unitSize;

        this.canvas = props.canvas;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');

        this.board = new Board({
            rowCount: props.rowCount,
            colCount: props.colCount
        });
        this.messageBoxView;
        this.controlBlock;
    }

    _createMessageBoxView() {
        const messageBoxView = new MessageBoxView();
        messageBoxView.appendTo(this.canvas.parentNode || document.body);

        return messageBoxView;
    }

    _attachKeyHandler() {
        document.body.addEventListener('keyup', this._onKeyUp.bind(this));
    }

    _onKeyUp(e) {
        const { keyCode } = e;
        this._actionByKeyCode(keyCode);
    }

    _actionByKeyCode(keyCode) {
        const { blockTable } = this.board;

        switch (keyCode) {
        case SPACE:
            this.controlBlock.drop(blockTable);
            this._changeToNextBlock();
            break;
        case LEFT:
            this.controlBlock.left(blockTable);
            break;
        case UP:
            this.controlBlock.rotate(blockTable);
            break;
        case RIGHT:
            this.controlBlock.right(blockTable);
            break;
        case DOWN:
            this.controlBlock.down(blockTable);
            break;
        case PERIOD:
            this._speedUp();
            break;
        default:
        }
    }

    _changeToNextBlock() {
        const currentBlock = this.controlBlock;
        const newBlock = this._createControlBlock();

        this.board.putBlock(currentBlock);
        this._removeBlockListener(currentBlock);
        this._attachBlockListener(newBlock);

        this.controlBlock = newBlock;
    }

    _attachBlockListener(block) {
        block.on('changed', this._onControlBlockChanged);
    }

    _removeBlockListener(block) {
        block.removeListener('changed', this._onControlBlockChanged);
    }

    _createControlBlock() {
        const newBlock = Block.createRandomBlock();
        const { x } = newBlock.point;
        const entryY = 3;
        const entryX = Math.floor(this.board.colCount / 2) + x;

        newBlock.moveTo({ x: entryX, y: entryY, });
        return newBlock;
    }

    _canKeepPlaying() {
        return this.board.isNonadditive(this.controlBlock);
    }

    _startTick() {
        this._timerForPlay = setInterval(() => {
            if (this._canKeepPlaying()) {
                this._terminateTick();
                this.messageBoxView.showWithMessage('Game Over');
            } else {
                this._tick();
            }
        }, this.tickInterval);
    }

    _terminateTick() {
        clearInterval(this._timerForPlay);
    }

    _tick() {
        const wasMoved = this._dropControlBlockDown();
        if (wasMoved) {
            return;
        }
        this._changeToNextBlock();
    }

    _decreaseTickInterval() {
        this.tickInterval -= 100;
    }

    _speedUp() {
        this._terminateTick();
        this._decreaseTickInterval();
        this._startTick();
    }

    _dropControlBlockDown() {
        const { board, controlBlock } = this;
        return controlBlock.down(board.blockTable);
    }

    @autobind
    _onControlBlockChanged() {
        this._render();
    }

    _render() {
        this._clear();
        this._drawAll();
    }

    _clear() {
        const { width, height } = this;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);
    }

    _drawAll() {
        this._drawControlBlock();
        this._drawBlockTables();
    }

    _drawControlBlock() {
        const ctx = this.ctx;
        const unitSize = this.unitSize;
        const { point, color } = this.controlBlock;
        const { x, y, relPoints } = point;

        ctx.fillStyle = color;
        ctx.strokeStyle = '#000';

        relPoints.forEach((relPt) => {
            this._drawBlockUnit(
                (relPt.x + x) * unitSize,
                (relPt.y + y) * unitSize,
                unitSize,
            );
        });
    }

    _drawBlockTables() {
        const { ctx, unitSize, board } = this;
        const { blockTable } = board;
        const EMPTY = false;

        ctx.strokeStyle = '#000';

        blockTable.forEach((row, i) => {
            row.forEach((column, j) => {
                const color = blockTable[i][j];
                if (color === EMPTY) {
                    return;
                }

                ctx.fillStyle = color;
                this._drawBlockUnit(j * unitSize, i * unitSize, unitSize);
            });
        });
    }

    _drawBlockUnit(startX, startY, unitSize) {
        this.ctx.fillRect(startX, startY, unitSize, unitSize);
        this.ctx.strokeRect(startX, startY, unitSize, unitSize);
    }
}

export default GamePanelView;
