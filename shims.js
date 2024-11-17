globalThis.history = {
	back() {
		console.log('back()');
	},
	forward() {
		console.log('forward()');
	},
	go(i = 0) {
		console.log(`go(${i})`);
	}
};
