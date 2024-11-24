import { onClick, onClose, observeEvents, onLoad, onError, registerSignal, signal as signalAttr, controller as controllerAttr, registerController } from '@aegisjsproject/callback-registry/events.js';
import { createCallback, FUNCS, on } from '@aegisjsproject/callback-registry/callbacks.js';

const controller = new AbortController();
const signal = registerSignal(controller.signal);
const animController = new AbortController();
const animSignal = AbortSignal.any([controller.signal, animController.signal]);

function html(strings, ...values) {
	const template = document.createElement('template');

	template.setHTMLUnsafe(String.raw(strings, ...values.map(val => {
		if (val instanceof Function) {
			return createCallback(val);
		} else if (val instanceof AbortSignal) {
			return registerSignal(val);
		} else if (val instanceof AbortController) {
			return registerController(val);
		} else {
			return val?.toString() ?? '';
		}
	})));

	return template.content;
}

animSignal.addEventListener('abort', () => {
	cancelAnimationFrame(parseInt(document.getElementById('caf').dataset.animationFrame));
	requestAnimationFrame(() => document.getElementById('container').style.removeProperty('transform'));
});

function rotate(el = document.getElementById('container'), angle = 0, btn = document.getElementById('caf')) {
	el.style.setProperty('transform', `rotate(${angle}deg)`);
	btn.dataset.animationFrame = requestAnimationFrame(() => rotate(el, angle + 1), btn);
}

const getSvg = () => new Blob([`
	<svg viewBox="0 0 10 10" width="500" height="500" xmlns="http://www.w3.org/2000/svg">
		<rect fill="#${crypto.getRandomValues(new Uint8Array(3)).toHex()}" width="10" height="10" x="0" y="0" rx="1" ry="1"></rect>
	</svg>
`], { type: 'image/svg+xml' });

document.body.append(html`
	<nav id="nav" ${on('my:foo', ({
		type, timeStamp, isTrusted,
		detail: { type: dType, timeStamp: dtimeStamp, isTrusted: dIsTrusted, target: { tagName: target } } = {},
	}) => {
		const code = document.createElement('code');

		code.textContent = JSON.stringify({
			type, timeStamp, isTrusted,
			detail: { type: dType, timeStamp: dtimeStamp, isTrusted: dIsTrusted, target },
		}, null, 4) + ', ';

		code.slot = 'events';
		document.getElementById('container').append(code, ', ');
	}, { signal })}">
		<button type="button" ${onClick}="${FUNCS.navigate.reload}" ${signalAttr}="${signal}">Reload</button>
		<button type="button" ${onClick}="${FUNCS.navigate.close}" ${signalAttr}="${signal}">Close</button>
		<button type="button" ${onClick}="${FUNCS.ui.print}" ${signalAttr}="${signal}">Print</button>
		<button type="button" ${onClick}="${FUNCS.ui.showModal}" data-show-modal-selector="#dialog" ${signalAttr}="${signal}">Show Dialog</button>
		<button type="button" id="caf" ${onClick}="${FUNCS.ui.abortController}" ${controllerAttr}="${animController}" ${signalAttr}="${animSignal}">Cancel Animation</button>
		<button type="button" ${onClick}="${() => alert('Hello, World!')}">Alert</button>
		<button type="button" ${on('click', event => {
		const li = document.createElement('li');
		li.textContent = `${event.type} @ ${event.timeStamp}`;
		document.getElementById('list').append(li);
	}, { signal })}>Add to list</button>
		<button type="button" ${on('click', () => controller.abort(), { signal })}>Abort</button>
		<button type="button" ${on('click', event => event.target.parentElement.dispatchEvent(new CustomEvent('my:foo', { detail: event })), { signal })}>Foo</button>
	</nav>
	<main>
		<div id="container">
			<template shadowrootmode="open">
				<div part="container">
					<slot name="list"></slot>
					<pre part="events">[<slot name="events">No Events</slot>]</pre>
					<img src="${URL.createObjectURL(getSvg())}"
						${onLoad}="${FUNCS.ui.revokeObjectURL}"
						${onError}="${FUNCS.debug.error}"
						${on('click', ({ currentTarget }) => currentTarget.src = URL.createObjectURL(getSvg()))}
						${signalAttr}="${signal}"
					/>
				</div>
			</template>
			<ul id="list" slot="list"></ul>
		</div>
	</main>
	<footer></footer>
	<dialog id="dialog" ${onClose}="${FUNCS.debug.log}" ${signalAttr}="${signal}">
		<button type="button" ${onClick}="${FUNCS.ui.closeModal}" data-close-modal-selector="#dialog">Close</button>
	</dialog>
`);

observeEvents(document.body);
observeEvents(document.getElementById('container').shadowRoot.firstElementChild);
rotate();
