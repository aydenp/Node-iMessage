const imessage = require('osa-imessage');

class Message {
    constructor(msg, manager) {
        this.msg = msg;
        this.text = msg.text;
        this.chat = manager.getChat(msg.group || msg.handle);
        this.fromSelf = msg.fromMe;
    }

    reply(text) {
        return this.chat.send(text);
    }
}

class MessageChat {
    constructor(id, manager) {
        this.manager = manager;
        this.id = id;
    }

    send(text) {
        return this.manager.send(this.id, text);
    }

    register(callback) {
        if (!this.callbacks) {
            this.callbacks = [];
            this.manager.register((msg) => {
                if (msg.chat.id == this.id) this.callbacks.forEach((callback) => callback(msg));
            });
        }
        this.callbacks.push(callback);
    }
}

class MessageClient {
    constructor() {
        this.chats = {};
        this.listeners = [];

        imessage.listen().on("message", (orig) => {
            const msg = new Message(orig, this);
            this.listeners.forEach((callback) => callback(msg));
        });
    }

    getChat(id) {
        if (!this.chats[id]) this.chats[id] = new MessageChat(id, this);
        return this.chats[id];
    }

    register(callback) {
        this.listeners.push(callback);
    }

    send(id, text) {
        imessage.send(id, text);
    }
}

module.exports = MessageClient;