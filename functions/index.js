const firebase = require("./firebase");
const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const DialogflowApp = require('actions-on-google').DialogflowApp; // Google Assistant helper library
const User = require("./user");
const googleAssistantRequest = 'google'; // Constant to identify Google Assistant requests

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

    const userId = requestSource == 'telegram' ? request.body.originalRequest.data.message.from.id : request.body.originalRequest.data.sender.id;
    const date = new Date();
    const app = new DialogflowApp({
        request: request,
        response: response
    });

    // Create handlers for Dialogflow actions as well as a 'default' handler
    const actionHandlers = {
        // The default welcome intent has been matched, welcome the user (https://dialogflow.com/docs/events#default_welcome_intent)
        'input.welcome': () => {
            switch(requestSource) {
                case googleAssistantRequest:
                sendGoogleResponse('Hello, Welcome to my Dialogflow agent!'); // Send simple response to user
                break;
                case 'facebook':
                sendResponse('Hello, Welcome to my Dialogflow agent!');
                var jsonuser = request.body.originalRequest.data.sender;
                var user1 = {
                    id : jsonuser.id,
                    reg_date : date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear(),
                    chanell : requestSource
                };
                firebase.default.writeUserData(user1.id, user1);
                break;
                case 'telegram':
                sendResponse('Hello, Welcome to my Dialogflow agent!1');
                var jsonuser = request.body.originalRequest.data.message.from;
                console.log('jsonuser: ' + JSON.stringify(jsonuser));
                var user1 = new User.default(jsonuser.first_name, jsonuser.last_name, jsonuser.id, date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear(), requestSource);
                firebase.default.writeUserData(user1.id, user1);
                break;
                default:
                sendResponse('Hello, Welcome to my Dialogflow agent!');
                break;
            }
            // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
            if (requestSource === googleAssistantRequest) {
                
            } else {
                 // Send simple response to user
            }
        },
        // The default fallback intent has been matched, try to recover (https://dialogflow.com/docs/intents#fallback_intents)
        'input.unknown': () => {
            // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
            if (requestSource === googleAssistantRequest) {
                sendGoogleResponse('I\'m having trouble, can you try that again?'); // Send simple response to user
            } else {
                sendResponse('I\'m having trouble, can you try that again?'); // Send simple response to user
            }
        },
        'post.chemicals': () => {
            SendSimpleResponseOnPostAction('Test case chemicals');
        },
        'post.others': () => {
            SendSimpleResponseOnPostAction('Test case others');
        },
        'post.health': () => {
            SendSimpleResponseOnPostAction('Test case health');
            firebasemodule.checkDataByField('users', 'value', 'id', user.fbid).then(res => {
                firebasemodule.insertData('users', user, res).then((d)=> {
                }).catch(ex => {
                    console.log(ex);
                })
            })
        },
        'post.utilities': () => {
            SendSimpleResponseOnPostAction('Test case utilities');
        },
        'post.clothes': () => {
            SendSimpleResponseOnPostAction('Test case clothes');
        },
        'post.eat': () => {
            SendSimpleResponseOnPostAction('Test case eat');
        },
        'post.toiletware': () => {
            SendSimpleResponseOnPostAction('Test case toiletware');
        },
        'post.travel': () => {
            SendSimpleResponseOnPostAction('Test case travel');
        },
        'post.entertainment': () => {
            SendSimpleResponseOnPostAction('Test case entertainment');
        },
        'post.family': () => {
            SendSimpleResponseOnPostAction('Test case family');
        },
        'post.technique': () => {
            SendSimpleResponseOnPostAction('Test case technique');
        },
        'post.transport': () => {
            firebase.default.writeCostData(userId, 'transport', date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear(), parameters.cost);
            SendSimpleResponseOnPostAction(request.body.result.fulfillment.speech);
        },
        'show.statistics': () => {
            SendSimpleResponseOnPostAction('Test case statistics');
        },
        'menu.open': () => {
            SendSimpleResponseOnPostAction('Test case menu');
        },
        // Default handler for unknown or undefined actions
        'default': () => {
            // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
            if (requestSource === googleAssistantRequest) {
                let responseToUser = {
                    //googleRichResponse: googleRichResponse, // Optional, uncomment to enable
                    //googleOutputContexts: ['weather', 2, { ['city']: 'rome' }], // Optional, uncomment to enable
                    speech: 'This message is from Dialogflow\'s Cloud Functions for Firebase editor!', // spoken response
                    displayText: 'This is from Dialogflow\'s Cloud Functions for Firebase editor! :-)' // displayed response
                };
                sendGoogleResponse(responseToUser);
            } else {
                let responseToUser = {
                    //richResponses: richResponses, // Optional, uncomment to enable
                    //outputContexts: [{'name': 'weather', 'lifespan': 2, 'parameters': {'city': 'Rome'}}], // Optional, uncomment to enable
                    speech: 'This message is from Dialogflow\'s Cloud Functions for Firebase editor!', // spoken response
                    displayText: 'This is from Dialogflow\'s Cloud Functions for Firebase editor! :-)' // displayed response
                };
                sendResponse(responseToUser);
            }
        }
    };

    // If undefined or unknown action use the default handler
    if (!actionHandlers[action]) {
        action = 'default';
    }

    // Run the proper handler function to handle the request from Dialogflow
    actionHandlers[action]();

    function SendSimpleResponseOnPostAction(message) {
         // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
         if (requestSource === googleAssistantRequest) {
            sendGoogleResponse(message); // Send simple response to user
        } else {
            sendResponse(message); // Send simple response to user
        }
    }

    // Function to send correctly formatted Google Assistant responses to Dialogflow which are then sent to the user
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

    // Function to send correctly formatted responses to Dialogflow which are then sent to the user
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
});

// Construct rich response for Google Assistant
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

// Rich responses for both Slack and Facebook
const richResponses = {
    'slack': {
        'text': 'This is a text response for Slack.',
        'attachments': [{
            'title': 'Title: this is a title',
            'title_link': 'https://assistant.google.com/',
            'text': 'This is an attachment.  Text in attachments can include \'quotes\' and most other unicode characters including emoji 📱.  Attachments also upport line\nbreaks.',
            'image_url': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
            'fallback': 'This is a fallback.'
        }]
    },
    'facebook': {
        'attachment': {
            'type': 'template',
            'payload': {
                'template_type': 'generic',
                'elements': [{
                    'title': 'Title: this is a title',
                    'image_url': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
                    'subtitle': 'This is a subtitle',
                    'default_action': {
                        'type': 'web_url',
                        'url': 'https://assistant.google.com/'
                    },
                    'buttons': [{
                        'type': 'web_url',
                        'url': 'https://assistant.google.com/',
                        'title': 'This is a button'
                    }]
                }]
            }
        }
    }
};