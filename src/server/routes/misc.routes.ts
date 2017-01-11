import * as express from "express";
import * as winston from "winston";

import { Team } from "../../common/team";
import { NotFoundError } from "../errors";
import { DataIntermediary } from "../data-intermediate";

import { DOMParser, XMLSerializer } from "xmldom";

let fs = require("fs");
let path = require("path");

const TEAM_MARKER_EXISTING_DIR = path.join(process.cwd(), "src/assets/map-pin/teams");
const TEAM_MARKER_TEMPLATE_FILE = path.join(process.cwd(), "src/assets/map-pin/template-team-marker.svg");
const TEAM_MARKER_TEMPLATE_STRING = fs.readFileSync(TEAM_MARKER_TEMPLATE_FILE, {
  encoding: "utf-8"
});

export default function miscRouterWithDb(dataIntermediate: DataIntermediary) {
  let miscRouter = express.Router();

  miscRouter.use((req, res, next) => {
    winston.log('verbose', 'Misc request');
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

  miscRouter.get('/team-pin/:id', (req, res) => {
    let teamId = req.params.id;
    let pinPath = path.join(TEAM_MARKER_EXISTING_DIR, teamId)
    fs.readFile(pinPath, {
      encoding: "utf-8"
    }, (err, data) => {
      if (err) {
        // Team marker pin SVG file doesn't exist, so create new
        let teamPinTemplate = new DOMParser().parseFromString(TEAM_MARKER_TEMPLATE_STRING);
        dataIntermediate.getTeam(teamId)
        .then(team => {
          let teamNumberNode = teamPinTemplate.getElementById("PIN_TEXT")
          teamNumberNode.textContent = teamId;
          let color = team.color;
          if (color) {
            let pinBlobNode = teamPinTemplate.getElementById("PIN_BLOB");
            pinBlobNode.setAttribute("style", `fill:${color}`)
          }
          let serializer = new XMLSerializer();
          let svgString = serializer.serializeToString(teamPinTemplate);
          res.type("image/svg+xml");
          res.send(svgString);
          fs.writeFile(pinPath, svgString);
        })
        .catch(handleServerError(req, res));
      } else {
        res.type("image/svg+xml");
        res.send(data);
      }
    })
  })
  
  return miscRouter;
}

