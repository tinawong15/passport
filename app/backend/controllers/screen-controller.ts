/**
 * Routing controller for different screens
 */
import * as express from "express";
import { GameplayMode } from "../../models/RegionModel";
import { Gameplay, GameplaySession } from "../components/Gameplay";
import { Playable } from "../managers/Playable";
import { Grader } from "../managers/Grader";
import { SessionStore } from "../managers/SessionStore";
import * as Session from "express-session";
import { Passport, PassportSession } from "../components/Passport";
declare module "express-session" {
  export interface SessionData {
    gameplay: GameplaySession;
    passport: PassportSession;
  }
}
const router = express.Router();
const playable = Playable.get();
const modes = {
  name: true,
  capital: true,
  leader: true,
  flag: true,
  landmarks: true,
};
const types = { learn: true, train: true, test: true };

// capitalizes the given string
function capitalize(txt: string) {
  return txt.charAt(0).toUpperCase() + txt.substr(1);
}
// capitalizes region name
function getCapitalizedRegionName(str: string) {
  var words = str.split(/[\/]+/);
  return words[words.length - 1].replace(/\w\S*/g, capitalize);
}

// renders the splash screen
router.get("/", function (req, res, next) {
  res.render("splash", {
    title: "Welcome",
  });
});

// renders the map screen (not during the game)
router.get("/map", function (req, res, next) {
  if (!req.query.region || !playable.has(<string>req.query.region)) {
    let err: any = new Error("Not Found");
    err.status = 404;
    next(err);
    return;
  }
  res.render("nav", {
    // URL reads /map, but it uses NavScreen
    title: "Map - " + getCapitalizedRegionName(<string>req.query.region),
    regionPath: req.query.region,
  });
});

router.get("/prenav", function (req, res, next) {
  res.render("prenav", {
    title:
      "Map Welcome - " + getCapitalizedRegionName(<string>req.query.region),
    capitalizedRegionName: getCapitalizedRegionName(<string>req.query.region),
  });
});

// renders the tutorial (not currently working)
router.get("/tutorial", function (req, res, next) {
  res.render("tutorial", {
    title: "Tutorial",
    regionPath: req.query.region,
  });
});

//
router.get("/gameplay", function (req, res, next) {
  if (!req.query.region || !playable.has(<string>req.query.region)) {
    let err: any = new Error("Not Found");
    err.status = 404;
    next(err);
    return;
  }
  if (!req.query.mode || !(<string>req.query.mode in modes)) {
    res.redirect(`/map?region=${req.query.region}`);
    return;
  }
  if (!req.query.type || !(<string>req.query.type in types)) {
    res.redirect(`/map?region=${req.query.region}`);
    return;
  }
  req.session.gameplay = Gameplay.init(
    playable.getJSON(<string>req.query.region),
    <GameplayMode>req.query.mode,
    <string>req.query.region
  );
  res.render("gameplay", {
    title: "Gameplay - " + getCapitalizedRegionName(<string>req.query.region),
    mode: req.query.mode,
    type: req.query.type,
    cards: req.session.gameplay.cards,
  });
});

router.get("/pregame", function (req, res, next) {
  res.render("pregame", {
    title: "Pregame - " + getCapitalizedRegionName(<string>req.query.region),
    capitalizedRegionName: getCapitalizedRegionName(<string>req.query.region),
    capitalizedMode: capitalize(<string>req.query.mode),
  });
});

router.get("/pause", function (req, res, next) {
  res.render("pause", {
    title: "Paused - " + getCapitalizedRegionName(<string>req.query.region),
    capitalizedRegionName: getCapitalizedRegionName(<string>req.query.region),
    capitalizedMode: capitalize(<string>req.query.mode),
  });
});

// renders the victory screen (?not working)
router.get("/victory", function (req, res, next) {
  let gameplay = new Gameplay(req.session.gameplay);
  let gameInfo = gameplay.getGameInfo();
  res.render("victory", {
    title: "Victory",
    regionPath: gameplay.getRegionPath(),
    capitalizedRegionName: getCapitalizedRegionName(gameplay.getRegionPath()),
    gameInfo,
    gradeInfo: Grader.get().calcGrade(gameInfo),
  });
  SessionStore.get().destroy(req.sessionID);
});

// renders the passport screen
router.get("/passport", function (req, res, next) {
  let passport = new Passport(req.session.passport);
  console.log("req.session.passport: " + req.session.passport);
  let passportInfo = passport.getPassportInfo();
  console.log("passportInfo.passportPage: " + passportInfo.passportPage);
  res.render("passport", {
    title: "Passport",
    passportInfo: passportInfo,
  });
});
export = router;
