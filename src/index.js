import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button
            className={"square " + (props.isWinner && "green")}
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i, isWinner) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                isWinner={isWinner}
            />
        );
    }

    renderSquares() {
        let rows = [];
        let row = [];

        for (let i = 0; i < 3; i++) {
            row = [];
            for (let j = 0; j < 3; j++) {
                let index = (i * 3) + j;
                let isWinner = false;
                if (this.props.lines != null && this.props.lines.includes(index)) {
                    isWinner = true;
                }
                row.push(this.renderSquare(index, isWinner));
            }
            rows.push(
                <div className="board-row">
                    {row}
                </div>);
        }
        return <div>{rows}</div>;
    }

    render() {

        return (
            this.renderSquares()
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                selectedSquare: null,
            }],
            stepNumber: 0,
            xIsNext: true,
            showSelectedSquare: false,
            descOrder: true,
        }
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                selectedSquare: i,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            showSelectedSquare: false,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
            showSelectedSquare: true,
        })
    }

    toggleOrder() {
        this.setState({
            descOrder: !this.state.descOrder,
        })
    }

    render() {
        const history = this.state.history.slice();
        if (!this.state.descOrder) {
            history.reverse();
        }
        const current = history[this.state.stepNumber];

        const moves = history.map((step, move) => {
            const row = Math.floor(step.selectedSquare / 3) + 1;
            const col = step.selectedSquare % 3 + 1;
            const desc = !isTheFirstStep(step.squares) ?
                'Go to move (' + col + ', ' + row + ')' :
                'Go to game start';
            return (
                <li
                    key={move}
                    className={this.state.showSelectedSquare && current.selectedSquare === step.selectedSquare ? 'bold' : ''}
                >
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            )
        })

        let status = calculateStatus(current.squares, this.state.xIsNext);

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        lines={status.lines}
                    />
                </div>
                <div className="game-info">
                    <div>{status.message}</div>
                    <div>
                        <button onClick={() => this.toggleOrder()}>{this.state.descOrder ? 'Order by newest' : 'Order by oldest'}</button>
                    </div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

function calculateStatus(squares, xIsNext) {
    const winner = calculateWinner(squares);
    let message;
    let lines;
    if (winner) {
        message = 'Winner is : ' + winner.player;
        lines =  winner.lines;
    } else if (calculateDraw(squares)) {
        message = 'It\'s a draw !';
    } else {
        message = 'Next player is : ' + (xIsNext ? 'X' : 'O');
    }
    return {
        message: message,
        lines: lines,
    };
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                player: squares[a],
                lines: lines[i],
            };
        }
    }
    return null;
}

function calculateDraw(squares) {
    for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
            return false;
        }
    }
    return true;
}

function isTheFirstStep(squares) {
    return !(squares.includes('X') || squares.includes('O'));
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
