const firebase = require("./firebase");
const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const DialogflowApp = require('actions-on-google').DialogflowApp; // Google Assistant helper library
const User = require("./user");
const googleAssistantRequest = 'google'; // Constant to identify Google Assistant requests
const Quiche = require('quiche');


exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    console.log('Request headers: ' + JSON.stringify(request.headers));
    console.log('Request body: ' + JSON.stringify(request.body));
    // firebase.initializeApp(functions.config().firebase);
    // An action is a string used to identify what needs to be done in fulfillment
    let action = request.body.result.action; // https://dialogflow.com/docs/actions-and-parameters

    // Parameters are any entites that Dialogflow has extracted from the request.
    const parameters = request.body.result.parameters; // https://dialogflow.com/docs/actions-and-parameters

    // Contexts are objects used to track and store conversation state
    const inputContexts = request.body.result.contexts; // https://dialogflow.com/docs/contexts

    // Get the request source (Google Assistant, Slack, API, etc) and initialize DialogflowApp
    const requestSource = (request.body.originalRequest) ? request.body.originalRequest.source : undefined;
/**
 * user identificator
 * @type {string}
 */
    let userId = "";
    switch(requestSource) {
        case 'telegram':
        userId = request.body.originalRequest.data.message.from.id;
        break;
        case 'facebook':
        userId = request.body.originalRequest.data.sender.id;
    }
    /**
     * Insetring date
     * @type {Date}
     */
    const date = new Date();
    /**
     * @type {Object}
     */
    const app = new DialogflowApp({
        request: request,
        response: response
    });
    /**
     * Colors for grafic statistic
     * @type {array}
     */
    let Colors = ["4286f4","f4901e","f08080","4a6e73","00ffdf","281c08","008955","8b475d","ffc4a7","b485a0","cd5b45","186321"];

    /**
     * Create handlers for Dialogflow actions as well as a 'default' handler
     * @type {Object}
     * @static
     */
    const actionHandlers = {
        /**
         * The default welcome intent has been matched, welcome the user (https://dialogflow.com/docs/events#default_welcome_intent)
         */
        'input.welcome': () => {
            switch (requestSource) {
                case googleAssistantRequest:
                    sendGoogleResponse('Привет!!! \n Я очень рад тебя видеть! \n Теперь я буду твоим персональным помощником, и буду всячески помогать тебе следить за своими расходами. \n Сейчас я еще маленький, и только учусь понимать людей :) Но я обещаю, что буду расти и понимать тебя лучше! Надеюсь мы сработаемся)'); // Send simple response to user
                    break;
                case 'facebook':
                    sendResponse('Привет!!! \n Я очень рад тебя видеть! \n Теперь я буду твоим персональным помощником, и буду всячески помогать тебе следить за своими расходами. \n Сейчас я еще маленький, и только учусь понимать людей :) Но я обещаю, что буду расти и понимать тебя лучше! Надеюсь мы сработаемся)');
                    var jsonuser = request.body.originalRequest.data.sender;
                    /**
                     * facebook user
                     * @type {Object}
                     */
                    var user1 = {
                        id: jsonuser.id,
                        reg_date: date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear(),
                        chanell: requestSource
                    };
                    firebase.default.writeUserData(user1.id, user1);
                    break;
                case 'telegram':
                    sendResponse('Привет!!! \n Я очень рад тебя видеть! \n Теперь я буду твоим персональным помощником, и буду всячески помогать тебе следить за своими расходами. \n Сейчас я еще маленький, и только учусь понимать людей :) Но я обещаю, что буду расти и понимать тебя лучше! Надеюсь мы сработаемся)');
                    var jsonuser = request.body.originalRequest.data.message.from;
                    console.log('jsonuser: ' + JSON.stringify(jsonuser));
                     /**
                     * telegram user
                     * @type {Object}
                     */
                    var user1 = new User.default(jsonuser.first_name, jsonuser.last_name, jsonuser.id, date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear(), requestSource);
                    firebase.default.writeUserData(user1.id, user1);
                    break;
                default:
                    sendResponse('Привет!!! \n Я очень рад тебя видеть! \n Теперь я буду твоим персональным помощником, и буду всячески помогать тебе следить за своими расходами. \n Сейчас я еще маленький, и только учусь понимать людей :) Но я обещаю, что буду расти и понимать тебя лучше! Надеюсь мы сработаемся)');
                    break;
            }
            /**
             * Use the Actions on Google lib to respond to Google requests; for other requests use JSON
             */
            if (requestSource === googleAssistantRequest) {

            } else {
                /** 
                * Send simple response to user 
                 */
            }
        },
        /**
         * The default fallback intent has been matched, try to recover (https://dialogflow.com/docs/intents#fallback_intents)
        */
         'input.unknown': () => {
            // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
            if (requestSource === googleAssistantRequest) {
                sendGoogleResponse('I\'m having trouble, can you try that again?'); // Send simple response to user
            } else {
                SendSimpleResponseOnPostAction(request.body.result.fulfillment.speech); // Send simple response to user
            }
        },
        'post.chemicals': () => {
            firebase.default.writeCostData(userId, 'Бытовая химия', date, parameters);
            SendSimpleResponseOnPostAction(request.body.result.fulfillment.speech);
        },
        'post.others': () => {
            firebase.default.writeCostData(userId, 'Другое', date, parameters);
            SendSimpleResponseOnPostAction(request.body.result.fulfillment.speech);
        },
        'post.health': () => {
            firebase.default.writeCostData(userId, 'Здоровье', date, parameters);
            SendSimpleResponseOnPostAction(request.body.result.fulfillment.speech);
        },
        'post.utilities': () => {
            firebase.default.writeCostData(userId, 'Комунальные услуги', date, parameters);
            SendSimpleResponseOnPostAction(request.body.result.fulfillment.speech);
        },
        'post.clothes': () => {
            firebase.default.writeCostData(userId, 'Одежда', date, parameters);
            SendSimpleResponseOnPostAction(request.body.result.fulfillment.speech);
        },
        'post.eat': () => {
            firebase.default.writeCostData(userId, 'Питание', date, parameters);
            SendSimpleResponseOnPostAction(request.body.result.fulfillment.speech);
        },
        'post.toiletware': () => {
            firebase.default.writeCostData(userId, 'Предметы туалета', date, parameters);
            SendSimpleResponseOnPostAction(request.body.result.fulfillment.speech);
        },
        'post.travel': () => {
            firebase.default.writeCostData(userId, 'Путешествия', date, parameters);
            SendSimpleResponseOnPostAction(request.body.result.fulfillment.speech);
        },
        'post.entertainment': () => {
            firebase.default.writeCostData(userId, 'Развлечения', date, parameters);
            SendSimpleResponseOnPostAction(request.body.result.fulfillment.speech);
        },
        'post.family': () => {
            firebase.default.writeCostData(userId, 'Семья', date, parameters);
            SendSimpleResponseOnPostAction(request.body.result.fulfillment.speech);
        },
        'post.technique': () => {
            firebase.default.writeCostData(userId, 'Техника', date, parameters);
            SendSimpleResponseOnPostAction(request.body.result.fulfillment.speech);
        },
        'post.transport': () => {
            firebase.default.writeCostData(userId, 'Транспорт', date, parameters);
            SendSimpleResponseOnPostAction(request.body.result.fulfillment.speech);
        },
        'show.statistics.step1': () => {
            console.log(JSON.stringify(parameters));
            if (parameters.date != "") {
                var dateStat = new Date();
                var dateParametr = new Date(parameters.date);
                dateParametr.setHours(0,0,0,0);
                dateStat.setHours(0,0,0,0);
                dateStat.setTime(dateStat.getTime() - Math.abs(dateParametr.getTime() - dateStat.getTime()));
                console.log(dateStat.toDateString());
                firebase.default.GetCostsStatistics(userId, dateStat, 'eat').then((dictionary) => {
                    var str = 'Статистика трат от ' + dateStat.getDate() + '.' + (dateStat.getMonth()+1) + '.' + dateStat.getFullYear() +  ':\n';
                    for (key in dictionary) {
                        str = str + key + ' : ' + dictionary[key] + '\n';
                    }
                    SendSimpleResponseOnPostAction(str);
                });
            } else {
                sendRichResponse(request.body.result.fulfillment.speech, richResponsesStatisticsStep1);
            }
        },
        'show.statistics.step2': () => {
            var dateStat = new Date();
            var str = 'Статистика трат за ';
            console.log(request.body.result.resolvedQuery)
            switch (request.body.result.resolvedQuery) {
                case 'За день':
                str = str + 'день:\n';
                dateStat.setFullYear(dateStat.getFullYear(), dateStat.getMonth(), dateStat.getDate());
                dateStat.setHours(0,0,0,0);
                break;
                case 'За месяц':
                str = str = str + 'месяц:\n';
                dateStat.setFullYear(dateStat.getFullYear(), dateStat.getMonth(), 1);
                dateStat.setHours(0,0,0,0);
                break;
                case 'За все время':
                str = str = str + 'все время:\n';
                dateStat.setFullYear(2017, 0, 1);
                dateStat.setHours(0,0,0,0);
                break;
            }
            firebase.default.GetCostsStatistics(userId, dateStat, 'eat').then((dictionary) => {
                for (key in dictionary) {
                    str = str + key + ' : ' + dictionary[key] + '\n';
                }
                sendRichResponse(str, richResponsesStep2);
            });
        },
        'subscription.step1': () => {
            sendRichResponse(request.body.result.fulfillment.speech, richResponsesSubscriptionStep1);
        },
        'subscription.step2': () => {
            console.log(request.body.result.resolvedQuery)
            switch (request.body.result.resolvedQuery) {
                case 'Отменить подписку':
                firebase.default.UpdateSubscription(userId, 'none');
                break;
                case 'Раз в месяц':
                firebase.default.UpdateSubscription(userId, 'monthly');
                break;
                case 'Раз в неделю':
                firebase.default.UpdateSubscription(userId, 'weekly');
                break;
                case 'Каждый день':
                firebase.default.UpdateSubscription(userId, 'daily');
                break;
            }
            sendRichResponse(request.body.result.fulfillment.speech, richResponsesStep2);
        },
        'menu.open': () => {
            SendSimpleResponseOnPostAction('Test case menu');
        },
        'post.help': () => {
            SendSimpleResponseOnPostAction("Не можешь найти со мной общий язык?:с Ну не проблема, сейчас я тебе все быстренько обьясню)"+
            +			'\n'+'Добавить новый расход легко: просто попроси меня об этом, указав на что и какую сумму ты потратил, например: "Вкусняшки для любимого бота 200"'+
            +			'\n'+'Ты всегда можешь просмотреть статистику, указав за какой период и/или по какой категории данные тебя интерисуют, например: "статистика за месяц транспорт"'+
            +			+'\n'+'Кроме того, я могу даже красивенько нарисовать графики твоих расходов (талантливый бот талантлив во всем)). Просто задай период и/или категорию и я в ответ пришлю тебе свое творение.'+
            +			"\n"+"Ты можешь общатся со мной так, как тебе удобно, я все пойму, я же умненький)");
        },
        'graphics.step1': () => {
            if (parameters.date != "") {
                var dateStat = new Date();
                var dateParametr = new Date(parameters.date);
                dateParametr.setHours(0,0,0,0);
                dateStat.setHours(0,0,0,0);
                dateStat.setTime(dateStat.getTime() - Math.abs(dateParametr.getTime() - dateStat.getTime()));
                console.log(dateStat.toDateString());
                firebase.default.GetCostsStatistics(userId, dateStat, 'eat').then((dictionary) => {
                    var Counter = 0; 
                    var labels = [];
                    var pie = new Quiche('pie');
                    pie.setWidth(600);
                    pie.setHeight(400);
                    pie.setLegendBottom();
                    pie.setAutoScaling();
                    pie.setLegendColor('000000');
                    pie.setLegendSize(15);
                    for (key in dictionary) {
                        Counter++; 
                        pie.addData(dictionary[key],key,Colors[Counter]);
                        labels.push(key);
                    }
                    pie.setLabel(labels); // Add labels to pie segments
                    var imageUrl = pie.getUrl(true); // First param controls http vs. https
                    sendImageRichResponse(imageUrl, chartJsOptions);
                });
            } else {
                sendRichResponse(request.body.result.fulfillment.speech, richResponsesGraphicksStep1);
            }
        },
        'graphics.step2': () => {
            var dateStat = new Date();
            var str = 'Графики трат за ';
            switch (request.body.result.resolvedQuery) {
                case 'За день':
                str = str + 'день:\n';
                dateStat.setFullYear(dateStat.getFullYear(), dateStat.getMonth(), dateStat.getDate());
                dateStat.setHours(0,0,0,0);
                break;
                case 'За месяц':
                str = str = str + 'месяц:\n';
                dateStat.setFullYear(dateStat.getFullYear(), dateStat.getMonth(), 1);
                dateStat.setHours(0,0,0,0);
                break;
                case 'За все время':
                str = str = str + 'все время:\n';
                dateStat.setFullYear(2017, 0, 1);
                dateStat.setHours(0,0,0,0);
                break;
            }
            firebase.default.GetCostsStatistics(userId, dateStat, 'eat').then((dictionary) => {
                var labels = [];
                var Counter = 0; 
                var pie = new Quiche('pie');
                pie.setWidth(600);
                pie.setHeight(400);
                pie.setLegendBottom();
                pie.setAutoScaling();
                pie.setLegendColor('000000');
                pie.setLegendSize(15);
                for (key in dictionary) {
                    Counter++; 
                    pie.addData(dictionary[key], key, Colors[Counter]);
                    labels.push(key);
                }
                pie.setLabel(labels); // Add labels to pie segments
                var imageUrl = pie.getUrl(true); // First param controls http vs. https
                sendImageRichResponse(imageUrl, chartJsOptions);
            });
        },
        'location.step1': () => {
            if (parameters.date != "") {
                var dateStat = new Date();
                var dateParametr = new Date(parameters.date);
                dateParametr.setHours(0,0,0,0);
                dateStat.setHours(0,0,0,0);
                dateStat.setTime(dateStat.getTime() - Math.abs(dateParametr.getTime() - dateStat.getTime()));
                console.log(dateStat.toDateString());
                firebase.default.GetCostsStatisticsLocation(userId, dateStat).then((dictionary) => {
                    var Counter = 0; 
                    var labels = [];
                    var pie = new Quiche('pie');
                    pie.setWidth(600);
                    pie.setHeight(400);
                    pie.setLegendBottom();
                    pie.setAutoScaling();
                    pie.setLegendColor('000000');
                    pie.setLegendSize(15);
                    for (key in dictionary) {
                        Counter++; 
                        if (key == 'null' || key == "") continue;
                        pie.addData(dictionary[key],key,Colors[Counter]);
                        labels.push(key);
                    }
                    pie.setLabel(labels); // Add labels to pie segments
                    var imageUrl = pie.getUrl(true); // First param controls http vs. https
                    sendImageRichResponse(imageUrl, chartJsOptions);
                });
            } else {
                sendRichResponse(request.body.result.fulfillment.speech, richResponsesLocationsStep1);
            }
        },
        'location.step2': () => {
            var dateStat = new Date();
            var str = 'Графики контрагентов за ';
            switch (request.body.result.resolvedQuery) {
                case 'За день':
                str = str + 'день:\n';
                dateStat.setFullYear(dateStat.getFullYear(), dateStat.getMonth(), dateStat.getDate());
                dateStat.setHours(0,0,0,0);
                break;
                case 'За месяц':
                str = str = str + 'месяц:\n';
                dateStat.setFullYear(dateStat.getFullYear(), dateStat.getMonth(), 1);
                dateStat.setHours(0,0,0,0);
                break;
                case 'За все время':
                str = str = str + 'все время:\n';
                dateStat.setFullYear(2017, 0, 1);
                dateStat.setHours(0,0,0,0);
                break;
            }
            firebase.default.GetCostsStatisticsLocation(userId, dateStat).then((dictionary) => {
                var labels = [];
                var Counter = 0; 
                var pie = new Quiche('pie');
                pie.setWidth(600);
                pie.setHeight(400);
                pie.setLegendBottom();
                pie.setAutoScaling();
                pie.setLegendColor('000000');
                pie.setLegendSize(15);
                for (key in dictionary) {
                    if (key == 'null' || key == "") continue;
                    Counter++; 
                    pie.addData(dictionary[key], key, Colors[Counter]);
                    labels.push(key);
                }
                pie.setLabel(labels); // Add labels to pie segments
                var imageUrl = pie.getUrl(true); // First param controls http vs. https
                sendImageRichResponse(imageUrl, chartJsOptions);
            });
         },
        /**
         * Default handler for unknown or undefined actions
         */
        'default': () => {
            // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
            if (requestSource === googleAssistantRequest) {
                var responseToUser = {
                    //googleRichResponse: googleRichResponse, // Optional, uncomment to enable
                    //googleOutputContexts: ['weather', 2, { ['city']: 'rome' }], // Optional, uncomment to enable
                    speech: 'This message is from Dialogflow\'s Cloud Functions for Firebase editor!', // spoken response
                    displayText: 'This is from Dialogflow\'s Cloud Functions for Firebase editor! :-)' // displayed response
                };
                sendGoogleResponse(responseToUser);
            } else {
                SendSimpleResponseOnPostAction(request.body.result.fulfillment.speech);
            }
        }
    };

    // If undefined or unknown action use the default handler
    if (!actionHandlers[action]) {
        action = 'default';
    }

    // Run the proper handler function to handle the request from Dialogflow
    actionHandlers[action]();
/**
 * Use the Actions on Google lib to respond to Google requests; for other requests use JSON
 * @param {string} message 
 */
    function SendSimpleResponseOnPostAction(message) {
        if (requestSource === googleAssistantRequest) {
            sendGoogleResponse(message); // Send simple response to user
        } else {
            sendResponse(message); // Send simple response to user
        }
    }

    /**
     * send correctly formatted Google Assistant responses to Dialogflow which are then sent to the user
     * @param {string} responseToUser
     */
    function sendGoogleResponse(responseToUser) {
        if (typeof responseToUser === 'string') {
            app.ask(responseToUser); // Google Assistant response
        } else {
            // If speech or displayText is defined use it to respond
            let googleResponse = app.buildRichResponse().addSimpleResponse({
                speech: responseToUser.speech || responseToUser.displayText,
                displayText: responseToUser.displayText || responseToUser.speech
            });

            // Optional: Overwrite previous response with rich response
            if (responseToUser.googleRichResponse) {
                googleResponse = responseToUser.googleRichResponse;
            }

            // Optional: add contexts (https://dialogflow.com/docs/contexts)
            if (responseToUser.googleOutputContexts) {
                app.setContext(...responseToUser.googleOutputContexts);
            }

            app.ask(googleResponse); // Send response to Dialogflow and Google Assistant
        }
    }

   /**
    * send correctly formatted responses to Dialogflow which are then sent to the user
    * @param {string} responseToUser 
    */
    function sendResponse(responseToUser) {
        // if the response is a string send it as a response to the user
        if (typeof responseToUser === 'string') {
            let responseJson = {};
            responseJson.speech = responseToUser; // spoken response
            responseJson.displayText = responseToUser; // displayed response
            response.json(responseJson); // Send response to Dialogflow
        } else {
            // If the response to the user includes rich responses or contexts send them to Dialogflow
            let responseJson = {};

            // If speech or displayText is defined, use it to respond (if one isn't defined use the other's value)
            responseJson.speech = responseToUser.speech || responseToUser.displayText;
            responseJson.displayText = responseToUser.displayText || responseToUser.speech;

            // Optional: add rich messages for integrations (https://dialogflow.com/docs/rich-messages)
            responseJson.data = responseToUser.richResponses;

            // Optional: add contexts (https://dialogflow.com/docs/contexts)
            responseJson.contextOut = responseToUser.outputContexts;

            response.json(responseJson); // Send response to Dialogflow
        }
    }
    /**
    * If the response to the user includes rich responses or contexts send them to Dialogflow
    * If speech or displayText is defined, use it to respond (if one isn't defined use the other's value)
    * @param {string} responseToUser 
    * @param {string} richResponses 
    */
    function sendRichResponse(responseToUser, richResponses) {

        let responseJson = {};

        responseJson.speech = responseToUser;
        responseJson.displayText = responseToUser;

        // Optional: add rich messages for integrations (https://dialogflow.com/docs/rich-messages)
        responseJson.data = richResponses;
        switch(requestSource) {
            case 'telegram':
            responseJson.data.telegram.text = responseToUser;
            break;
            case 'facebook':
            break;
        }
        // Optional: add contexts (https://dialogflow.com/docs/contexts)
        //responseJson.contextOut = inputContexts;

        response.json(responseJson); // Send response to Dialogflow
    }
/**
 *  If the response to the user includes rich responses or contexts send them to Dialogflow
 * @param {string} imageUrl 
 * @param {string} richResponses 
 */
    function sendImageRichResponse(imageUrl, richResponses) {
        
                let responseJson = {};
                // If speech or displayText is defined, use it to respond (if one isn't defined use the other's value)
                responseJson.speech = request.body.result.fulfillment.speech;
                responseJson.displayText = request.body.result.fulfillment.speech;
        
                // Optional: add rich messages for integrations (https://dialogflow.com/docs/rich-messages)
                //responseJson.data = richResponses;
                //responseJson.data.telegram.attachment.imageUrl = imageUrl;
                responseJson.messages = imgMSG;
                responseJson.messages[0].imageUrl = imageUrl;
                // Optional: add contexts (https://dialogflow.com/docs/contexts)
                //responseJson.contextOut = inputContexts;
                response.json(responseJson); // Send response to Dialogflow
            }
});

/**
 * Construct rich response for Google Assistant
 * @type {Object}
 * @const 
 */
const app = new DialogflowApp();
const googleRichResponse = app.buildRichResponse()
    .addSimpleResponse('This is the first simple response for Google Assistant')
    .addSuggestions(
        ['Suggestion Chip', 'Another Suggestion Chip'])
    // Create a basic card and add it to the rich response
    .addBasicCard(app.buildBasicCard(`This is a basic card.  Text in a
 basic card can include "quotes" and most other unicode characters
 including emoji 📱.  Basic cards also support some markdown
 formatting like *emphasis* or _italics_, **strong** or __bold__,
 and ***bold itallic*** or ___strong emphasis___ as well as other things
 like line  \nbreaks`) // Note the two spaces before '\n' required for a
        // line break to be rendered in the card
        .setSubtitle('This is a subtitle')
        .setTitle('Title: this is a title')
        .addButton('This is a button', 'https://assistant.google.com/')
        .setImage('https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
            'Image alternate text'))
    .addSimpleResponse({
        speech: 'This is another simple response',
        displayText: 'This is the another simple response 💁'
    });

/**Rich response for both Slack and Facebook. Graphicks, step 1
 * @type {Object}
 * @const
 */
const richResponsesGraphicksStep1 = {
    'telegram': {
        "text": "Выбери нужный вариант:",
        "reply_markup": {
            "keyboard": [
                [
                    "За все время",
                    "За месяц",
                    "За день",
                ],
                [
                    "Главное меню"
                ]
            ],
            "one_time_keyboard": true,
            "resize_keyboard": true
        }
    }
};
/**Rich response for both Slack and Facebook. Statistic, step 1
 * @type {Object}
 * @const
 */
const richResponsesStatisticsStep1 = {
    'telegram': {
        "text": "Выбери нужный тебе вариант :)",
        "reply_markup": {
            "keyboard": [
                [
                    "За все время",
                    "За месяц",
                    "За день"
                ],
                [
                    "Главное меню"
                ]
            ],
            "one_time_keyboard": true,
            "resize_keyboard": true
        }
    }
};
/**Rich response for both Slack and Facebook. Location, step 1
 * @type {Object}
 * @const
 */
const richResponsesLocationsStep1 = {
    "telegram": {
        "text": "Выбери период для графиков по контрагентам:",
        "reply_markup": {
            "keyboard": [
                [
                    "За день",
                    "За месяц",
                    "За все время"
                ],
                [
                    "Главное меню"
                ]
            ],
            "one_time_keyboard": true,
            "resize_keyboard": true
        }
    }
};
/**Rich response for both Slack and Facebook. Step 2
 * @type {Object}
 * @const
 */
const richResponsesStep2 = {
    'telegram': {
        "text": "Выбери нужный тебе вариант: ",
        "reply_markup": {
            "keyboard": [
                [
                    "Статистика",
                    "Графики"
                ],
                [
                    "Контрагенты",
                    "Справка"
                ]
            ],
            "one_time_keyboard": true,
            "resize_keyboard": true
        }
    }
};

let imgMSG = [
    {
        "type": 3,
        "platform": "telegram",
        "imageUrl": "http://www.dresden.de/media/tourismus/sehenswert/493x330_panorama_dresden_altstadt.jpg"
    }
]
const chartJsOptions = {
    "telegram": {
      "attachment": {
        "type": "image",
        "payload": {
          "url": "http://www.dresden.de/media/tourismus/sehenswert/493x330_panorama_dresden_altstadt.jpg"
        }
      }
    }
}

