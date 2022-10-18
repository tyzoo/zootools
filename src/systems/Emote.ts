import { PredefinedEmote, triggerEmote } from '@decentraland/RestrictedActions';
import { Dash_TriggerZone } from 'dcldash';

export class ZooTools_AutoEmoter implements ISystem {
	system: ISystem;
	timer: number = 0;
	emoting: boolean = false;
	lastEmote: [emote: PredefinedEmote, interval: number] = [
		PredefinedEmote.CLAP, 5
	];
	emotes: [PredefinedEmote, number][] = [
		[PredefinedEmote.CLAP, 5],
		[PredefinedEmote.DAB, 3],
		[PredefinedEmote.DISCO, 11],
		[PredefinedEmote.DONT_SEE, 2],
		[PredefinedEmote.FIST_PUMP, 3],
		[PredefinedEmote.HAMMER, 11],
		[PredefinedEmote.HANDS_AIR, 5],
		[PredefinedEmote.HEAD_EXPLODDE, 4],
		[PredefinedEmote.KISS, 5],
		[PredefinedEmote.MONEY, 5],
		[PredefinedEmote.RAISE_HAND, 3],
		[PredefinedEmote.ROBOT, 9],
		[PredefinedEmote.SHRUG, 2],
		[PredefinedEmote.TEKTONIK, 10],
		[PredefinedEmote.TIK, 10],
		[PredefinedEmote.WAVE, 3],
	];
	commands: (() => void)[] = [];
	constructor() {
		this.system = this;
		this.emotes.forEach(
			([predefined, length]: [predefined: PredefinedEmote, length: number]) =>
				this.commands.push(() => triggerEmote({ predefined }))
		);
	}
	update(dt: number) {
		this.timer += dt;
		if (this.timer >= this.lastEmote[1]) {
			const index = Math.floor(Math.random() * this.commands.length);
			this.emoting = true;
			this.commands[index]();
			this.lastEmote = this.emotes[index];
			this.timer = 0;
		}
	}
}

export const AutoEmoteSystem = new ZooTools_AutoEmoter();

export class ZooTools_AutoDanceZone {
	public tz: Dash_TriggerZone
	constructor(tfArgs: TransformConstructorArgs) {
		this.tz = new Dash_TriggerZone();
		this.tz.addComponent(new Transform(tfArgs));
		this.tz.onEnter = () => {
			if (!AutoEmoteSystem.system.active) {
				engine.addSystem(AutoEmoteSystem);
			}
		};
		this.tz.onExit = () => {
			if (AutoEmoteSystem.system.active) {
				engine.removeSystem(AutoEmoteSystem);
			}
		};
		this.tz.enable();
	}
}
