import * as express from "express";
import { DbFacadeInterface} from "../db/db-facade";
import {
  Text,
  PhoneNumber,
  InboundText,
  OutboundText,
  AppText,
  TwilioInboundText,
  TwilioOutboundText,
  TwilioRecord
} from "../../common/text";
import { UserWithoutPassword } from "../../common/user";
import * as winston from "winston";

import * as https from "https";

import { NotFoundError } from "../errors";
import { DataIntermediary } from "../data-intermediate";
import { restrictedViewOnly, restrictedBasic, restrictedModifyAll, restrictedSuperuser } from "../auth";

export default function textsRouterWithDb(dataIntermediate: DataIntermediary, twilio, twilioAccountSid, twilioAuthToken) {
  let textsRouter = express.Router();

  textsRouter.use((req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.status(401);
      res.send();
    }
  });

  function handleServerError(req, res) {
    return (err) => {
      if (err instanceof NotFoundError) {
        res.status(404).send(err.toString());
      } else {
        winston.log('error', err);
        res.status(500).send();
      }
    }
  }

  textsRouter.get('/', restrictedViewOnly, (req, res) => {
    dataIntermediate.getTexts()
    .then(texts => res.json(texts))
    .catch(handleServerError(req, res))
  })

  textsRouter.get('/:id', restrictedViewOnly, (req, res) => {
    let id = req.params.id;
    dataIntermediate.getText(id)
    .then(text => res.json(text))
    .catch(handleServerError(req, res))
  })

  textsRouter.get('/byNumber/:number', restrictedViewOnly, (req, res) => {
    let number = req.params.number
    dataIntermediate.getTextsByNumber(number)
    .then(texts => res.json(texts))
    .catch(handleServerError(req, res))
  });

  textsRouter.post('/non-native', restrictedBasic, (req, res) => {
    let textProperties = req.body;
    dataIntermediate.addNonNativeText(textProperties)
    .then(text => res.json(text))
    .catch(handleServerError(req, res))
  })

  textsRouter.post('/import', restrictedModifyAll, (req, res) => {
    let text = req.body;
    dataIntermediate.addTextFromTwilioLog(text)
    .then(text => res.json(text))
    .catch(handleServerError(req, res))
  })

  textsRouter.post('/', restrictedBasic, (req, res) => {
    let newText = req.body;
    let twilioClient = twilio.client;
    let user = newText.user;
    twilioClient.messages.create({
      body: newText.message,
      to: newText.to,
      from: twilio.fromNumber
    }, (err, text) => {
      if (err) {
        winston.error('Twilio send text error!', {err});
        handleServerError(req, res)(err)
      } else {
        dataIntermediate.addNewSentText(text, user)
        .then(createdText => res.json(createdText))
        .catch(handleServerError(req, res))
      }
    });
  });

  textsRouter.put('/:id', restrictedBasic, (req, res) => {
    let newDetailsText = Text.fromJSON(req.body);
    dataIntermediate.updateText(newDetailsText)
    .then(changedText => res.json(changedText))
    .catch(handleServerError(req, res))
  });

  let lastTwilioFetchResults = []

  function twilioMessagePage(dbTextsObj, data, pageNumber, notInDb: TwilioRecord[]) {
    console.log('twilioMessagePage', pageNumber);
    data.messages.forEach(message => {
      if (!dbTextsObj[message.sid]) {
        // Text not yet in DB
        console.log('Not in DB', message);
        notInDb.push(message);
      }
    })
    if (!data.next_page_uri) {
      console.log('No more data!')
      console.log(`${notInDb.length} texts not in DB`)
      lastTwilioFetchResults = notInDb;
      return;
    }
    let options = {
      auth: `${twilioAccountSid}:${twilioAuthToken}`,
      host: 'api.twilio.com',
      path: data.next_page_uri
    }

    https.request(options, res => {
      let str = "";
      res.on('data', chunk => {
        str += chunk;
      })
      res.on('end', () => {
        let jsonForm = JSON.parse(str)
        twilioMessagePage(dbTextsObj, jsonForm, pageNumber+1, notInDb);
      })
    }).end()
  }

  textsRouter.get('/misc/fetch-twilio-results', restrictedModifyAll, (req, res) => {
    res.json(lastTwilioFetchResults)
  })

  textsRouter.get('/misc/fetch-twilio-begin', restrictedModifyAll, (req, res) => {
    dataIntermediate.getTexts()
    .then(textsInDb => {
      let dbTextsObj = {};
      textsInDb.forEach(text => {
        dbTextsObj[Text.getTextSid(text)] = text;
      })
      twilio.client.messages.list((err, data) => {
        if (err) {
          handleServerError(req, res)(err);
        } else {
          res.json(data)
          twilioMessagePage(dbTextsObj, data, 1, [])
        }
      })
    })
    .catch(handleServerError(req, res))
  })

  return textsRouter;
}
