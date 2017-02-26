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
//   jiefu
//

function getUsers(msg, robot) {
  // console.log(robot.brain.data.users);
  // console.log(robot.brain.data.users['U413G7M3K']);

  let all_users = robot.brain.data.users;
  let user_keys = Object.keys(all_users);
  let message = " ";
  
  for (let count = 0; count < user_keys.length; count++) {
    message += all_users[user_keys[count]].name;
  }

  // Returns User IDs for given channel
  let usersInChannel = getAllUsersInChannel(msg, robot, "coffee-chats");

  // From here, think of algorithm to pair up all users
  let allPairs = _pairUpUsersForSlack(usersInChannel);
  console.log(allPairs);

  // Iterate through all the pairs, and print out their real names
  let pairMessage =  "";
  for (let count = 0; count < allPairs.length; count++) {
    let currPair = allPairs[count];
    pairMessage += "Pair " + (count + 1) + ": "
    for (let numIndividuals = 0; numIndividuals < currPair.length; numIndividuals++) {
      pairMessage += currPair[numIndividuals];
      pairMessage += ", ";
    }
    pairMessage += "\n";
  }

  return msg.send(pairMessage);
}

function _pairUpUsersForSlack(usersInChannel) {
  // Ideas:
  // 1. Robot brain retains a dictionary of people -> array of people that they've already interviewed
  // 2. Generate pairs and check if any of them violate the constraints held by the brain
  _shuffleUsers(usersInChannel);

  // Pairs of IDs for now, but later we can have pairs of people's names
  let pairs = []
  let pair = []
  let numUsers = usersInChannel.length;
  let iterateUntil = numUsers % 2 == 1 ? numUsers - 3 : numUsers;

  // What if there are only 3 people?
  if (usersInChannel.length <= 3) {
    pairs.push(usersInChannel);
    return pairs;
  }

  for (let i = 0; i < iterateUntil; i += 2) {
    // Add two people to a pair at a time
    pair = []
    pair.push(iterateUntil[i]);
    pair.push(iterateUntil[i + 1]);
    // Add pair to pairs
    pairs.push(pair);
  }

  // Add a final group of 3 people
  if (numUsers % 2 == 1) {
    pair = []
    pair.push(iterateUntil[numUsers - 1]);
    pair.push(iterateUntil[numUsers - 2]);
    pair.push(iterateUntil[numUsers - 3]);
    pairs.push(pair);
  }

  // Do a check here for if any of the pairs violate the pairing (or do this a level higher)
  return pairs;
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

function getAllUsersInChannel(msg, robot, channelName) {
  let slackChannelDatastore = robot.adapter.client.format.dataStore;

  let allSlackChannels = slackChannelDatastore.channels;
  let allSlackUsers    = slackChannelDatastore.users;
  let channelKeys      = Object.keys(allSlackChannels);
  let userKeys         = Object.keys(allSlackUsers);

  // The channel object corresponding to channelName, if it exists
  let thisChannelMemberIdObject = null;
  let thisChannelMemberNames = [];

  channelKeys.forEach(function(channelID) {
      let currChannel = allSlackChannels[channelID];

      if (currChannel.name === channelName) {
        thisChannelMemberIdObject = currChannel.members;
        console.log(thisChannelMemberIdObject);
      }
  });

  for (var i = 0; i < thisChannelMemberIdObject.length; i++) {
    let memberID = thisChannelMemberIdObject[i]
    if (userKeys.indexOf(memberID) > -1) {
      let userObject = allSlackUsers[memberID];
      thisChannelMemberNames.push(userObject.name);
    }
  }

  return thisChannelMemberNames;
}

module.exports = function(robot) {
  robot.respond(/proc/i, function(msg) {
    return getUsers(msg, robot);
  });
  robot.respond(/how do you do (.*)/i, function (msg) {
    msg.send("Hello world!");
  });
  robot.respond(/proc2/i, function(msg) {
    let from_user = msg.message.user.name;
    return msg.send("hey " + from_user);
  });
};