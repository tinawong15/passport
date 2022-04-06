import { UserManager } from '../managers/UserManager';
import { Overlay } from './Overlay';
import { Region } from '../components/Region';
import { GameplayMode } from '../../models/RegionModel';
import { ScreenManager } from '../managers/ScreenManager';
import { AudioManager } from '../managers/AudioManager';
export class VictoryScreen extends Overlay {
    private region_path:string;

    private correctPercentage: number;
    private time: number;
    private correct: number;
    private incorrect: number;
    private numRegions: number;

    // game mode
    mode: GameplayMode;

    public constructor(queries:URLSearchParams) {
        super(ScreenManager.VICTORY, queries);
    }

    ready() {
        super.ready();
        
        $('.minor-card').each(function(index:number, elem:Element) {
            let degrees = (Math.random() * 30) - 15;
            $(elem).css({
                '-webkit-transform': 'rotate(' + degrees + 'deg)',
                '-moz-transform': 'rotate(' + degrees + 'deg)',
                '-o-transform': 'rotate(' + degrees + 'deg)',
                '-ms-transform': 'rotate(' + degrees + 'deg)',
                'transform': 'rotate(' + degrees + 'deg)'
            });
        });
    }

    public dataLoaded(region:Region):void {}
}
