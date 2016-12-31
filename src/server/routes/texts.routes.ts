import * as express from "express";
import { DbFacadeInterface} from "../db/db-facade";
import {
  Text,
  DbFormText,
  PhoneNumber,
  InboundText,
  OutboundText,
  AppText,
  TwilioInboundText,
  TwilioOutboundText,
  FullFormText,
} from "../../common/text";
import { UserWithoutPassword } from "../../common/user";
import * as winston from "winston";

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

  textsRouter.get('/', restrictedViewOnly, (req, res) => {
    dataIntermediate.getTexts()
      .then(texts => {
        res.json(texts);
      })
      .catch(err => {
        console.error('textsrouter error', err);
        res.status(500)
        res.json({err: err});
      });
  })

  textsRouter.get('/byNumber/:number', restrictedViewOnly, (req, res) => {
    let number = req.params.number
    dataIntermediate.getTextsByNumber(number)
      .then(texts => {
        res.json(texts)
      })
      .catch(err => {
        res.status(500);
        res.json({err: err});
      });
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
        res.status(500).send(`Twilio error! : ${err}`);
      } else {
        dataIntermediate.addNewSentText(text, user)
          .then(createdText => {
            res.json(createdText);
          })
          .catch(err => {
            res.status(500).json({err: err});
          })
      }
    });
  });

  textsRouter.put('/:id', restrictedBasic, (req, res) => {
    let newDetailsText = Text.fromJSON(req.body);
    dataIntermediate.updateText(newDetailsText)
      .then(changedText => {
        res.json(changedText);
      });
  });

  return textsRouter;
}
