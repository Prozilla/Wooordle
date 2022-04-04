const width = 5;

let activeCell = document.querySelector(".cell.active");
let activeCellIndex = 0;
let activeRow = document.querySelector(".row.active");

let themes;
let word = "drill";
const guess = [];
let validGuesses = [];

const keyboardKeys = {};

function childIndex(element) {
	return Array.from(element.parentNode.children).indexOf(element);
}

function setActiveCell(element) {
	if (element && !element.parentElement.classList.contains("active"))
		return;

	activeCell.classList.remove("active");

	activeCell = element;

	if (activeCell)
	{
		activeCellIndex = childIndex(activeCell.parentNode) * width + childIndex(activeCell);
		activeCell.classList.add("active");
	}
}

function moveActiveCell(forwards) {
	const newActiveCell = forwards ? activeCell.nextElementSibling : activeCell.previousElementSibling;

	if (newActiveCell)
		setActiveCell(newActiveCell);
}

function setCellInput(text) {
	activeCell.textContent = text;
	guess[activeCellIndex % width] = text;
}

function nextRow() {
	const cells = Array.from(activeRow.children);
	const letters = word.split("");
	let correctLetters = 0;

	for (let i = 0; i < cells.length; i++) {
		const letter = cells[i].textContent;
		if (letters[i] == letter)
		{
			cells[i].classList.add("green");
			letters[letters.indexOf(letter)] = null;
			correctLetters++;

			keyboardKeys[letter].classList.add("green");
			keyboardKeys[letter].classList.remove("yellow");
		}
	}

	for (let i = 0; i < cells.length; i++) {
		if (!cells[i].classList.contains("green"))
		{
			const letter = cells[i].textContent;
			if (letters.includes(letter) && letter)
			{
				cells[i].classList.add("yellow");
				letters[letters.indexOf(letter)] = null;

				keyboardKeys[letter].classList.add("yellow");
			} else {
				cells[i].classList.add("gray");

				keyboardKeys[letter].classList.add("gray");
			}
		}
	}

	activeRow.classList.remove("active");

	if (correctLetters < letters.length)
	{
		activeRow = activeRow.nextElementSibling;
		activeRow.classList.add("active");

		setActiveCell(activeRow.firstElementChild);
	} else {
		setActiveCell(null);
	}
}

function chooseRandomWord() {
	fetch("./words.json").then(response => {
		return response.json();
	}).then(data => {
		themes = data;
		console.log(themes);
		const keys = Object.keys(themes);
		const randIndex = Math.floor(Math.random() * keys.length)
		const randKey = keys[randIndex]
		const words = themes[randKey];
		word = words[ Math.floor(Math.random() * words.length)];
	});
}

function submit() {
	let validGuess = true;
	for (let i = 0; i < width; i++) {
		if (!guess[i])
			validGuess = false;
	}

	if (validGuess)
		nextRow();
}

function processInput(key) {
	key = key.toLowerCase();

	if (!activeCell)
			return;

	if (key.length == 1 && key.match(/[a-z]/g))
	{
		setCellInput(key);
		moveActiveCell(true);
	} else {
		switch (key) {
			case " ":
				moveActiveCell(true);
				break;
			case "arrowright":
				moveActiveCell(true);
				break;
			case "arrowleft":
				moveActiveCell(false);
				break;
			case "backspace":
				if (!activeCell.textContent)
					moveActiveCell(false);
				setCellInput();
				break;
			case "enter":
				submit();
				break;
		}
	}
}

function setUp() {
	setActiveCell(activeCell);

	document.addEventListener("click", function(event) {
		if (event.target.classList.contains("cell"))
			setActiveCell(event.target);
	});

	document.addEventListener("keydown", function(event) {
		processInput(event.key);
	});

	document.querySelectorAll(".keyboard button").forEach(button => {
		const key = button.getAttribute("data-key") || button.textContent;
		button.onclick = function(event) {
			processInput(key);
		}

		keyboardKeys[key] = button;
	});

	fetch("./dictionary.json").then(response => {
			return response.json();
		}).then(data => {
			Object.keys(data).forEach(function(key) {
				if (key.length <= 5)
					validGuesses.push(key);
			});
		});

	chooseRandomWord();
}

setUp();