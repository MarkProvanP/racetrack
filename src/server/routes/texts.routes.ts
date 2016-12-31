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

export default function textsRouterWithDb(textIntermediary: DataIntermediary, twilio) {
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
    textIntermediary.getTexts()
      .then(texts => {
        res.type('application/json');
        res.send(JSON.stringify(texts));
      })
      .catch(err => {
        console.error('textsrouter error', err);
        res.status(500)
        res.json({err: err});
      });
  })

  textsRouter.get('/byNumber/:number', restrictedViewOnly, (req, res) => {
    let number = req.params.number
    textIntermediary.getTextsByNumber(number)
      .then(texts => {
        res.type('application/json');
        res.send(JSON.stringify(texts));
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
        textIntermediary.addNewSentText(text, user)
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
    textIntermediary.updateText(newDetailsText)
      .then(changedText => {
        res.type("application/json");
        res.send(JSON.stringify(changedText));
      });
  });

  return textsRouter;
}
