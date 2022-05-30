require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const request = require('request')
const mongoose = require('mongoose');
// const express = require("express");


// const bot = new TelegramBot(process.env.TOKEN, { polling: true });
// console.log(process.env.NODE_ENV);
// const app = express();

const URL = process.env.APP_URL;
const TOKEN = process.env.BOT_TOKEN;
const DB = process.env.DATABASE;
// const webHook = { webHook: {port: process.env.PORT, autoOpen: false}};
// const pooling = {pooling: {autoStart: false }};
// const options = process.env.NODE_ENV === "production" ? webHook : pooling;
var bot;

if(process.env.NODE_ENV === 'production') {
    bot = new TelegramBot(token);
    bot.setWebHook(process.env.HEROKU_URL + TOKEN);
  }
  else {
    bot = new TelegramBot(TOKEN, { polling: true });
  }

mongoose.connect(DB);

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    items: [{name: String, date: String}],
    tasks: [{event: String}]
})

const User = mongoose.model("User", userSchema);

// bot.on("polling_error", (err) => console.log(err));

const markdownEnable = {parse_mode: "Markdown"};








bot.onText(/\/start/, function(msg, match) {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '* Hello! 👋 My name is Mate 🤠 I am made for you 😎*\n\n' +
    'I can bring many informations for you such as news 📰, weather 🌤, movie detail 🎥 \nAlso I can save your favourite dates ❤️ and daily tasks 📝 in me! 😉 \n\n_Would you like to try me ?_ Type /help !', markdownEnable)
})

bot.onText(/\/help/, function(msg, match) {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '\nHi 👋 there 🤩, you can give me commands like this...\n\n' +
    '♦ General Purpose --\n\n' +
    '➡️ To get news : \n/news {city/anything}\n' +
    '➡️ To get weather report : \n/weather {city}\n' +
    '➡️ To get a movie detail : \n/movie {movie name}\n\n' + 
    '♦ Save your favourite date and make to-do list -- \n\n' + 
    '➡️ To create id : \n/createmyid {username} {password}\n\n' +
    '➡️ To insert an event & date : \n/insert {your_username} {your_password} {event} {date}\n\n' + 
    '➡️ To remove an event & date : \n/remove {your_username} {your_password} {event}\n\n' + 
    '➡️ To view your favoruite dates : \n/view {your_username} {your_password}\n\n' +
    '➡️ To drop your favoruite dates : \n/dropmyfavdate {your_username} {your_password}\n\n\n' +
    '➡️ To add task in your todo list : \n/add {your_username} {your_password} {task}\n\n' +
    '➡️ To delete task in your todo list : \n/done {your_username} {your_password} {task}\n\n' + 
    '➡️ To view your todo list : \n/todo {your_username} {your_password}\n\n' + 
    '➡️ To drop your todo list : \n/dropmytodo {your_username} {your_password}\n\n' +
    '♦ More feature --\n\n' + 
    '➡️ To get details of a user on leetcode : \n' + '/leetcode {username}\n\n' +
    '➡️ To get details of a user on codeforces : \n' + '/codeforces {username}\n\n'
    );
})

bot.onText(/\/movie (.+)/, function (msg, match) {
    var movie = match[1];
    var chatId = msg.chat.id;
    
    request('http://www.omdbapi.com/?t=' + movie + '&apikey=' + process.env.M_API,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                bot.sendMessage(chatId, '_Looking for ' + movie + '..._', markdownEnable)
                .then((msg) => {
                    res = JSON.parse(body)

                    bot.sendPhoto(chatId, res.Poster, {
                        caption: '\nTitle : '  + res.Title + 
                        '\n➡️ Genre : ' + res.Genre + 
                        '\n➡️ IMDB : ' + res.imdbRating + '/10' + 
                        '\n➡️ Released : ' + res.Released + 
                        '\n\n➡️ Language Available : ' + res.Language + 
                        '\n➡️ Runtime : ' + res.Runtime + 
                        '\n➡️ BoxOffice : ' + res.BoxOffice + 
                        '\n\n➡️ Director : ' + res.Director + 
                        '\n➡️ Writers : ' + res.Writer + 
                        '\n➡️ Actors : ' + res.Actors + 
                        '\n\nStory Line : ' + res.Plot
                    }).catch(function(err) {
                        bot.sendMessage(chatId, 'Opps, ' + movie + ' not found! 😞');
                    })
                }).catch(function(err) {
                    bot.sendMessage(chatId, 'Opps, ' + movie + ' not found! 😞');
                })
            } else {
                bot.sendMessage(chatId, 'Opps! Something went wrong 😞');
            }
        }
    )
})

bot.onText(/\/news (.+)/, function (msg, match) {

	const city = match[1];
	const chatId = msg.chat.id;
    const query = 'https://gnews.io/api/v4/search?q=' + city + '&token='+ process.env.N_API + '&lang=en';

	request(query, function (error, response, body) {

		if (!error && response.statusCode == 200) {

			bot.sendMessage(chatId,
				'_Looking for details of_ ' + city
				+ '...', { parse_mode: "Markdown" })
				.then((msg) => {
				res = JSON.parse(body)

                // bot.sendMessage(chatId, '_News of ' + city + '_', markdownEnable);
                for(let i=0; i<10; i++) {
                    bot.sendMessage(chatId, '\n*' + res.articles[i].title + '*' +
                        '\n\n' + res.articles[i].description + 
                        '\n\n➡️ _Published at : ' + res.articles[i].publishedAt + '_' +
                        '\n\n➡️ _Source : ' + res.articles[i].source.name + '_', markdownEnable
                    )
                }
			}).catch(function(err) {
                bot.sendMessage(chatId, 'Opps! I can\'t find it\'s news! 😞');
            })

		}
	})
})


bot.onText(/\/weather (.+)/, function (msg, match) {

	const city = match[1];
	const chatId = msg.chat.id;
	const query ='http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + process.env.W_API;

	// Key obtained from openweathermap API
	request(query, function (error, response, body) {

		if (!error && response.statusCode == 200) {

			bot.sendMessage(chatId, '_Looking for details of_ ' + city + '...', { parse_mode: "Markdown" })
            .then((msg) => {
                res = JSON.parse(body)
                var temp = Math.round((parseInt(
                    res.main.temp_min) - 273.15), 2)

                // Kelvin to celsius and then round
                // off and conversion to atm
                var pressure = Math.round(parseInt(
                        res.main.pressure) - 1013.15)

                var rise = new Date(parseInt(
                        res.sys.sunrise) * 1000);

                var set = new Date(parseInt(
                        res.sys.sunset) * 1000);
                // Unix time to IST time conversion

                bot.sendMessage(chatId, '* ' + res.name + ' *\n' + 
                    '\n➡️Temperature: ' + String(temp) + '°C' + 
                    '\n➡️Humidity: ' + res.main.humidity + ' %' + 
                    '\n➡️Weather: ' + res.weather[0].description +
                    '\n➡️Pressure: ' + String(pressure) + ' atm' + 
                    '\n\n➡️Sunrise: ' + rise.toLocaleTimeString() +
                    '\n➡️Sunset: ' + set.toLocaleTimeString() +
                    '\n\n➡️Country: ' + res.sys.country, markdownEnable
                )
            }).catch(function(err) {
                bot.sendMessage(chatId, 'Opps! City not found 😞');
            })
		} else {
            bot.sendMessage(chatId, 'Opps! Something went wrong 😞');
        }
	})
})

bot.onText(/\/createmyid (.+)/, function(msg, match) {
    const chadId = msg.chat.id;
    const value = match[1].split(" ");

    if(value.length !== 2) {
        bot.sendMessage(chadId, 'Seems an invalid command! 🧐 Try again...');
    } else {
        const user_name = value[0];
        const user_password = value[1];

        User.findOne({username: user_name}, function(err, foundUser) {
            if(!err) {
                if(foundUser) {
                    bot.sendMessage(chadId, 'You are an existing user! 😌 \nAdd your item directly using \n/insert {your_username} {your_password} {event} {date}\n\n' + 
                    'Add tasks in todo lisk using\n /add {your_username} {your_password} {task}\n\n' + 
                    'Note that your event, date and task should be in camel case...');
                } else {
                    const newuser = new User({
                        username: user_name,
                        password: user_password,
                        items: [],
                        tasks : []
                    });
                    newuser.save();
                    bot.sendMessage(chadId, 'Created! 💯 \nAdd your item directly using \n/insert {your_username} {your_password} {event} {date}\n\n' + 
                    'Add tasks in todo lisk using\n /add {your_username} {your_password} {task}\n\n' + 
                    'Note that your event, date and task should be in camel case...');
                }
            } else {
                bot.sendMessage(chadId, 'Opps! Some error occured 😔');
            }
        })
    }
})

bot.onText(/\/insert (.+)/, function(msg, match) {
    const chatId = msg.chat.id;
    const value = match[1].split(" ");

    if(value.length !== 4) {
        bot.sendMessage(chatId, 'Seems an invalid command! 🧐 Try again..' +
        '\n\nNote that you are not adding any spaces in Date and Event 😕')
    } else {
        const user_name = value[0];
        const user_password = value[1];
        const item = value[2];
        const date = value[3];
        User.find({username: user_name}, function(err, foundUser) {
            if(!err) {
                if(!foundUser[0]) {
                    bot.sendMessage(chatId, 'Seems like you are not registered! 🧐\n\nTo get registered, type /createmyid {your_username} {your_password}');
                }
                else if(foundUser[0].password === user_password) {
                    const newitem = {
                        name: item,
                        date: date
                    };
                    foundUser[0].items.push(newitem);
                    foundUser[0].save();
                    bot.sendMessage(chatId, 'Item saved! 💯 \n\nTo view your list, type /view {your_username} {your_password}');
                } else {
                    bot.sendMessage(chatId, 'Incorrect password! 😵‍💫\n\nTry again with the same command');
                }
            } else {
                bot.sendMessage(chatId, 'Opps! Some error occured 😔');
            }
        })
    }
})

bot.onText(/\/remove (.+)/, function(msg, match) {
    const chatId = msg.chat.id;
    const value = match[1].split(" ");

    if(value.length != 3) {
        bot.sendMessage(chatId, 'Seems an invalid command! 🧐 Try again..' +
        '\n\nNote that you are not adding any spaces in Date and Event 😕')
    } else {
        const user_username = value[0];
        const user_password = value[1];
        const user_item = value[2];

        User.findOneAndUpdate({username: user_username, $and:[ { password: user_password }]}, {$pull: {items: {name: user_item}}} ,function(err, foundUser) {
            if(err) {
                bot.sendMessage(chatId, 'Opps! Some error occured! 😔');
            } else {
                // console.log(foundUser);
                bot.sendMessage(chatId, 'Done! 💯 \nType /view {your_username} {your_password}\n\nTo see your fav dates!  ❤ ');
            }
        })
    }
})


bot.onText(/\/view (.+)/, function(msg, match) {
    const chatId = msg.chat.id;
    const value = match[1].split(" ");
    
    if(value.length !== 2) {
        bot.sendMessage(chatId, 'Seems an invalid command 😵‍💫 Try again..')
    }
    else {
        const user_name = value[0];
        const password = value[1];
        User.find({username: user_name}, function(err, foundUser) {
            if(!err) {
                if(foundUser[0]) {
                    if(foundUser[0].password === password) {
                        let message = "";
                        for(let i=0; i<foundUser[0].items.length; i++) {
                            message = message + '\n' + foundUser[0].items[i].name + " - " + foundUser[0].items[i].date;
                        }

                        bot.sendMessage(chatId, 'Hi ' + user_name + '👋 Your fav ❤ dates - \n' + message + 
                        '\n\nTo remove a particular fav date, \nType /remove {your_username} {your_password} {your_event}');
                    } else {
                        bot.sendMessage(chatId, 'Incorrect password! 😕 \n\nTry again with the same command');
                    }
                } else {
                    bot.sendMessage(chatId, 'Seems like you are not registered! 🧐 \n\nTo get registered, type /createmyid {your_username} {your_password}');
                }
            } else {
                bot.sendMessage(chatId, 'Opps! Some error occured 😔');
            }
        })
    }
})

bot.onText(/\/dropmyfavdate (.+)/, function(msg, match) {
    const chatId = msg.chat.id;
    const value = match[1].split(" ");

    if(value.length !== 2) {
        bot.sendMessage(chatId, 'Invalid command! 😵‍💫	\nType /dropmyfavdate {your_username} {your_password}}\n\n _Make sure there is not any white space in any of the two items!_' ,markdownEnable);
    } else {
        const user_username = value[0];
        const user_password = value[1];

        User.find({username: user_username}, function(err, foundUser) {
            if(err) {
                bot.sendMessage(chatId, 'Opps! Some error occured! 😔');
            } else {
                if(foundUser[0]) {
                    if(foundUser[0].password === user_password) {
                        foundUser[0].items = [];
                        foundUser[0].save();
                        bot.sendMessage(chatId, 'Sucessfully droped! 💯	');
                    } else {
                        bot.sendMessage(chatId, 'Password is incorrect! 😕 \nTry again with the same command...');
                    }
                } else {
                    bot.sendMessage(chatId, 'Username not found! 😕\nSeems like you are not registered 🧐' + 
                    '\n\nType /createmyid {username} {password}\nTo get registered');
                }
            }
        })
    }
})

bot.onText(/\/add (.+)/, function(msg, match) {
    const chatId = msg.chat.id;
    const value = match[1].split(" ");

    if(value.length != 3) {
        bot.sendMessage(chatId, 'Invalid command! Type {your_username} {your_password} {event to add}\n\nMake sure there is not any white space in any of the three items!');
    } else {
        const user_username = value[0];
        const user_password = value[1];
        const user_event = value[2];

        User.find({username: user_username}, function(err, foundUser) {
            if(err) {
                bot.sendMessage(chatId, 'Opps! Some error occured!');
            } else {
                if(foundUser[0]) {
                    if(foundUser[0].password === user_password) {
                        foundUser[0].tasks.push({event: user_event});
                        foundUser[0].save(function(err) {
                            if(!err) {
                                bot.sendMessage(chatId, 'Recorded! 💯 \n\nTo view your todos, \ntype /todo {your_username} {your_password}\n\nTo delete the done item\ntype /done {your_username} {your_password} {your_task}\n\nMake sure there is not any white space in any of the three items!');
                            } else {
                                bot.sendMessage(chatId, 'Opps! Some error occured! 😔');
                            }
                        });
                    } else {
                        bot.sendMessage(chatId, 'Password is incorrect! \nTry again with the same command...');
                    }
                } else {
                    bot.sendMessage(chatId, 'Username not found! 😕 \nSeems like you are not registered 🧐' + 
                    '\n\nType /createmyid {username} {password}\nTo get registered');
                }
            }
        })
    }
})

bot.onText(/\/done (.+)/, function(msg, match) {
    const chatId = msg.chat.id;
    const value = match[1].split(" ");

    if(value.length != 3) {
        bot.sendMessage(chatId, 'Invalid command! 😵‍💫 \nType {your_username} {your_password} {event to add}\n\n_Make sure there is not any white space in any of the three items!_', markdownEnable);
    } else {
        const user_username = value[0];
        const user_password = value[1];
        const user_event = value[2];

        User.findOneAndUpdate({username: user_username, $and:[ { password: user_password }]}, {$pull: {tasks: {event: user_event}}} ,function(err, foundUser) {
            if(err) {
                bot.sendMessage(chatId, 'Opps! Some error occured! 😔');
            } else {
                bot.sendMessage(chatId, 'Done! 💯 \nType /todo {your_username} {your_password}\n\nTo see your rest tasks!');
            }
        })
    }
})

bot.onText(/\/todo (.+)/, function(msg, match) {
    const chatId = msg.chat.id;
    const value = match[1].split(" ");

    if(value.length != 2) {
        bot.sendMessage(chatId, 'Invalid command! 😵‍💫	\nType /todo {your_username} {your_password}\n\n _Make sure there is not any white space in any of the two items!_' ,markdownEnable);
    } else {
        const user_username = value[0];
        const user_password = value[1];

        User.find({username: user_username}, function(err, foundUser) {
            if(err) {
                bot.sendMessage(chatId, 'Opps! Some error occured! 😔');
            } else {
                if(foundUser[0]) {
                    if(foundUser[0].password === user_password) {
                        let message = '*Hi ' + user_username + '👋 Your todos 📝* -\n';
                        for(let i=0; i<foundUser[0].tasks.length; i++) {
                            message = message + '\n' + (i+1) + '. ' + foundUser[0].tasks[i].event;
                        }
                        bot.sendMessage(chatId, message + '\n\n➡️ _If any item which you had deleted is still here, make sure you had typed the username and password correctly!_', markdownEnable);
                    } else {
                        bot.sendMessage(chatId, 'Password is incorrect! 😕 \nTry again with the same command...');
                    }
                } else {
                    bot.sendMessage(chatId, 'Username not found! 😕\nSeems like you are not registered 🧐' + 
                    '\n\nType /createmyid {username} {password}\nTo get registered');
                }
            }
        })
    }
})


bot.onText(/\/dropmytodo (.+)/, function(msg, match) {
    const chatId = msg.chat.id;
    const value = match[1].split(" ");

    if(value.length !== 2) {
        bot.sendMessage(chatId, 'Invalid command! 😵‍💫	\nType /dropmylist {your_username} {your_password}}\n\n _Make sure there is not any white space in any of the two items!_' ,markdownEnable);
    } else {
        const user_username = value[0];
        const user_password = value[1];

        User.find({username: user_username}, function(err, foundUser) {
            if(err) {
                bot.sendMessage(chatId, 'Opps! Some error occured! 😔');
            } else {
                if(foundUser[0]) {
                    if(foundUser[0].password === user_password) {
                        foundUser[0].tasks = [];
                        foundUser[0].save();
                        bot.sendMessage(chatId, 'Sucessfully droped! 💯	');
                    } else {
                        bot.sendMessage(chatId, 'Password is incorrect! 😕 \nTry again with the same command...');
                    }
                } else {
                    bot.sendMessage(chatId, 'Username not found! 😕\nSeems like you are not registered 🧐' + 
                    '\n\nType /createmyid {username} {password}\nTo get registered');
                }
            }
        })
    }
})

bot.onText(/\/leetcode (.+)/, function (msg, match) {

	const username = match[1];
	var chatId = msg.chat.id;
	var query ='https://leetcode-stats-api.herokuapp.com/' + username;

	request(query, function (error, response, body) {

		if (!error && response.statusCode == 200) {

            bot.sendChatAction(chatId, 'typing')
            .then((msg) => {
                res = JSON.parse(body)

                bot.sendMessage(chatId, 
                    '\nDetails of ' + username + '' + 
                    '\n\n➡️ Global Rank : ' + res.ranking + '🌎' +
                    '\n➡️ Total Problems: ' + res.totalSolved + ' / ' + res.totalQuestions +
                    '\n\nPorblem Category :' + 
                    '\n➡️ Easy - ' + res.easySolved + ' / ' + res.totalEasy + 
                    '\n➡️ Medium - ' + res.mediumSolved + ' / ' + res.totalMedium +
                    '\n➡️ Hard - ' + res.hardSolved + ' / ' + res.totalHard +
                    '\n\nOther Stats :' + 
                    '\n➡️ Acceptance Rate - ' + res.acceptanceRate + 
                    '\n➡️ Contribution Points - ' + res.contributionPoints +
                    '\n➡️ Reputation - ' + res.reputation
                );
			}).catch(function(err) {
                bot.sendMessage(chatId, 'Opps! Username not found 😞');
            })

		} else {
            bot.sendMessage(chatId, 'Opps! Username not found 😞');

        }
	})
})


bot.onText(/\/codeforces (.+)/, function (msg, match) {

	const username = match[1];
	var chatId = msg.chat.id;
	var query = 'https://competitive-coding-api.herokuapp.com/api/codeforces/' + username;

	request(query, function (error, response, body) {

		if (!error && response.statusCode == 200) {

			bot.sendChatAction(chatId, 'typing')
				.then((msg) => {
                    res = JSON.parse(body)
                    
                    let totalProblems = 0;
                    for(let i=0; i<res.contests.length; i++) {
                        totalProblems = totalProblems + parseInt(res.contests[i].Solved);
                    }

                    let avgProblems = parseFloat(totalProblems / res.contests.length);

                    bot.sendMessage(chatId, 
                        '\nDetails of ' + username +
                        '\n\nRank : ' + res.rank +
                        '\n\nCurrent Rating : ' + res.rating + 
                        '\nCurrent Rank : ' + res.rank + 
                        '\nNo. of active contests : ' + res.contests.length +
                        '\nTotal solved problems in all contests : ' + totalProblems +
                        '\nAverage Problems per contest : ' + avgProblems
                    );
			}).catch(function(err) {
                bot.sendMessage(chatId, 'Opps! Username not found 😞');

            })
		} else {
            bot.sendMessage(chatId, 'Opps! Username not found 😞');

        }
	})
})

bot.onText(/^[^/]/, function(msg, match) {
    bot.sendMessage(msg.chat.id, 'I didn\'t get it! 😵‍💫\nSee /help 🙄	');
})

// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }

// app.listen(port);