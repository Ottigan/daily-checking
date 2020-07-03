`use strict`;

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
	audioAlarm = document.getElementById('alarm'),
	logOutButton = document.getElementById('logout-button'),
	popOutBtn = document.getElementById('pop-out'),
	themeToggle = document.querySelector('.theme-label'),
	themeSwitch = document.querySelector('#switch'),
	theBall = document.querySelector('.ball'),
	checkRows = document.querySelector('#checkrows'),
	menuToggleBtn = document.querySelector('#menu-toggle'),
	hiddenMenu = document.querySelector('#hidden-menu'),
	overlay = document.querySelector('#overlay'),
	rowManip = document.querySelector('#row-manipulator'),
	gameTableNames = document.getElementById('names'),
	casinoNames = document.getElementById('casinos'),
	auth = firebase.auth(),
	db = firebase.firestore();

let userUID;
let tableRows;
let chosenTagColor;
let allCounters = document.querySelectorAll('.counter');
let allTargets;
let tablesDB;
let casinosDB;
let inputElements = document.querySelectorAll('.inputElement');

setInterval(() => {
	let day = new Date().getDay();
	let hours = new Date().getHours();
	let minutes = new Date().getMinutes();
	let seconds = new Date().getSeconds();
	// audioAlarm.loop = true;

	// console.log(day);
	// console.log(hours);
	// console.log(minutes);
	// console.log(seconds);

	if (
		hours === 10 &&
		minutes === 0 &&
		seconds === 0 &&
		(day !== 6 || day !== 7)
	) {
		audioAlarm.play();
		setTimeout(() => {
			alert(
				'Wake up! MNGs are ass... I get it, but Blackjack Lounge 4 should be OPEN!'
			);
		}, 1000);
	} else if (
		hours === 16 &&
		minutes === 0 &&
		seconds === 0 &&
		(day !== 6 || day !== 7)
	) {
		audioAlarm.play();
		setTimeout(() => {
			alert('Time for Blackjack Lounge 6 to rise from the ashes yet again!');
		}, 1000);
	} else if (hours === 17 && minutes === 0 && seconds === 0) {
		audioAlarm.play();
		setTimeout(() => {
			alert('Stop being a lazy ass and go check ITALIAN tables!');
		}, 1000);
	} else if (hours === 18 && minutes === 0 && seconds === 0) {
		audioAlarm.play();
		setTimeout(() => {
			alert('Go and check Fuuuufikon!');
		}, 1000);
	} else if (hours === 19 && minutes === 0 && seconds === 0) {
		audioAlarm.play();
		setTimeout(() => {
			alert("The Brits are coming and BREXIT won't save us!");
		}, 1000);
	} else if (hours === 22 && minutes === 0 && seconds === 0) {
		audioAlarm.play();
		setTimeout(() => {
			alert(
				"SIA BJ 1 and Payback should be ready! Fingers crossed that the Tricaster hasn't choked..."
			);
		}, 1000);
	}
}, 1000);

firebase.auth().onAuthStateChanged(dailyCheckingUser => {
	if (dailyCheckingUser) {
		//current user valid option: firebase.auth().currentUser.uid
		userUID = dailyCheckingUser.uid;

		db.collection('dailyChecking')
			.doc(userUID)
			.get()
			.then(function (doc) {
				let qa = doc.data().nickname[0];
				let greeting = document.createElement('h6');

				greeting.innerText = `Welcome, ${qa}!`;
				greeting.classList.add('greeting');
				logOutButton.before(greeting);
			})
			.catch(function (error) {
				console.error(error);
			});

		db.collection('dailyChecking')
			.doc('tables')
			.get()
			.then(function (doc) {
				tablesDB = doc.data().names;
			})
			.catch(function (error) {});

		db.collection('dailyChecking')
			.doc('casinos')
			.get()
			.then(function (doc) {
				casinosDB = doc.data().names;
			})
			.catch(function (error) {});

		db.collection('dailyChecking')
			.doc(userUID)
			.get()
			.then(function (doc) {
				if (doc.exists) {
					let rowObjects = doc.data().rowObjects;
					let i = 0;
					do {
						if (i === 0) {
							document.querySelector(`#table-${i}`).value = rowObjects[i].name;
							document.querySelector(`#platform-${i}`).value =
								rowObjects[i].platform;
							document.querySelector(`#casino-${i}`).value =
								rowObjects[i].casino;
							document.querySelector(`#counter-${i}`).innerHTML =
								rowObjects[i].counter;
						} else if (i > 0) {
							const rowItem = document.createElement('form');
							rowItem.id = `row-${rowObjects[i].id}`;
							rowItem.setAttribute('draggable', true);
							rowItem.classList.add('flex', 'jc-c', 'table-row');
							rowItem.innerHTML = `
								<div id="format-${
									rowObjects[i].id
								}" class="drag row-format" style="background-color: ${
								rowObjects[i].color
							}">
								</div>
								<div>
									<input type="text" name="table" pattern="[a-zA-Z0-9 ]+" list="names" class="drag inputElement highlight-this table-name" autocomplete="off" id="table-${
										rowObjects[i].id
									}" value="${rowObjects[i].name}"/>
								</div>
								<div>
									<input id="platform-${
										rowObjects[i].id
									}" class="drag highlight-this platform-name" value="${
								rowObjects[i].platform
							}" name="platform" type="text" list="platforms" autocomplete="off"/>
								</div>
								<div>
									<input type="text" name="casino" list="casinos" class="drag inputElement highlight-this casino-name" autocomplete="off" id="casino-${
										rowObjects[i].id
									}" value="${rowObjects[i].casino.toLowerCase()}"/>
								</div>
								<span id="counter-${rowObjects[i].id}" class="drag counter highlight-this">${
								rowObjects[i].counter || 0
							}
								</span>
								<input id="target-${
									rowObjects[i].id
								}" type="number" class="drag target highlight-this" value="${
								rowObjects[i].target || 1
							}" maxlength="2" min="0" max="12" />
								<button id="${
									rowObjects[i].id
								}" class="drag submitButton highlight-this" type="button">
									Submit
								</button>`;
							rowManip.before(rowItem);
						}
						i++;
					} while (i <= rowObjects.length - 1);
					inputElements = document.querySelectorAll('input');
					tableRows = document.querySelectorAll('.table-row');

					let counter = document.querySelectorAll(`.counter`),
						goal = document.querySelectorAll(`.target`);

					for (let i = 0; i < counter.length; i++) {
						let x = Number.parseInt(counter[i].innerHTML),
							y = goal[i].value;

						if (x >= y) {
							counter[i].classList.add('valid');
							counter[i].classList.remove('invalid');
						} else {
							counter[i].classList.add('invalid');
							counter[i].classList.remove('valid');
						}
					}
				}
			})
			.catch(function (error) {
				console.log('Error getting document:', error);
			});
	} else {
		window.location.replace('.');
	}
});

logOutButton.addEventListener('click', function () {
	auth.signOut().then(function () {});
});

function newToaster(text, type) {
	let toasterMessage = document.createElement('span');
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
const manipRows = event => {
	let target = event.target;
	let row = target.parentElement.previousElementSibling;
	if (target.innerHTML === 'Remove' && row.classList.contains('table-row')) {
		target.setAttribute('disabled', 'disabled');
		db.collection('dailyChecking')
			.doc(userUID)
			.get()
			.then(function (doc) {
				let objectArray = doc.data().rowObjects;
				let deleteObject = objectArray.find(
					value => value.id === objectArray.length - 1
				);
				if (objectArray.length - 1 > 0) {
					db.collection('dailyChecking')
						.doc(userUID)
						.update({
							rowObjects: firebase.firestore.FieldValue.arrayRemove(
								deleteObject
							),
						})
						.then(function () {
							row.remove();
							tableRows = document.querySelectorAll('.table-row');
							target.removeAttribute('disabled');
						})
						.catch(function (error) {
							console.error('Could not update user profile:', error);
							target.removeAttribute('disabled');
						});
				}
			})
			.catch(function (error) {
				console.error('Failed retrieving rowObjects:', error);
				target.removeAttribute('disabled');
			});
	} else if (target.innerHTML === 'Add') {
		target.setAttribute('disabled', 'disabled');

		db.collection('dailyChecking')
			.doc(userUID)
			.get()
			.then(function (doc) {
				let id = doc.data().rowObjects.length;
				const rowItem = document.createElement('form');
				rowItem.id = `row-${id}`;
				rowItem.setAttribute('draggable', true);
				rowItem.classList.add('flex', 'jc-c', 'table-row');
				rowItem.innerHTML = `<div id="format-${id}" class="row-format"></div>
							<div>
							<input id="table-${id}" class="inputElement highlight-this table-name" type="text" name="table" list="names" autocomplete="off" pattern="[a-zA-Z0-9]+"/>
							</div>
							<div>
							<input id="platform-${id}" class="highlight-this platform-name" name="platform" type="text" list="platforms" autocomplete="off"/>
							</div>
							<div>
							<input id="casino-${id}" class="inputElement highlight-this casino-name" type="text" name="casino"  list="casinos" autocomplete="off"/>
							</div>
							<span id="counter-${id}" class="counter highlight-this invalid">0</span>
							<input id="target-${id}" class="target highlight-this" type="number" value="1" maxlength="2" min="0" max="12" />
							<button id="${id}" class="submitButton highlight-this" type="button">
							Submit
							</button>`;
				rowManip.before(rowItem);
				db.collection('dailyChecking')
					.doc(userUID)
					.update({
						rowObjects: firebase.firestore.FieldValue.arrayUnion({
							id: id,
							name: '',
							platform: '',
							casino: '',
							counter: 0,
							target: 1,
							color: '',
						}),
					})
					.then(function () {
						console.log('Row successfully added!');
						tableRows = document.querySelectorAll('.table-row');
						target.removeAttribute('disabled');
					})
					.catch(function (error) {
						console.error('Error adding rowObject: ', error);
						target.removeAttribute('disabled');
					});
			})
			.catch(function (error) {
				console.error('Failed retrieving current rowObjects:', error);
				target.removeAttribute('disabled');
			});
	}
};

checkRows.addEventListener('click', manipRows);

const updateCounterAndOptions = event => {
	let target = event.target;
	//Logic to ignore mouse clicks due to them being undefined
	let eventKey = event.key ? event.key : 0;

	if (
		eventKey !== 'Shift' &&
		event.type !== 'mouseover' &&
		event.type !== 'mouseout'
	) {
		gameTableNames.innerHTML = '';
		casinoNames.innerHTML = '';
	}

	if (
		(target.classList.contains('inputElement') &&
			event.type === 'keyup' &&
			eventKey.length === 1) ||
		eventKey === 'Backspace'
	) {
		gameTableNames.innerHTML = '';
		tablesDB.forEach(value => {
			if (
				gameTableNames.childElementCount <= 10 &&
				value.toLowerCase().includes(target.value.toLowerCase())
			) {
				let namesOptionItem = document.createElement('option');
				namesOptionItem.value = value;

				gameTableNames.append(namesOptionItem);
			}
		});
		casinoNames.innerHTML = '';
		casinosDB.forEach(value => {
			if (
				casinoNames.childElementCount <= 10 &&
				value.toLowerCase().includes(target.value.toLowerCase())
			) {
				let casinosOptionItem = document.createElement('option');
				casinosOptionItem.value = value;

				casinoNames.append(casinosOptionItem);
			}
		});
	}

	if (target.classList.contains('highlight-this')) {
		let indexID = target.id.substring(target.id.indexOf('-') + 1),
			tableName = document.querySelector(`#table-${indexID}`),
			platform = document.querySelector(`#platform-${indexID}`),
			casino = document.querySelector(`#casino-${indexID}`),
			counter = document.querySelector(`#counter-${indexID}`) || menuToggleBtn,
			targetNumber =
				document.querySelector(`#target-${indexID}`) || menuToggleBtn,
			submitButton = document.getElementById(`${indexID}`);

		if (event.type === 'mouseover') {
			tableName.classList.add('highlighted-row');
			platform.classList.add('highlighted-row');
			casino.classList.add('highlighted-row');
			counter.classList.add('highlighted-row');
			counter.classList.add('highlighted-row');
			targetNumber.classList.add('highlighted-row');
			submitButton.classList.add('highlighted-row');
		} else if (event.type === 'mouseout' || event.type === 'click') {
			tableName.classList.remove('highlighted-row');
			platform.classList.remove('highlighted-row');
			casino.classList.remove('highlighted-row');
			counter.classList.remove('highlighted-row');
			targetNumber.classList.remove('highlighted-row');
			submitButton.classList.remove('highlighted-row');
		}
	}

	if (target.classList.contains('submitButton') && event.type === 'click') {
		target.setAttribute('disabled', 'disabled');

		let tableName = document.querySelector(`#table-${target.id}`).value,
			platform = document.querySelector(`#platform-${target.id}`).value,
			casino = document.querySelector(`#casino-${target.id}`).value,
			counter = document.querySelector(`#counter-${target.id}`),
			goal = document.querySelector(`#target-${target.id}`);

		//getting the entire firestore array, because you can't update specific values in the cloud
		db.collection('dailyChecking')
			//changing the following userUID helps copying row state between users
			.doc(userUID)
			.get()
			.then(function (doc) {
				if (tableName != '' && platform != '' && casino != '') {
					let rowObjects = doc.data().rowObjects;
					let persona = doc.data().nameSurname;
					let clientTime = new Date();

					rowObjects.forEach(object => {
						if (object.id > 0) {
							object.color = document.getElementById(
								`format-${object.id}`
							).style.backgroundColor;

							if (object.id == Number.parseInt(target.id)) {
								object.counter = Number.parseInt(
									document.getElementById(`counter-${object.id}`).innerHTML
								);

								object.counter++;
							}
							object.target = Number.parseInt(
								document.getElementById(`target-${object.id}`).value
							);
						}
						object.name = document.getElementById(`table-${object.id}`).value;
						object.platform = document.getElementById(
							`platform-${object.id}`
						).value;
						object.casino = document.getElementById(
							`casino-${object.id}`
						).value;
					});
					db.collection('dailyChecking')
						.doc(userUID)
						.update({
							rowObjects: rowObjects,
							tracking: firebase.firestore.FieldValue.arrayUnion({
								name: tableName,
								platform: platform,
								casino: casino,
								qa: persona,
								id: target.id,
								when: clientTime,
							}),
						})
						.then(function () {
							let x = Number.parseInt(counter.innerHTML),
								y = goal.value;
							x++;
							counter.innerHTML = x;

							if (x >= y) {
								counter.classList.add('valid');
								counter.classList.remove('invalid');
							} else {
								counter.classList.add('invalid');
								counter.classList.remove('valid');
							}
							newToaster('Added', 'success');
							target.blur();
							target.removeAttribute('disabled');
						})
						.catch(function (error) {
							newToaster('Error', 'fail');
							target.blur();
							target.removeAttribute('disabled');
							console.error(error);
						});
				} else {
					let rowObjects = doc.data().rowObjects;
					let update = rowObjects[target.id];
					update.casino = casino;
					update.name = tableName;
					update.platform = platform;
					update.counter = Number.parseInt(counter.innerHTML);
					update.target = Number.parseInt(goal.value);
					rowObjects[target.id] = update;
					db.collection('dailyChecking')
						.doc(userUID)
						.update({
							rowObjects: rowObjects,
						})
						.then(function () {
							newToaster('Updated', 'success');
							target.blur();
							target.removeAttribute('disabled');
						})
						.catch(function (error) {
							newToaster('Error', 'fail');
							target.blur();
							target.removeAttribute('disabled');
							console.error(error);
						});
				}
			})
			.catch(error => {
				newToaster('Error', 'fail');
				target.blur();
				target.removeAttribute('disabled');
				console.error(error);
			});
	} else if (target.id === 'save-button' && event.type === 'click') {
		let newTableRowOrder = [];

		//Copying each node of the original array with parameter of TRUE to copy ALL the children
		//This approach is used to deal with the deep reference issue, which can't be bypassed with
		//Spread operator, Object.assign or JSON.parse(JSON.stringify())
		for (let i = 0; i < tableRows.length; i++) {
			newTableRowOrder.push(tableRows[i].cloneNode(true));
		}

		//sorting rows based on target value in a descending order
		newTableRowOrder.sort(
			(a, b) => Number.parseInt(b[3].value) - Number.parseInt(a[3].value)
		);

		//Re-assigning values to DOM elements
		for (let i = 0; i < newTableRowOrder.length; i++) {
			// DIVs and SPANs are not elements, thus need to be accessed through children
			tableRows[i].id = newTableRowOrder[i].id;
			tableRows[i].children[0].id = newTableRowOrder[i].children[0].id;
			tableRows[i].children[0].style.backgroundColor =
				newTableRowOrder[i].children[0].style.backgroundColor;
			tableRows[i][0].id = newTableRowOrder[i][0].id;
			tableRows[i][0].value = newTableRowOrder[i][0].value;
			tableRows[i][1].id = newTableRowOrder[i][1].id;
			tableRows[i][1].value = newTableRowOrder[i][1].value;
			tableRows[i][2].id = newTableRowOrder[i][2].id;
			tableRows[i][2].value = newTableRowOrder[i][2].value;
			tableRows[i].children[4].id = newTableRowOrder[i].children[4].id;
			tableRows[i].children[4].innerText =
				newTableRowOrder[i].children[4].innerText;
			tableRows[i][3].id = newTableRowOrder[i][3].id;
			tableRows[i][3].value = newTableRowOrder[i][3].value;
			tableRows[i][4].id = newTableRowOrder[i][4].id;
		}

		tableRows = document.querySelectorAll('.table-row');
		allCounters = document.querySelectorAll('.counter');
		allTargets = document.querySelectorAll('.target');

		for (let i = 0; i < allCounters.length; i++) {
			let counter = allCounters[i];
			let x = Number.parseInt(allCounters[i].innerHTML);
			let y = allTargets[i].value;

			if (x >= y) {
				counter.classList.add('valid');
				counter.classList.remove('invalid');
			} else {
				counter.classList.add('invalid');
				counter.classList.remove('valid');
			}
		}

		// getting the entire firestore array, because you can't update specific values in the cloud
		db.collection('dailyChecking')
			//changing the following userUID helps copying row state between users
			.doc(userUID)
			.get()
			.then(function (doc) {
				let rowObjects = doc.data().rowObjects;

				for (let i = 0; i < tableRows.length; i++) {
					rowObjects[i + 1].id = tableRows[i].id.substring(
						tableRows[i].id.indexOf('-') + 1
					);
					rowObjects[i + 1].color =
						tableRows[i].children[0].style.backgroundColor;

					rowObjects[i + 1].name = tableRows[i][0].value;

					rowObjects[i + 1].platform = tableRows[i][1].value;

					rowObjects[i + 1].casino = tableRows[i][2].value;

					rowObjects[i + 1].counter = Number.parseInt(
						tableRows[i].children[4].innerHTML
					);
					rowObjects[i + 1].target = Number.parseInt(tableRows[i][3].value);
				}

				db.collection('dailyChecking')
					.doc(userUID)
					.update({
						rowObjects: rowObjects,
					})
					.then(function () {
						target.blur();
					})
					.catch(function (error) {
						console.log(error);
					});
			})
			.catch(error => {
				console.log(error);
			});
	} else if (target.id === 'reset-button' && event.type === 'click') {
		//getting the entire firestore array, because you can't update specific values in the cloud
		db.collection('dailyChecking')
			//changing the following userUID helps copying row state between users
			.doc(userUID)
			.get()
			.then(function (doc) {
				let rowObjects = doc.data().rowObjects;
				let tracking = doc.data().tracking;
				let time7daysAgo = new Date().getTime() / 1000 - 604800;
				let newTracking = tracking.filter(
					item => item.when.seconds > time7daysAgo
				);

				rowObjects.forEach(object => {
					object.counter = 0;
				});
				db.collection('dailyChecking')
					.doc(userUID)
					.update({
						rowObjects: rowObjects,
						tracking: newTracking,
					})
					.then(function () {
						document.querySelectorAll('.counter').forEach(counter => {
							counter.innerHTML = 0;
							counter.classList.remove('valid');
							counter.classList.add('invalid');
							target.blur();
						});
					})
					.catch(function (error) {
						console.log(error);
					});
			})
			.catch(error => {
				console.log(error);
			});
	} else if (target.classList.contains('target') && event.type === 'change') {
		let counter = document.getElementById(
				`counter-${target.id.substring(target.id.indexOf('-') + 1)}`
			),
			goal = target;

		let x = Number.parseInt(counter.innerHTML),
			y = goal.value;

		if (x >= y) {
			counter.classList.add('valid');
			counter.classList.remove('invalid');
		} else {
			counter.classList.add('invalid');
			counter.classList.remove('valid');
		}
	} else if (target.id === 'undo-button' && event.type === 'click') {
		target.setAttribute('disabled', 'disabled');
		allCounters = document.querySelectorAll('.counter');

		let currentAmount = 0;
		allCounters.forEach(
			item => (currentAmount += Number.parseInt(item.innerHTML))
		);

		//stopping users from deleting data from previous sessions - if the sum of all counters = 0, then nothing is removed
		if (currentAmount > 0) {
			db.collection('dailyChecking')
				//changing the following userUID helps copying row state between users
				.doc(userUID)
				.get()
				.then(function (doc) {
					let rowObjects = doc.data().rowObjects;
					let tracking = doc.data().tracking;
					let lastTracked = tracking.pop();

					// Decrementing counter for the corresponding Object
					rowObjects[
						rowObjects.findIndex(object => object.id === lastTracked.id)
					].counter--;

					//updating row counter value in the DB
					db.collection('dailyChecking')
						.doc(userUID)
						.update({
							rowObjects: rowObjects,
							tracking: tracking,
						})
						.then(function () {
							let matchedCounter = document.getElementById(
								`counter-${lastTracked.id}`
							);
							let matchedCountersTarget = document.getElementById(
								`target-${lastTracked.id}`
							);

							matchedCounter.innerHTML--;

							if (
								Number.parseInt(matchedCounter.innerHTML) >=
								matchedCountersTarget.value
							) {
								matchedCounter.classList.add('valid');
								matchedCounter.classList.remove('invalid');
							} else {
								matchedCounter.classList.add('invalid');
								matchedCounter.classList.remove('valid');
							}

							newToaster('Removed', 'success');
							target.removeAttribute('disabled');
						})
						.catch(error => {
							newToaster('Retry', 'fail');
							target.removeAttribute('disabled');
							console.error(error);
						});
				})
				.catch(error => {
					newToaster('Retry', 'fail');
					target.removeAttribute('disabled');
					console.error(error);
				});
		} else {
			newToaster('Invalid', 'fail');
			target.removeAttribute('disabled');
		}
	} else if (
		target.classList.contains('row-format') &&
		event.type === 'click'
	) {
		// toggling the panel if it is already open
		if (target.childNodes.length > 1) {
			document.getElementById('color-panel').remove();
		} else {
			document.querySelectorAll('#color-panel').forEach(item => {
				item.remove();
			});
			const colorPanel = document.createElement('div');
			colorPanel.id = 'color-panel';
			colorPanel.style.cssText = `position: absolute; right: 14px; bottom: 0px`;
			colorPanel.innerHTML =
				'<div class="color-option option-one"></div><div class="color-option option-two"></div>' +
				'<div class="color-option option-three"></div><div class="color-option option-four"></div>' +
				'<div class="color-option option-five"></div><div class="color-option option-six"></div>' +
				'<div class="color-option option-seven"></div><div class="color-option option-eight"></div>' +
				'<div class="color-option option-nine"></div><div class="color-option option-ten"></div>' +
				'<div class="color-option option-eleven"></div><div class="color-option option-twelve"></div>';

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
			.then(function (doc) {
				let rowObjects = doc.data().rowObjects;
				let rowToFormat =
					rowObjects[
						target
							.closest('.row-format')
							.id.substring(target.closest('.row-format').id.indexOf('-') + 1)
					];
				document.getElementById('color-panel').remove();
				rowToFormat.color = chosenTagColor;
				db.collection('dailyChecking').doc(userUID).update({
					rowObjects: rowObjects,
				});
			})
			.catch(error => {
				console.error(error);
			});
	}
};

const clearInputValues = event => {
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

const moveRows = event => {
	if (event.type === 'dragstart') {
		event.dataTransfer.setData('text', event.target.closest('.table-row').id);

		let targetID = event.dataTransfer.getData('text');
		let currentRowIndex;

		document.getElementById(targetID).classList.add('move-rows-target-up');

		for (let i = 0; i < tableRows.length; i++) {
			if (tableRows[i].id === targetID) {
				currentRowIndex = i;
			}
		}

		for (let i = currentRowIndex; i < tableRows.length - 1; i++) {
			tableRows[i + 1].classList.add('move-rows-target-down');
		}
	} else if (
		event.type === 'dragenter' &&
		event.target.classList.contains('drag') &&
		!event.target
			.closest('.table-row')
			.classList.contains('move-rows-target-up')
	) {
		let direction = 'up';

		event.target
			.closest('.table-row')
			.classList.contains('move-rows-target-down')
			? (direction = 'down')
			: (direction = 'up');

		if (document.getElementById('temp-row')) {
			document.getElementById('temp-row').remove();
		}

		let tempRow = document.createElement('div');
		tempRow.id = 'temp-row';
		tempRow.classList.add(event.target.id);
		tempRow.style.width = '100%';
		tempRow.style.height = '20px';
		tempRow.style.backgroundColor = 'white';
		tempRow.style.border = '1px dotted black';
		tempRow.style.borderRadius = '3px';
		tempRow.style.marginTop = '3px';

		switch (direction) {
			case 'up':
				event.target.closest('.table-row').before(tempRow);
				break;
			case 'down':
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

		let data = event.dataTransfer.getData('text');
		document.getElementById(data).classList.remove('move-rows-target-up');

		for (let i = 1; i <= tableRows.length; i++) {
			document
				.getElementById('row-' + i)
				.classList.remove('move-rows-target-down');
		}

		event.target.before(document.getElementById(data));
		event.target.remove();
		event.dataTransfer.clearData();

		tableRows = document.querySelectorAll('.table-row');

		//=================================================================

		// Following code re-apply IDs in ascending order

		//=================================================================

		// //Re-assigning values to DOM elements
		// for (let i = 0; i < tableRows.length; i++) {
		// 	// DIVs and SPANs are not elements, thus need to be accessed through children
		// 	tableRows[i].id = 'row-' + (i + 1);
		// 	tableRows[i].children[0].id = 'format-' + (i + 1);
		// 	tableRows[i][0].id = 'table-' + (i + 1);
		// 	tableRows[i][1].id = 'platform-' + (i + 1);
		// 	tableRows[i][2].id = 'casino-' + (i + 1);
		// 	tableRows[i].children[4].id = 'counter-' + (i + 1);
		// 	tableRows[i][3].id = 'target-' + (i + 1);
		// 	tableRows[i][4].id = i + 1;
		// }

		// tableRows = document.querySelectorAll('.table-row');

		//=================================================================

		// getting the entire firestore array, because you can't update specific values in the cloud
		db.collection('dailyChecking')
			//changing the following userUID helps copying row state between users
			.doc(userUID)
			.get()
			.then(function (doc) {
				let rowObjects = doc.data().rowObjects;

				for (let i = 0; i < tableRows.length; i++) {
					rowObjects[i + 1].id = tableRows[i].id.substring(
						tableRows[i].id.indexOf('-') + 1
					);
					rowObjects[i + 1].color =
						tableRows[i].children[0].style.backgroundColor;

					rowObjects[i + 1].name = tableRows[i][0].value;

					rowObjects[i + 1].platform = tableRows[i][1].value;

					rowObjects[i + 1].casino = tableRows[i][2].value;

					rowObjects[i + 1].counter = Number.parseInt(
						tableRows[i].children[4].innerHTML
					);
					rowObjects[i + 1].target = Number.parseInt(tableRows[i][3].value);
				}

				db.collection('dailyChecking')
					.doc(userUID)
					.update({
						rowObjects: rowObjects,
					})
					.then(function () {})
					.catch(function (error) {
						console.error(error);
					});
			})
			.catch(error => {
				console.error(error);
			});
	} else if (event.type === 'drop' && event.target.id !== 'temp-row') {
		if (document.getElementById('temp-row')) {
			document.getElementById('temp-row').remove();

			let data = event.dataTransfer.getData('text');
			document.getElementById(data).classList.remove('move-rows-target-up');

			for (let i = 1; i <= tableRows.length; i++) {
				document
					.getElementById('row-' + i)
					.classList.remove('move-rows-target-down');
			}
			tableRows = document.querySelectorAll('.table-row');
		}
	}
};

//Added another eventlistener due to DOM Event delegation
checkRows.addEventListener('click', updateCounterAndOptions);
checkRows.addEventListener('keyup', updateCounterAndOptions);
checkRows.addEventListener('mouseover', updateCounterAndOptions);
checkRows.addEventListener('mouseout', updateCounterAndOptions);
checkRows.addEventListener('change', updateCounterAndOptions);
//using focusin over focus because it bubbles through the checkRows,
//thus there is no need to assign multiple elements
checkRows.addEventListener('focusin', clearInputValues);

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
		document.cookie = 'color-schema=css/light.css;max-age=695520‬';
	} else {
		theBall.style.transitionDuration = '0.2s';
		styleSheet.href = 'css/dark.css';
		document.cookie = 'color-schema=css/dark.css;max-age=695520';
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
		event.target.id !== 'save-button' &&
		event.target.id !== 'undo-button'
	) {
		hiddenMenu.style.visibility = 'hidden';
	}

	if (
		!event.target.classList.contains('row-format') &&
		!event.target.classList.contains('color-option') &&
		event.target.id !== 'color-panel' &&
		document.getElementById('color-panel')
	) {
		document.getElementById('color-panel').remove();
	}
};
