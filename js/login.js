'use strict';

// Your web app's Firebase configuration
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

const auth = firebase.auth(),
	loginForm = document.getElementById('login-form'),
	user = document.getElementById('email'),
	password = document.getElementById('password'),
	loginBtn = document.getElementById('login-btn'),
	resetBtn = document.getElementById('reset-password-btn');

// Add login event
loginForm.addEventListener('submit', event => {
	event.preventDefault();
	const email = user.value;
	const pass = password.value;
	const authPromise = auth.signInWithEmailAndPassword(email, pass);

	authPromise
		.then(function () {
			window.location.replace('main.html');
		})
		.catch(error => {
			console.error(error.message);
			if (
				error.message ===
				'There is no user record corresponding to this identifier. The user may have been deleted.'
			) {
				user.classList.add('empty-value');
				user.focus();
			} else if (
				error.message ===
				'The password is invalid or the user does not have a password.'
			) {
				password.classList.add('empty-value');
				password.focus();
			}
		});
});

resetBtn.onclick = () => {
	auth
		.sendPasswordResetEmail(user.value)
		.then(function () {
			console.log('Check Email');
			resetBtn.blur();
		})
		.catch(function (error) {
			// An error happened.
		});
};
