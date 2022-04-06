import * as express from 'express';
import * as Session from 'express-session';
import { Gameplay, GameplaySession } from '../components/Gameplay';
declare module 'express-session' {
    export interface SessionData {
        gameplay: GameplaySession;
    }
}
import { Playable } from '../managers/Playable'
const router = express.Router();

// retrieves the Playable object
router.get('/playable', function(req, res, next){
    res.send(Playable.get().getPlayable());
});

// checks that the current region is valid and retrieves the JSON info for it
router.get('*', function(req, res, next){
    let path = decodeURIComponent(req.path.slice(1, req.path.length - (req.path.endsWith('/') ? 1 : 0)));
    let json = Playable.get().getJSON(path);
    if (!json) {
        res.sendStatus(404);
        return;
    }
    if (req.query.s != 'gameplay') {
        res.send(json); 
        return;
    }
    if (!req.session.gameplay) {
        res.sendStatus(400);
        return;
    }
    let gameplay = new Gameplay(req.session.gameplay);
    for (let subregion of json.features) {
        subregion.properties = {
            id: gameplay.getSubregionId(subregion.properties.name)
        }
    }
    res.send(json);
});

export = router;