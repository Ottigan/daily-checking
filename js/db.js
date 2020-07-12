'use strict';
// Firebase configuration
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
	logOutButton = document.getElementById('logout-button'),
	popOutBtn = document.getElementById('pop-out'),
	themeToggle = document.querySelector('.theme-label'),
	themeSwitch = document.querySelector('#switch'),
	theBall = document.querySelector('.ball'),
	trackingFrom = document.querySelector('#tracking-from'),
	trackingTo = document.querySelector('#tracking-to'),
	trackingName = document.querySelector('#tracking-name'),
	trackingPlatform = document.querySelector('#tracking-platform'),
	trackingCasino = document.querySelector('#tracking-casino'),
	trackingSearchBtn = document.querySelector('#tracking-button'),
	dbForm = document.querySelector('#db-form'),
	gameTableNames = document.getElementById('names'),
	casinoNames = document.getElementById('casinos'),
	dbData = document.getElementById('db-data'),
	tableBody = document.querySelector('tbody'),
	auth = firebase.auth(),
	db = firebase.firestore(),
	displayDataInTable = function () {
		let loadingBar = document.createElement('div');
		loadingBar.id = 'loading-bar';
		loadingBar.innerHTML = '<div id="loading-body"></div>';
		dbData.append(loadingBar);

		tableBody.innerHTML = '';
		csvArray = '';
		dbTracking = '';
		trackingSearchBtn.blur();
		if (csvButton) {
			csvButton.remove();
		}

		if (online) {
			// Timeout added for better visual transition, otherwise the info loads too fast...
			setTimeout(() => {
				//fetching data from all user profiles about the check performed
				db.collection('dailyChecking')
					.orderBy('tracking')
					.get()
					.then(function (data) {
						data.forEach(function (doc) {
							// doc.data() is never undefined for query doc snapshots
							if (doc.data().hasOwnProperty('tracking')) {
								// not possible to .concat an empty array
								if (!dbTracking) {
									dbTracking = doc.data().tracking;
								} else {
									dbTracking = dbTracking.concat(doc.data().tracking);
								}
							}
						});

						// when data is stored we remove the bar
						document.getElementById('loading-bar').remove();

						//Sorting in descending order the gathered check objects Newest => Oldest
						dbTracking.sort((a, b) => b.when.seconds - a.when.seconds);

						dbTracking.forEach(object => {
							// using toISOString because the format is the easiest to adapt for Excel
							let timeISO = new Date(
								(object.when.seconds + 10800) * 1000
							).toISOString();
							let date = timeISO.substring(0, timeISO.indexOf('T'));
							let time = timeISO.substring(
								timeISO.indexOf('T') + 1,
								timeISO.indexOf('.')
							);

							let timeToString = date + ' ' + time;

							let objectSeconds = object.when.seconds;
							let fromSeconds =
								Date.parse(trackingFrom.value) / 1000 ||
								new Date().setDate(new Date().getDate() - 1) / 1000;
							let toSeconds =
								Date.parse(trackingTo.value) / 1000 ||
								new Date().setDate(new Date().getDate() + 1) / 1000;

							const rowElement = document.createElement('tr');
							rowElement.classList.add('flex');
							rowElement.innerHTML = `<td>${object.name}</td>
								<td>${object.platform}</td>
								<td>${object.casino}</td>
								<td>${object.qa}</td>
                                <td>${timeToString}</td>`;

							if (
								fromSeconds <= objectSeconds &&
								objectSeconds <= toSeconds &&
								trackingName.value === object.name &&
								trackingPlatform.value === object.platform &&
								trackingCasino.value === object.casino
							) {
								tableBody.append(rowElement);
								csvArray += `\n${object.name},${object.platform},${object.casino},${object.qa},${timeToString}`;
							} else if (
								fromSeconds <= objectSeconds &&
								objectSeconds <= toSeconds &&
								trackingName.value === object.name &&
								trackingPlatform.value === object.platform
							) {
								tableBody.append(rowElement);
								csvArray += `\n${object.name},${object.platform},${object.casino},${object.qa},${timeToString}`;
							} else if (
								fromSeconds <= objectSeconds &&
								objectSeconds <= toSeconds &&
								trackingCasino.value === object.casino &&
								trackingPlatform.value === object.platform
							) {
								tableBody.append(rowElement);
								csvArray += `\n${object.name},${object.platform},${object.casino},${object.qa},${timeToString}`;
							} else if (
								fromSeconds <= objectSeconds &&
								objectSeconds <= toSeconds &&
								trackingName.value === object.name &&
								trackingCasino.value === object.casino
							) {
								tableBody.append(rowElement);
								csvArray += `\n${object.name},${object.platform},${object.casino},${object.qa},${timeToString}`;
							} else if (
								fromSeconds <= objectSeconds &&
								objectSeconds <= toSeconds &&
								trackingName.value === object.name
							) {
								tableBody.append(rowElement);
								csvArray += `\n${object.name},${object.platform},${object.casino},${object.qa},${timeToString}`;
							} else if (
								fromSeconds <= objectSeconds &&
								objectSeconds <= toSeconds &&
								trackingCasino.value === object.casino
							) {
								tableBody.append(rowElement);
								csvArray += `\n${object.name},${object.platform},${object.casino},${object.qa},${timeToString}`;
							} else if (
								fromSeconds <= objectSeconds &&
								objectSeconds <= toSeconds &&
								trackingPlatform.value === object.platform
							) {
								tableBody.append(rowElement);
								csvArray += `\n${object.name},${object.platform},${object.casino},${object.qa},${timeToString}`;
							} else if (
								fromSeconds <= objectSeconds &&
								objectSeconds <= toSeconds &&
								!trackingName.value &&
								!trackingPlatform.value &&
								!trackingCasino.value
							) {
								tableBody.append(rowElement);
								csvArray += `\n${object.name},${object.platform},${object.casino},${object.qa},${timeToString}`;
							}
						});
						if (tableBody.childElementCount > 1) {
							let csv = document.createElement('button');
							csv.style.cssText = 'width: 50px; margin-top: 10px';
							csv.innerHTML = 'CSV';
							csv.id = 'csv-button';
							csv.type = 'button';

							dbData.append(csv);
							csvButton = document.getElementById('csv-button');
						}
					})
					.catch(function (error) {
						console.log('Error getting documents: ', error);
					});
			}, 1200);
		}
	};

let userUID,
	dbTracking,
	tablesDB,
	casinosDB,
	csvButton,
	online = false,
	csvArray = '';

firebase.auth().onAuthStateChanged(function (dailyCheckingUser) {
	if (dailyCheckingUser) {
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

		//fetching data for dynamic Table Name suggestions
		db.collection('dailyChecking')
			.doc('tables')
			.get()
			.then(function (doc) {
				tablesDB = doc.data().names;
			})
			.catch(function (error) {
				console.error(error);
			});

		//fetching data for dynamic Casino Name suggestions
		db.collection('dailyChecking')
			.doc('casinos')
			.get()
			.then(function (doc) {
				casinosDB = doc.data().names;
			})
			.catch(function (error) {
				console.error(error);
			});

		online = true;
		displayDataInTable();
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

const updateOptions = function (event) {
	let target = event.target;
	//Logic to ignore mouse clicks due to them being undefined
	let eventKey = event.key ? event.key : 0;

	let optionArray = [];

	if (eventKey !== 'Shift') {
		gameTableNames.innerHTML = '';
		casinoNames.innerHTML = '';
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
		(target.name === 'casino' &&
			event.type === 'keyup' &&
			eventKey.length === 1) ||
		(target.name === 'casino' && eventKey === 'Backspace')
	) {
		casinoNames.innerHTML = '';
		casinosDB.forEach(value => {
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

		casinosDB.forEach(value => {
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
			let casinosOptionItem = document.createElement('option');
			casinosOptionItem.value = option;

			casinoNames.append(casinosOptionItem);
		});
	}
};

dbForm.addEventListener('click', updateOptions);
dbForm.addEventListener('keyup', updateOptions);

trackingSearchBtn.onclick = displayDataInTable;

dbData.addEventListener('click', function (event) {
	if (event.target.id === 'csv-button') {
		let hiddenCSV = document.createElement('a');
		hiddenCSV.href =
			'data:text/csv;charset=utf-8,' +
			encodeURI('Game Table,Platform,Casino,QA,Timestamp' + csvArray);
		hiddenCSV.target = '_blank';
		hiddenCSV.download = 'daily checking data.csv';
		hiddenCSV.click();
	}
});
