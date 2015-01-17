var Reflux = require('reflux');
var _ = require('lodash');
var actions = require('../actions/channel.js');

var channels = {};

function initChannel(server, channel) {
	if (!(server in channels)) {
		channels[server] = {};
		channels[server][channel] = { users: [] };
	} else if (!(channel in channels[server])) {
		channels[server][channel] = { users: [] };
	}
}

var channelStore = Reflux.createStore({
	init: function() {
		this.listenToMany(actions);
	},

	joined: function(user, server, channel) {
		initChannel(server, channel);
		channels[server][channel].users.push(user);
		this.trigger(channels);
	},

	part: function(data) {
		_.each(data.channels, function(channel) {
			delete channels[data.server][channel];
		});
		this.trigger(channels);
	},

	parted: function(user, server, channel) {
		_.pull(channels[server][channel].users, user);
		this.trigger(channels);
	},

	setUsers: function(users, server, channel) {
		initChannel(server, channel);
		channels[server][channel].users = users;
		this.trigger(channels);
	},

	load: function(storedChannels) {
		_.each(storedChannels, function(channel) {
			initChannel(channel.server, channel.name);
			channels[channel.server][channel.name].users = channel.users;
		});
		this.trigger(channels);
	},

	getState: function() {
		return channels;
	}
});

module.exports = channelStore;