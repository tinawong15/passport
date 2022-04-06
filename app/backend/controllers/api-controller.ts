/**
 * Routing controller for AJAX requests
 */
import * as express from "express";
import * as Session from "express-session";
import { Gameplay, GameplaySession } from "../components/Gameplay";
declare module "express-session" {
  export interface SessionData {
    gameplay: GameplaySession;
  }
}
const router = express.Router();

// called on mouse click during a game, checks if the correct region was clicked
router.post("/gameclick", function (req, res, next) {
  if (!req.body.cardId || !req.body.subregionId || !req.session.gameplay) {
    let err: any = new Error();
    err.status = 400;
    next(err);
  }
  let gameplay = new Gameplay(req.session.gameplay);
  res.send({
    correct: gameplay.check(req.body.cardId, req.body.subregionId),
    victory: gameplay.gameover(),
  });
});

//called in Training mode when mousing over the correct region
router.post("/mouseover", function (req, res, next) {
  if (!req.body.cardId || !req.body.subregionId || !req.session.gameplay) {
    let err: any = new Error();
    err.status = 400;
    next(err);
  }
  let gameplay = new Gameplay(req.session.gameplay);
  res.send({
    correct: gameplay.verify(req.body.cardId, req.body.subregionId),
  });
});

//called in Learning mode to get the correct subregion
router.post("/correctSubRegion", function (req, res, next) {
  if (!req.body.cardId || !req.session.gameplay) {
    let err: any = new Error();
    err.status = 400;
    next(err);
  }
  let gameplay = new Gameplay(req.session.gameplay);
  res.send({
    subregionId: gameplay.getSubregionIdByCardId(req.body.cardId),
  });
});

// called when skipping a region during a game
router.post("/skip", function (req, res, next) {
  if (!req.body.card_id || !req.session.gameplay) {
    let err: any = new Error();
    err.status = 400;
    next(err);
  }
  let gameplay = new Gameplay(req.session.gameplay);
  gameplay.skip(req.body.card_id);
  res.send({ victory: gameplay.gameover() });
});

// called when a game is started
router.post("/startgame", function (req, res, next) {
  if (!req.session.gameplay) {
    let err: any = new Error();
    err.status = 400;
    next(err);
  }
  let gameplay = new Gameplay(req.session.gameplay);
  gameplay.startGame();
  res.sendStatus(200);
});

// called when a game is paused
router.post("/pause", function (req, res, next) {
  if (!req.body.card_id || !req.body.card_content || !req.session.gameplay) {
    let err: any = new Error();
    err.status = 400;
    next(err);
  }
  let gameplay = new Gameplay(req.session.gameplay);
  gameplay.pause();
  res.sendStatus(200);
});

// called when a game is unpaused
router.post("/unpause", function (req, res, next) {
  if (!req.body.card_id || !req.body.card_content || !req.session.gameplay) {
    let err: any = new Error();
    err.status = 400;
    next(err);
  }
  let gameplay = new Gameplay(req.session.gameplay);
  gameplay.unpause();
  res.sendStatus(200);
});

export = router;
