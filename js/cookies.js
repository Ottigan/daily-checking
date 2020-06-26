'use strict';

window.onload = function () {
	let prefSchema = document.cookie
		.split(';')
		.filter(word => word.includes('color-schema'))
		.join('');
	let prefSchemaValue = prefSchema.substring(prefSchema.indexOf('=') + 1);
	if (prefSchemaValue === 'css/light.css') {
		styleSheet.href = 'css/light.css';
		themeSwitch.checked = false;
	} else if (prefSchemaValue === 'css/dark.css') {
		styleSheet.href = 'css/dark.css';
		themeSwitch.checked = true;
	}
};
