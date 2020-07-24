'use strict';

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyA3iWhjLXUOmjnidixx6GC_DT5M2Ddt4bI',
	authDomain: 'daily-checking.firebaseapp.com',
	databaseURL: 'https://daily-checking.firebaseio.com',
	projectId: 'daily-checking',
	storageBucket: 'daily-checking.appspot.com',
	messagingSenderId: '79540097878',
	appId: '1:79540097878:web:b847d77934b24aad0efcf7',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const styleSheet = document.getElementById('style'),
	header = document.querySelector('header'),
	logOutButton = document.getElementById('logout-button'),
	popOutBtn = document.getElementById('pop-out'),
	themeToggle = document.querySelector('.theme-label'),
	themeSwitch = document.querySelector('#switch'),
	theBall = document.querySelector('.ball'),
	checkRows = document.querySelector('#checkrows'),
	menuToggleBtn = document.querySelector('#menu-toggle'),
	hiddenMenu = document.querySelector('#hidden-menu'),
	rowManip = document.querySelector('#row-manipulator'),
	gameTableNames = document.getElementById('names'),
	casinoNames = document.getElementById('casinos'),
	auth = firebase.auth(),
	db = firebase.firestore(),
	updateTableRows = function () {
		// getting the entire firestore array, because you can't update specific values in the cloud
		db.collection('dailyChecking')
			//changing the following userUID helps copying row state between users
			.doc('template')
			.get()
			.then(doc => {
				let rowObjects = doc.data().templateItems;
				tableRows = document.querySelectorAll('.table-row');

				for (let i = 0; i < tableRows.length; i++) {
					rowObjects[i + 1].id = Number.parseInt(
						tableRows[i].id.substring(tableRows[i].id.indexOf('-') + 1)
					);
					rowObjects[i + 1].color =
						tableRows[i].children[0].style.backgroundColor;

					rowObjects[i + 1].name = tableRows[i][0].value;

					rowObjects[i + 1].target = Number.parseInt(tableRows[i][1].value);
				}

				return rowObjects;
			})
			.then(rowObjects => {
				db.collection('dailyChecking').doc('template').update({
					templateItems: rowObjects,
				});
			})
			.catch(error => {
				console.error(error);
			});
	};

let userUID;
let dbTracking = '';
let tableRows;
let allTargets;
let tablesDB;
let casinosDB;
let inputElements = document.querySelectorAll('.inputElement');

firebase.auth().onAuthStateChanged(function (dailyCheckingUser) {
	if (dailyCheckingUser) {
		//current user valid option: firebase.auth().currentUser.uid
		userUID = dailyCheckingUser.uid;

		db.collection('dailyChecking')
			.doc(userUID)
			.get()
			.then(doc => {
				let qa = doc.data().nickname[0];
				let greeting = document.createElement('h6');

				greeting.innerText = `Welcome, ${qa}!`;
				greeting.classList.add('greeting');
				logOutButton.before(greeting);
			})
			.catch(error => {
				console.error(error);
			});

		db.collection('dailyChecking')
			.doc('tables')
			.get()
			.then(doc => {
				tablesDB = doc.data().names;
			})
			.catch(error => {
				console.error(error);
			});

		db.collection('dailyChecking')
			.doc('casinos')
			.get()
			.then(doc => {
				casinosDB = doc.data().names;
			})
			.catch(error => {
				console.error(error);
			});

		db.collection('dailyChecking')
			.doc('template')
			.get()
			.then(doc => {
				if (doc.exists) {
					let rowObjects = doc.data().templateItems;

					let i = 0;
					do {
						if (i === 0) {
							document.querySelector(`#table-${i}`).value = rowObjects[i].name;
						} else {
							const rowItem = document.createElement('form');
							rowItem.id = `row-${rowObjects[i].id}`;
							rowItem.setAttribute('draggable', true);
							rowItem.classList.add('table-row');
							rowItem.innerHTML = `
								<div 
									id="format-${rowObjects[i].id}" 
									class="drag row-format" 
									style="background-color: ${rowObjects[i].color}">
								</div>
								<div>
									<input 
										id="table-${rowObjects[i].id}" 
										class="drag inputElement highlight-this table-name" 
										type="text" 
										name="table" 
										pattern="[a-zA-Z0-9 ]+" 
										list="names" 
										autocomplete="off" 
										value="${rowObjects[i].name}"
									/>
								</div>
								<input 
									id="target-${rowObjects[i].id}" 
									class="drag target highlight-this" 
									type="number" 
									value="${rowObjects[i].target || 1}" 
									maxlength="2" 
									min="0" 
									max="69" 
								/>
								<button 
									id="${rowObjects[i].id}" 
									class="drag submitButton highlight-this" 
									type="button">
									Save
								</button>`;
							rowManip.before(rowItem);
						}
						i++;
					} while (i < rowObjects.length);

					inputElements = document.querySelectorAll('input');
					tableRows = document.querySelectorAll('.table-row');
				}
			})
			.catch(error => {
				console.error(error);
			});
	} else {
		window.location.replace('.');
	}
});

logOutButton.addEventListener('click', function () {
	auth
		.signOut()
		.then(() => {})
		.catch(error => {
			console.error(error);
		});
});

// Creating custom Toaster messages
function newToaster(text, type) {
	if (document.querySelector('#toaster')) {
		document.querySelector('#toaster').remove();
	}

	let toasterMessage = document.createElement('span');
	toasterMessage.id = 'toaster';
	toasterMessage.innerHTML = text;
	if (type === 'success') {
		toasterMessage.classList = 'successSubmitToaster';
	} else if (type === 'fail') {
		toasterMessage.classList = 'failSubmitToaster';
	}

	header.append(toasterMessage);

	setTimeout(function () {
		toasterMessage.remove();
	}, 3000);
}

//Row addition and removal
//Chaining promise requests from firestore to sync DB info with client info
//During the promise chaining buttons are disabled, to avoid information desync
const manipRows = function (event) {
	let target = event.target;
	let row = target.parentElement.previousElementSibling;
	if (target.innerHTML === 'Remove' && row.classList.contains('table-row')) {
		target.setAttribute('disabled', 'disabled');
		db.collection('dailyChecking')
			.doc('template')
			.get()
			.then(doc => {
				let rowObjects = doc.data().templateItems;
				let deleteObject = rowObjects.find(
					value =>
						Number.parseInt(value.id) ===
						Number.parseInt(row.id.substring(row.id.indexOf('-') + 1))
				);
				if (rowObjects.length - 1 > 0) {
					db.collection('dailyChecking')
						.doc('template')
						.update({
							templateItems: firebase.firestore.FieldValue.arrayRemove(
								deleteObject
							),
						})
						.then(() => {
							row.remove();
							tableRows = document.querySelectorAll('.table-row');
							target.removeAttribute('disabled');
						})
						.catch(error => {
							console.error('Could not update user profile:', error);
							target.removeAttribute('disabled');
						});
				}
			})
			.catch(error => {
				console.error('Failed retrieving rowObjects:', error);
				target.removeAttribute('disabled');
			});
	} else if (target.innerHTML === 'Add') {
		target.setAttribute('disabled', 'disabled');

		db.collection('dailyChecking')
			.doc('template')
			.get()
			.then(doc => {
				let rowObjects = doc.data().templateItems;
				let idArr = [];

				rowObjects.forEach(obj => {
					idArr.push(obj.id);
				});

				idArr.sort((a, b) => a - b);

				let id;

				// Find lowest missing integer to be assigned as the new rows ID
				for (let i = 1; i <= idArr.length; i++) {
					if (idArr[i] !== i) {
						id = i;
						break;
					} else if (i === idArr.length && idArr[i] === i) {
						id = i++;
					}
				}

				const rowItem = document.createElement('form');
				rowItem.id = `row-${id}`;
				rowItem.setAttribute('draggable', true);
				rowItem.classList.add('table-row');
				rowItem.innerHTML = `
				<div 
					id="format-${id}" 
					class="drag row-format">
				</div>
				<div>
					<input 
						id="table-${id}" 
						class="drag inputElement highlight-this table-name" 
						type="text" 
						name="table" 
						list="names" 
						autocomplete="off" 
						pattern="[a-zA-Z0-9 /]+"
					/>
				</div>
				<input 
					id="target-${id}" 
					class="drag target highlight-this" 
					type="number" 
					value="1" 
					maxlength="2" 
					min="0" 
					max="12" 
				/>
				<button 
					id="${id}" 
					class="drag submitButton highlight-this" 
					type="button">
					Save
				</button>`;
				rowManip.before(rowItem);
				db.collection('dailyChecking')
					.doc('template')
					.update({
						templateItems: firebase.firestore.FieldValue.arrayUnion({
							id: id,
							name: '',
							target: 1,
							color: '',
						}),
					})
					.then(() => {
						tableRows = document.querySelectorAll('.table-row');
						target.removeAttribute('disabled');
					})
					.catch(error => {
						console.error(error);
						target.removeAttribute('disabled');
					});
			})
			.catch(error => {
				console.error(error);
				target.removeAttribute('disabled');
			});
	} else if (target.innerHTML === 'Save') {
		target.setAttribute('disabled', 'disabled');
		updateTableRows();
		target.removeAttribute('disabled');
	}
};

checkRows.addEventListener('click', manipRows);

const updateCounterAndOptions = function (event) {
	let target = event.target;
	//Logic to ignore mouse clicks due to them being undefined
	let eventKey = event.key ? event.key : 0;

	let optionArray = [];

	if (
		eventKey !== 'Shift' &&
		event.type !== 'mouseover' &&
		event.type !== 'mouseout' &&
		event.type !== 'click'
	) {
		gameTableNames.innerHTML = '';
		casinoNames.innerHTML = '';
	}

	if (target.classList.contains('highlight-this')) {
		let indexID = target.id.substring(target.id.indexOf('-') + 1),
			tableName = document.querySelector(`#table-${indexID}`),
			platform = document.querySelector(`#platform-${indexID}`),
			casino = document.querySelector(`#casino-${indexID}`),
			counter = document.querySelector(`#counter-${indexID}`) || menuToggleBtn,
			targetNumber =
				document.querySelector(`#target-${indexID}`) || menuToggleBtn,
			submitButton = document.getElementById(`${indexID}`),
			timestamp = document.getElementById(`timestamp-${indexID}`);

		if (event.type === 'mouseover') {
			tableName.classList.add('highlighted-row');
			targetNumber.classList.add('highlighted-row');
			submitButton.classList.add('highlighted-row');
		} else if (event.type === 'mouseout' || event.type === 'click') {
			tableName.classList.remove('highlighted-row');
			targetNumber.classList.remove('highlighted-row');
			submitButton.classList.remove('highlighted-row');
		}
	}

	if (
		(target.name === 'table' &&
			event.type === 'keyup' &&
			eventKey.length === 1) ||
		(target.name === 'table' && eventKey === 'Backspace')
	) {
		gameTableNames.innerHTML = '';
		tablesDB.forEach(value => {
			if (
				optionArray.length < 10 &&
				value.toLowerCase().startsWith(target.value.toLowerCase())
			) {
				optionArray.push(value);
			}
		});

		optionArray.sort((a, b) => {
			let nameA = a.toUpperCase();
			let nameB = b.toUpperCase();
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}

			return 0;
		});

		tablesDB.forEach(value => {
			if (
				optionArray.length < 10 &&
				value.toLowerCase().includes(target.value.toLowerCase())
			) {
				if (!optionArray.includes(value)) {
					optionArray.push(value);
				}
			}
		});

		optionArray.forEach(option => {
			let namesOptionItem = document.createElement('option');
			namesOptionItem.value = option;

			gameTableNames.append(namesOptionItem);
		});
	} else if (
		target.classList.contains('submitButton') &&
		event.type === 'click'
	) {
		target.setAttribute('disabled', 'disabled');

		let tableName = document.querySelector(`#table-${target.id}`).value;

		//getting the entire firestore array, because you can't update specific values in the cloud
		db.collection('dailyChecking')
			//changing the following userUID helps copying row state between users
			.doc('template')
			.get()
			.then(doc => {
				if (tableName != '') {
					let rowObjects = doc.data().templateItems;

					rowObjects.forEach(object => {
						if (Number.parseInt(object.id) === Number.parseInt(target.id)) {
							if (object.id > 0) {
								object.color = document.getElementById(
									`format-${object.id}`
								).style.backgroundColor;
							}
							object.name = document.getElementById(`table-${object.id}`).value;
							object.target = Number.parseInt(
								document.getElementById(`target-${object.id}`).value
							);
						}
					});
					db.collection('dailyChecking')
						.doc('template')
						.update({
							templateItems: rowObjects,
						})
						.then(() => {
							newToaster('Saved', 'success');
							target.blur();
							target.removeAttribute('disabled');
						})
						.catch(error => {
							console.error(error);
							newToaster('Error', 'fail');
							target.blur();
							target.removeAttribute('disabled');
						});
				}
			})
			.catch(error => {
				console.error(error);
				newToaster('Error', 'fail');
				target.blur();
				target.removeAttribute('disabled');
			});
	} else if (
		target.classList.contains('row-format') &&
		event.type === 'click'
	) {
		let targetBgColor = target.style.backgroundColor;

		// toggling the panel if it is already open
		if (target.childNodes.length > 1) {
			document.getElementById('color-panel').remove();
		} else {
			document.querySelectorAll('#color-panel').forEach(item => {
				item.remove();
			});
			const colorPanel = document.createElement('div');
			colorPanel.id = 'color-panel';
			colorPanel.innerHTML = `<div class="color-option option-one"></div><div class="color-option option-two"></div>
				<div class="color-option option-three"></div><div class="color-option option-four"></div>
				<div class="color-option option-five"></div><div class="color-option option-six"></div>
				<div class="color-option option-seven"></div><div class="color-option option-eight"></div>
				<div class="color-option option-nine"></div><div class="color-option option-ten"></div>
				<div class="color-option option-eleven"></div><div class="color-option option-twelve"></div>
				<input type="text" id="rgb-input" pattern="^[0-9,]$" maxlength="15" title="RGB format" placeholder="${targetBgColor.substring(
					targetBgColor.indexOf('(') + 1,
					targetBgColor.length - 1
				)}"/>`;

			target.append(colorPanel);
		}
	} else if (
		target.classList.contains('color-option') &&
		event.type === 'click'
	) {
		chosenTagColor = window.getComputedStyle(target).backgroundColor;

		target.closest('.row-format').style.backgroundColor = chosenTagColor;

		//getting the entire firestore array, because you can't update specific values in the cloud
		db.collection('dailyChecking')
			//changing the following userUID helps copying row state between users
			.doc(userUID)
			.get()
			.then(doc => {
				let rowObjects = doc.data().rowObjects;
				let rowToFormatID = target
					.closest('.row-format')
					.id.substring(target.closest('.row-format').id.indexOf('-') + 1);

				// Finding the index of the rowObject where the ID matches client side formatted rows ID
				let rowToFormat =
					rowObjects[
						rowObjects.findIndex(
							obj => Number.parseInt(obj.id) === Number.parseInt(rowToFormatID)
						)
					];

				document.getElementById('color-panel').remove();
				rowToFormat.color = chosenTagColor;
				return rowObjects;
			})
			.then(rowObjects => {
				db.collection('dailyChecking').doc(userUID).update({
					rowObjects: rowObjects,
				});
			})
			.catch(error => {
				console.error(error);
			});
	} else if (target.id === 'rgb-input' && event.type === 'keypress') {
		// Allowing only numbers and comma for the rgb-input element with type="text"
		if ((event.key >= 0 && event.key < 10) || event.key === ',') {
			let currentRGB = target.value || '';
			currentRGB + event.key;
		} else if (event.key === 'Enter') {
			chosenTagColor = `rgb(${target.value})`;
			target.closest('.row-format').style.backgroundColor = chosenTagColor;
			//getting the entire firestore array, because you can't update specific values in the cloud
			db.collection('dailyChecking')
				//changing the following userUID helps copying row state between users
				.doc(userUID)
				.get()
				.then(doc => {
					let rowObjects = doc.data().rowObjects;
					let rowToFormatID = target
						.closest('.row-format')
						.id.substring(target.closest('.row-format').id.indexOf('-') + 1);
					// Finding the index of the rowObject where the ID matches client side formatted rows ID
					let rowToFormat =
						rowObjects[
							rowObjects.findIndex(
								obj =>
									Number.parseInt(obj.id) === Number.parseInt(rowToFormatID)
							)
						];
					document.getElementById('color-panel').remove();
					rowToFormat.color = chosenTagColor;

					return rowObjects;
				})
				.then(rowObjects => {
					db.collection('dailyChecking').doc(userUID).update({
						rowObjects: rowObjects,
					});
				})
				.catch(error => {
					console.error(error);
				});
		} else {
			event.preventDefault();
		}
	}
};

//Added another eventlistener due to DOM Event delegation
checkRows.addEventListener('click', updateCounterAndOptions);
checkRows.addEventListener('keyup', updateCounterAndOptions);
checkRows.addEventListener('keypress', updateCounterAndOptions);
checkRows.addEventListener('mouseover', updateCounterAndOptions);
checkRows.addEventListener('mouseout', updateCounterAndOptions);

// Clear contents of certain input elements whenever they are focus to improve UX
const clearInputValues = function (event) {
	if (
		(event.target.classList.contains('platform-name') &&
			event.target.id !== 'platform-0') ||
		event.target.id === 'table-0' ||
		(event.target.classList.contains('casino-name') &&
			event.target.id !== 'casino-0')
	) {
		event.target.value = '';
	}
};

//using focusin over focus because it bubbles through the checkRows,
//thus there is no need to assign multiple elements
checkRows.addEventListener('focusin', clearInputValues);

const moveRows = function (event) {
	const removeAddedClassesAndTempRow = id => {
		document.getElementById(id).classList.remove('move-rows-target-above');

		// Solution to remove the added classes in cases of there being 10 rows, while some rows have an ID of 15 or 24,etc.
		let iterations = 1;
		let rowsViewed = 0;
		while (rowsViewed < tableRows.length) {
			if (document.getElementById('row-' + iterations)) {
				document
					.getElementById('row-' + iterations)
					.classList.remove('move-rows-target-below');
				rowsViewed++;
			}
			iterations++;
		}

		iterations = 1;
		rowsViewed = 0;

		if (document.getElementById('temp-row')) {
			document.getElementById('temp-row').remove();
		}
	};

	if (event.type === 'dragstart') {
		event.dataTransfer.setData('text', event.target.closest('.table-row').id);

		let targetID = event.dataTransfer.getData('text');
		let currentRowIndex;

		// Adding a special class so dragenter event does not trigger on the element itself
		document.getElementById(targetID).classList.add('move-rows-target-above');

		// Locating dragged rows index in relation to other rows
		for (let i = 0; i < tableRows.length; i++) {
			if (tableRows[i].id === targetID) {
				currentRowIndex = i;
			}
		}

		/* 
			Adding a class to all rows that are below dragged row,
			class will cause the placeholder row to appear below 
			the dragenter event target row 
		*/
		for (let i = currentRowIndex; i < tableRows.length - 1; i++) {
			tableRows[i + 1].classList.add('move-rows-target-below');
		}
	} else if (
		event.type === 'dragenter' &&
		event.target.classList.contains('drag') &&
		!event.target
			.closest('.table-row')
			.classList.contains('move-rows-target-above')
	) {
		let placeholderLocation = 'above';

		event.target
			.closest('.table-row')
			.classList.contains('move-rows-target-below')
			? (placeholderLocation = 'below')
			: (placeholderLocation = 'above');

		if (document.getElementById('temp-row')) {
			document.getElementById('temp-row').remove();
		}

		let tempRow = document.createElement('div');
		tempRow.id = 'temp-row';
		tempRow.classList.add(event.target.id);

		switch (placeholderLocation) {
			case 'above':
				event.target.closest('.table-row').before(tempRow);
				break;
			case 'below':
				event.target.closest('.table-row').after(tempRow);
				break;
			default:
				break;
		}
	} else if (event.type === 'dragover') {
		event.preventDefault();
	} else if (event.type === 'dragleave') {
	} else if (event.type === 'drop' && event.target.id === 'temp-row') {
		event.preventDefault();

		let id = event.dataTransfer.getData('text');

		event.target.before(document.getElementById(id));

		removeAddedClassesAndTempRow(id);

		event.dataTransfer.clearData();

		tableRows = document.querySelectorAll('.table-row');

		updateTableRows();
	} else if (event.type === 'drop' && event.target.id !== 'temp-row') {
		event.preventDefault();

		let id = event.dataTransfer.getData('text');

		removeAddedClassesAndTempRow(id);
	}
};

document.body.addEventListener('dragstart', moveRows);
document.body.addEventListener('dragenter', moveRows);
document.body.addEventListener('dragover', moveRows);
document.body.addEventListener('dragleave', moveRows);
document.body.addEventListener('drop', moveRows);

popOutBtn.onclick = function () {
	window.open(
		document.URL,
		'targetWindow',
		`width=990,
		height=982,
		left=2842,
		top=0`
	);
};

themeToggle.onclick = function () {
	if (themeSwitch.checked) {
		theBall.style.transitionDuration = '0.2s';
		styleSheet.href = 'css/light.css';
		document.cookie =
			'color-schema=css/light.css;max-age=695520‬;secure;samesite=strict';
	} else {
		theBall.style.transitionDuration = '0.2s';
		styleSheet.href = 'css/dark.css';
		document.cookie =
			'color-schema=css/dark.css;max-age=695520;secure;samesite=strict';
	}
};

menuToggleBtn.onclick = function () {
	hiddenMenu.style.visibility =
		hiddenMenu.style.visibility != 'visible' ? 'visible' : 'hidden';
	menuToggleBtn.blur();
};

// Closing any option windows if the click is not related to the option window
document.body.onclick = function () {
	if (
		hiddenMenu.style.visibility === 'visible' &&
		event.target.id !== 'menu-toggle' &&
		event.target.id !== 'hidden-menu' &&
		event.target.id !== 'reset-button' &&
		event.target.id !== 'sort-button' &&
		event.target.id !== 'undo-button'
	) {
		hiddenMenu.style.visibility = 'hidden';
	}

	if (
		!event.target.classList.contains('row-format') &&
		!event.target.classList.contains('color-option') &&
		event.target.id !== 'rgb-input' &&
		event.target.id !== 'color-panel' &&
		document.getElementById('color-panel')
	) {
		document.getElementById('color-panel').remove();
	}
};
