// Description:
//   For testing purposes
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//   hubot proc
//
// Author:
//   jiefu + milman
//

function getUsers(msg, robot, slackChannel) {
  let allUsers = robot.brain.data.users;
  let userKeys = Object.keys(allUsers);
  let response =  "";

  /* Names of all the users in a channel */
  let usersInChannel = getAllUsersInChannel(msg, robot, slackChannel);

  /* Randomized pairs of all the users */
  let allPairs = _pairUpAllUsers(usersInChannel);

  /* Generate and respond with all the pairs */
  for (let i = 0; i < allPairs.length; i++) {
    response += "Pair " + (i + 1) + ": "

    let currPair = allPairs[i];
    for (let numIndividuals = 0; numIndividuals < currPair.length; numIndividuals++) {
      response += currPair[numIndividuals] + " ";
    }
    response += "\n";
  }

  return response;
}

function _pairUpAllUsers(usersInChannel) {
  // Ideas:
  // 1. Robot brain retains a dictionary of people -> array of people that they've already interviewed
  // 2. Generate pairs and check if any of them violate the constraints held by the brain
  _shuffleUsers(usersInChannel);

  let pairs = [];
  let pair = [];
  let numUsers = usersInChannel.length;

  /* If there are less than 3 users in the channel, just return them */
  if (usersInChannel.length <= 3) {
    pairs.push(usersInChannel);
    return pairs;
  }

  /* Pair up all the users */
  for (let i = 0; i < numUsers; i += 2) {
    pair = [];
    pair.push(usersInChannel[i]);
    pair.push(usersInChannel[i + 1]);
    pairs.push(pair);
  }

  /* Create group of three if number of users in channel is odd */
  if (numUsers % 2 == 1) {
    pairs[0].push(usersInChannel(numUsers - 1));
  }

  return pairs;
}

function getAllUsersInChannel(msg, robot, channelName) {
  let slackChannelDatastore = robot.adapter.client.format.dataStore;

  /* All the slack channel objects in this slack */
  let allSlackChannels = slackChannelDatastore.channels;
  /* All the user objects in this slack */
  let allSlackUsers = slackChannelDatastore.users;
  /* Keys of all the channels, unique ID for each channel */
  let channelKeys = Object.keys(allSlackChannels);
  /* Keys of all the users, unique ID for each user */
  let userKeys = Object.keys(allSlackUsers);

  /* ID of the channel matching channelName, if it exists */
  let thisChannelMembers = null;
  /* List of all members belonging to this channel */
  let thisChannelMemberNames = [];

  channelKeys.forEach(function(channelID) {
      let currChannel = allSlackChannels[channelID];
      if (currChannel.name === channelName) {
        thisChannelMembers = currChannel.members;
      }
  });

  if (thisChannelMembers !== null) {
    for (let i = 0; i < thisChannelMembers.length; i++) {
      let memberID = thisChannelMembers[i];
      let memberObject = allSlackUsers[memberID];
      thisChannelMemberNames.push(memberObject.name);
    }
  }

  return thisChannelMemberNames;
}

function _shuffleUsers(usersInChannel) {
  // Uses the Fisher-Yates shuffle to randomly sort the list
  var m = usersInChannel.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = usersInChannel[m];
    usersInChannel[m] = usersInChannel[i];
    usersInChannel[i] = t;
  }

  return usersInChannel;
}

module.exports = function(robot) {
  robot.hear(/pair (.*)/i, function(msg) {
    let slackChannel = msg.match[1];
    return msg.send(getUsers(msg, robot, slackChannel));
  });
};