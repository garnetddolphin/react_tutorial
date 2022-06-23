import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// Suquareを関数コンポーネントに書き換え
function Square(props) {
	const className = 'square' + (props.highlight ? ' highlight' : '');
	return (
		<button
			className={className}
			onClick={props.onClick}>
			{props.value}
		</button>
	);
}

class Board extends React.Component {
	renderSquare(i) {
		const winLine = this.props.winLine;
		return (
			<Square
				key={i}
				value={this.props.squares[i]}
				onClick={() => this.props.onClick(i)}
				highlight={winLine && winLine.includes(i)}
			/>
		);
	}

	render() {
		const boardSize = 3;
		let squares =[];
		for (let i = 0; i < boardSize; i++){
			let row = [];
			for (let j = 0; j < boardSize; j++){
				row.push(this.renderSquare(i * boardSize + j));
			}
			squares.push(<div key={i} className="board-row">{row}</div>);
		}
		return (
			<div>{squares}</div>
		);
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			history: [{
				squares: Array(9).fill(null),
			}],
			stepNumber: 0,
			xIsNext: true,
			isAscending: true
		};
	}

	handleClick(i) {
		const locations = [
			[1, 1],
			[2, 1],
			[3, 1],
			[1, 2],
			[2, 2],
			[3, 2],
			[1, 3],
			[2, 3],
			[3, 3]
		];
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();
		if (calculateWinner(squares).winner || squares[i]) {
			return;
		}
		squares[i] = this.state.xIsNext ? 'X' : 'O';
		this.setState({
			history: history.concat([{
				squares: squares,
				location: locations[i]
			}]),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext,
		});
	}

	handleSortToggle() {
		this.setState({
			isAscending: !this.state.isAscending
		});
	}

	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: (step % 2) === 0,
		});
	}

	render() {
		const history = this.state.history;
		const stepNumber = this.state.stepNumber;
		const current = history[stepNumber];
		const isAscending = this.state.isAscending;
		const winInfo = calculateWinner(current.squares);
		const winner = winInfo.winner;

		let moves = history.map((step, move) => {
			const desc = move ?
				'Go to move #' + move + '@' + history[move].location :
				'Go to game start';
			return (
				<li key={move}>
					<button
						className={move === stepNumber ? 'move-list-item-selected' : ''}
						onClick={() => this.jumpTo(move)}>{desc}
					</button>
				</li>
			);
		});

		let status;
		if (winner) {
			status = "Winner: " + winner;
		} else {
			if (winInfo.isDraw) {
				status = "Draw";
			} else {
				status = "Next player: " + (this.state.xIsNext ? "X" : "O");
			}
		}

		if(!isAscending) {
			moves.reverse();
		}

		return (
			<div className="game">
				<div className="game-board">
					<Board
						squares={current.squares}
						onClick={(i) => this.handleClick(i)}
						winLine={winInfo.line}
					/>
				</div>
				<div className="game-info">
					<div>{status}</div>
					<button onClick={() => this.handleSortToggle()}>
						{isAscending ? 'descending' : 'ascending'}
					</button>
					<ol>{moves}</ol>
				</div>
			</div>
		);
	}
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares){
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
				winner: squares[a],
				line: lines[i],
				isDraw: false,
			};
		}
	}

	let isDraw = true;
	for (let i = 0; i < squares.length; i++) {
		if (squares[i] === null) {
			isDraw = false;
			break;
		}
	}
	return {
		winner: null,
		line: null,
		isDraw: isDraw,
	};
}