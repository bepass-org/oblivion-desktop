import EventEmitter from 'events';

export const customEvent = new EventEmitter();

/*
    EXAMPLE: 👇
*/

// listen for an event
customEvent.on('greet', () => {
    // do something
});

// trigger an event
customEvent.emit('greet');
