const width = 5;

const grid = document.querySelector(".grid");
let activeCell = document.querySelector(".cell.active");
let activeRow = document.querySelector(".row.active");
const popup = document.querySelector(".popup");
const keyboard = document.querySelector(".keyboard");

let activeCellIndex = 0;

let themes;
let words = [];
let word = "drill";

const guess = [];
let validGuesses = [];

const keyboardKeys = {};
const popupDuration = 3000;
const cellFlipAnimDuration = 600;
const keyboardHideDelay = 300;

//#region UTIL

function childIndex(element) {
	return Array.from(element.parentNode.children).indexOf(element);
}

//#endregion

//#region CELLS

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

function moveActiveCell(forwards, disallowHop) {
	const newActiveCell = forwards ? activeCell.nextElementSibling : activeCell.previousElementSibling;

	if (newActiveCell)
	{
		setActiveCell(newActiveCell);

		// Hop over already filled cells
		if (!disallowHop && forwards && newActiveCell.textContent && newActiveCell.nextSibling)
			moveActiveCell(true);
	}
}

function setCellInput(text) {
	activeCell.textContent = text;
	guess[activeCellIndex % width] = text;
}

//#endregion

//#region ROWS

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

				if (!keyboardKeys[letter].classList.contains("green"))
					keyboardKeys[letter].classList.add("yellow");
			} else {
				cells[i].classList.add("gray");

				if (!keyboardKeys[letter].classList.contains("green"))
					keyboardKeys[letter].classList.add("gray");
			}
		}
	}

	activeRow.classList.remove("active");

	if (correctLetters == letters.length)
	{
		// Won
		endGame(true, true);
	} else if (!activeRow.nextElementSibling)
	{
		// Lost
		endGame(false, true);
	} else {
		activeRow = activeRow.nextElementSibling;
		activeRow.classList.add("active");

		setActiveCell(activeRow.firstElementChild);
	}
}

function submitRow() {
	let validGuess = true;
	for (let i = 0; i < width; i++) {
		if (!guess[i])
			validGuess = false;
	}

	if (validGuess && !validGuesses.includes(guess.join("")) && !words.includes(guess.join("")))
	{
		validGuess = false;
		showPopup(`${guess.join("").toUpperCase()} is not a valid word.`, popupDuration);
	}

	if (validGuess)
		nextRow();
}

function showPopup(text, duration) {
	popup.textContent = text;
	popup.classList.add("active");

	setTimeout(() => {
		popup.classList.remove("active");
	}, duration);
}

//#endregion

function chooseRandomWord() {
	const randIndex = Math.floor(Math.random() * words.length);
	word = words[randIndex];
}

function endGame(won, delay) {
	setActiveCell(null);

	// Wait for reveal animation to finish
	setTimeout(() => {
		// Hide keyboard
		keyboard.classList.add("hidden");

		setTimeout(() => {
			if (won)
			{
				showPopup("You won!", popupDuration);
			} else {
				showPopup("You lost!", popupDuration);
			}

			// Confetti cannons
		}, keyboardHideDelay * 2);
	}, delay ? cellFlipAnimDuration : 0);	
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
				moveActiveCell(true, true);
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
				submitRow();
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

	fetch("./words.json").then(response => {
		return response.json();
	}).then(data => {
		themes = data;
		Object.values(themes).forEach(themedWords => {
			words = words.concat(themedWords);
		});

		chooseRandomWord();
	});
}

setUp();