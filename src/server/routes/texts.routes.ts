import * as express from "express";
import { DbFacadeInterface} from "../db/db-facade";
import {
  Text,
  PhoneNumber,
  InboundText,
  OutboundText,
  AppText,
  TwilioInboundText,
  TwilioOutboundText
} from "../../common/text";
import { UserWithoutPassword } from "../../common/user";
import * as winston from "winston";

import { NotFoundError } from "../errors";
import { DataIntermediary } from "../data-intermediate";
import { restrictedViewOnly, restrictedBasic, restrictedModifyAll, restrictedSuperuser } from "../auth";

export default function textsRouterWithDb(dataIntermediate: DataIntermediary, twilio) {
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

  return textsRouter;
}
