'use strict';
// Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyCOiJc8EKT9DyXyuAKPeKpJLnvYs_vINFU',
	authDomain: 'starlit-braid-276207.firebaseapp.com',
	databaseURL: 'https://starlit-braid-276207.firebaseio.com',
	projectId: 'starlit-braid-276207',
	storageBucket: 'starlit-braid-276207.appspot.com',
	messagingSenderId: '30277815528',
	appId: '1:30277815528:web:517d7d0743d3d5530a4d5d',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const styleSheet = document.getElementById('style'),
	themeToggle = document.querySelector('.theme-label'),
	themeSwitch = document.querySelector('#switch'),
	theBall = document.querySelector('.ball'),
	loginForm = document.getElementById('login-form'),
	emailDiv = document.getElementById('email-div'),
	passwordDiv = document.getElementById('password-div'),
	txtUser = document.getElementById('txt-user'),
	txtPass = document.getElementById('txt-pass'),
	loginButton = document.getElementById('login-button'),
	logoutButton = document.getElementById('logout-button'),
	newTable = document.querySelector('#new-table'),
	newCasino = document.querySelector('#new-casino'),
	addTableBtn = document.querySelector('#add-table'),
	addCasinoBtn = document.querySelector('#add-casino'),
	tableList = document.querySelector('#table-list'),
	casinoList = document.querySelector('#casino-list'),
	auth = firebase.auth(),
	db = firebase.firestore();

let userUID;

//Add login event
loginButton.addEventListener('click', function () {
	const email = txtUser.value;
	const pass = txtPass.value;
	const authPromise = auth.signInWithEmailAndPassword(email, pass);

	authPromise
		.then(function () {
			console.log('Login successful!');
			txtUser.classList.remove('empty-value');
			txtPass.classList.remove('empty-value');
		})
		.catch(error => {
			console.error(error.message);
			if (
				error.message ===
				'There is no user record corresponding to this identifier. The user may have been deleted.'
			) {
				txtUser.classList.add('empty-value');
				txtUser.focus();
			} else if (
				error.message ===
				'The password is invalid or the user does not have a password.'
			) {
				txtPass.classList.add('empty-value');
				txtPass.focus();
			}
		});
});

firebase.auth().onAuthStateChanged(dailyCheckingUser => {
	if (dailyCheckingUser) {
		userUID = dailyCheckingUser.uid;
		let greeting = document.createElement('h6');
		let qa;
		switch (userUID) {
			case 'eckYksePcfdox9I4FLVwTe72bSk1':
				qa = 'Ottigan';
				break;
			case '1BRPSY3Q0yOeI7ReCCrRuVx0Fdo2':
				qa = 'Unicorn';
				break;
			case '2Rvrq1fn5sdCWnpxZbT3lZrUbDm1':
				qa = 'Martiwka';
				break;
			case 'w967NxXDmwUxMMhhKyQizzF5B8S2':
				qa = 'Boss';
				break;
			case 'a6CtpqvK26SqM1sulP86gCL5jYB2':
				qa = 'Sette e Mezzo';
				break;
			case 'Y9MfBHGQ0YdC8k2XHBbQtgRQ6m72':
				qa = '4chan.org/g/audio_god';
				break;
			case 'B1sw8yVyBfTuguw1tKizaHy7AFY2':
				qa = 'Falcon';
				break;
			case 'sBQRKGFdyiXkTgkxOJzEEUfF8m32':
				qa = 'Mr.Ponytail';
				break;
			default:
				qa = '';
		}
		greeting.innerText = `Welcome, ${qa}!`;
		greeting.style.cssText =
			'margin-bottom: 3px; align-self: flex-end; color: white; visibility: visible; font-family: Georgia, "Times New Roman", Times, serif; font-weight: 400';
		logoutButton.before(greeting);

		logoutButton.style.display = 'inline';
		emailDiv.style.display = 'none';
		passwordDiv.style.display = 'none';
		loginButton.style.display = 'none';

		const getData = function () {
			db.collection('dailyChecking')
				.doc('tables')
				.get()
				.then(function (doc) {
					if (doc.exists) {
						let data = doc.data();
						data.names.forEach(value => addTableListItem(value));
					} else {
						// doc.data() will be undefined in this case
						console.log('No such document!');
					}
				})
				.catch(function (error) {
					console.log('Error getting document:', error);
				});
			db.collection('dailyChecking')
				.doc('casinos')
				.get()
				.then(function (doc) {
					if (doc.exists) {
						let data = doc.data();
						data.names.forEach(value => addCasinoListItem(value));
					} else {
						console.log('No such document!');
					}
				})
				.catch(function (error) {
					console.log('Error getting document:', error);
				});
		};
		getData();
	} else {
		logoutButton.style.display = 'none';
		emailDiv.style.display = 'flex';
		passwordDiv.style.display = 'flex';
		loginButton.style.display = 'inline';
	}
});

logoutButton.addEventListener('click', function () {
	auth.signOut().then(function () {
		document.querySelector('h6').remove();
		logoutButton.classList = 'hide-logout';
	});
});

addTableBtn.onclick = function () {
	let newTableValue = newTable.value;
	let empty = newTableValue.trim();

	if (!empty) {
		newTable.classList.add('empty-value');
		newTable.focus();
	} else {
		newTable.value = '';
		newTable.classList.remove('invalid');
		addTableListItem(newTableValue);
		db.collection('dailyChecking')
			.doc('tables')
			.update({
				names: firebase.firestore.FieldValue.arrayUnion(newTableValue),
			})
			.then(function () {
				console.log('New Table added');
			})
			.catch(function (error) {
				console.error('Error adding document: ', error);
			});
	}
};

const addTableListItem = item => {
	const listItem = document.createElement('li');
	// listItem.innerText = item;
	listItem.style.paddingLeft = '2px';
	listItem.classList.add('l-decoration', 'flex', 'jc-sb', 'ai-c', 'list-item');
	listItem.innerHTML = `${item}<button type="button" style="width: 10%" class="remove">x</button>`;
	tableList.prepend(listItem);
};

addCasinoBtn.onclick = function () {
	let newCasinoValue = newCasino.value;
	let empty = newCasinoValue.trim();

	if (!empty) {
		newCasino.classList.add('empty-value');
		newCasino.focus();
	} else {
		newCasino.value = '';
		newCasino.classList.remove('invalid');
		addCasinoListItem(newCasinoValue);
		db.collection('dailyChecking')
			.doc('casinos')
			.update({
				names: firebase.firestore.FieldValue.arrayUnion(newCasinoValue),
			})
			.then(function () {
				console.log('New Casino added');
			})
			.catch(function (error) {
				console.error('Error adding document: ', error);
			});
	}
};

const addCasinoListItem = item => {
	const listItem = document.createElement('li');
	listItem.classList.add('l-decoration', 'flex', 'jc-sb', 'ai-c', 'list-item');
	listItem.innerHTML = `${item}<button type="button" style="width: 10%" class="remove">x</button>`;
	casinoList.prepend(listItem);
};

const removeTableOperation = event => {
	let target = event.target;
	let listInner = target.closest('.list-item').innerHTML;
	let listValue = listInner.substring(0, listInner.indexOf('<', 0));
	if (target.classList.contains('remove')) {
		db.collection('dailyChecking')
			.doc('tables')
			.update({
				names: firebase.firestore.FieldValue.arrayRemove(listValue),
			})
			.then(function () {
				target.closest('.list-item').remove();
			})
			.catch(function (error) {
				console.error('Error adding document: ', error);
			});
	}
};

const removeCasinoOperation = event => {
	let target = event.target;
	let listInner = target.closest('.list-item').innerHTML;
	let listValue = listInner.substring(0, listInner.indexOf('<', 0));
	if (target.classList.contains('remove')) {
		db.collection('dailyChecking')
			.doc('casinos')
			.update({
				names: firebase.firestore.FieldValue.arrayRemove(listValue),
			})
			.then(function () {
				target.closest('.list-item').remove();
			})
			.catch(function (error) {
				console.error('Error adding document: ', error);
			});
	}
};

tableList.addEventListener('click', removeTableOperation);

casinoList.addEventListener('click', removeCasinoOperation);

newTable.addEventListener('keypress', function (e) {
	if (e.key === 'Enter') {
		event.preventDefault();
		let newTableValue = newTable.value;
		let empty = newTableValue.trim();

		if (!empty) {
			alert('Empty Value!');
			newTable.classList.add('invalid');
			newTable.focus();
		} else {
			newTable.value = '';
			newTable.classList.remove('invalid');
			addTableListItem(newTableValue);
			db.collection('dailyChecking')
				.doc('tables')
				.update({
					names: firebase.firestore.FieldValue.arrayUnion(newTableValue),
				})
				.then(function () {
					console.log('New Table added');
				})
				.catch(function (error) {
					console.error('Error adding document: ', error);
				});
		}
	}
});

newCasino.addEventListener('keypress', function (e) {
	if (e.key === 'Enter') {
		event.preventDefault();
		let newCasinoValue = newCasino.value;
		let empty = newCasinoValue.trim();

		if (!empty) {
			alert('Empty Value!');
			newCasino.classList.add('invalid');
			newCasino.focus();
		} else {
			newCasino.value = '';
			newCasino.classList.remove('invalid');
			addCasinoListItem(newCasinoValue);
			db.collection('dailyChecking')
				.doc('casinos')
				.update({
					names: firebase.firestore.FieldValue.arrayUnion(newCasinoValue),
				})
				.then(function () {
					console.log('New Casino added');
				})
				.catch(function (error) {
					console.error('Error adding document: ', error);
				});
		}
	}
});

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
