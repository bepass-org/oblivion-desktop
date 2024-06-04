import EventEmitter from 'events';

export const customEvent = new EventEmitter();

/*
    EXAMPLE: 👇
*/

// listen for an event
customEvent.on('greet', () => {
    console.log('Hello world!');
});

// trigger an event
customEvent.emit('greet');
