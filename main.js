var Discord = require('discord.io');
var logger = require('winston');
var config = require('./config.json');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
	colorize: true
});
logger.level = 'debug';

var userQueue = [];
var queueRole = "";
var inviteRole = "";

var bot = new Discord.Client({
	token: config.token,
	autorun: true
});

bot.on('ready', function (evt) {
	logger.info('Connected');
	logger.info('Logged in as: ');
	logger.info(bot.username + ' - (' + bot.id + ')');

	var roles = bot.servers[Object.keys(bot.servers)[0]].roles;

	for (var role in roles) {
		if(roles[role].name == config.inviteRoleName) {
			inviteRole = role;
		}

		if(roles[role].name == config.queueRoleName) {
			queueRole = role;
		}
	}
});

bot.on('message', function (user, userID, channelID, message, evt) {
	if (bot.channels[channelID]) return;
	if (message.substring(0, 1) == '!') {
		var args = message.substring(1).split(' ');
		var cmd = args[0];
		args = args.splice(1);
		switch(cmd) {
			case 'queue':
				if(bot.servers[Object.keys(bot.servers)[0]].members[userID].roles.indexOf(queueRole) == -1) return;

				if(userQueue.indexOf(userID) == -1) {
					userQueue.push(userID);
					bot.sendMessage({
						to: userID,
						message: 'You have been queued! There is currently ' + (userQueue.length -1) + ' people ahead of you'
					});
				} else {
					bot.sendMessage({
						to: userID,
						message: 'You are already in the queue.'
					});
				}
			break;

			case 'invite':
				if(bot.servers[Object.keys(bot.servers)[0]].members[userID].roles.indexOf(inviteRole) == -1) return;

				bot.sendMessage({
					to: userID,
					message: 'Sent out invites.'
				});

				for (var i = 15; i >= 0; i--) {
					if(userQueue.length > 0) {
						var uID = userQueue.shift();
						bot.sendMessage({
							to: uID,
							message: 'You have been selected to join the game: ' + args[0] + '. Please join quickly!'
						});
					}
				}
			break;

			case 'clear':
				if(bot.servers[Object.keys(bot.servers)[0]].members[userID].roles.indexOf(inviteRole) == -1) return;

				userQueue = [];
				bot.sendMessage({
					to: userID,
					message: 'Queue cleared.'
				});
			break;

			case 'count':
				if(bot.servers[Object.keys(bot.servers)[0]].members[userID].roles.indexOf(inviteRole) == -1) return;

				bot.sendMessage({
					to: userID,
					message: 'There are currently ' + userQueue.length + ' people in queue.'
				});
			break;
		 }
	 }
});