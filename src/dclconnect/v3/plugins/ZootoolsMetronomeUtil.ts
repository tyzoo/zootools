import { ZooTools_Metronome } from "../../../entities/Metronome/Metronome";
import { ZooTools_Metronome_ISubscription } from "../../../entities/Metronome/types";

export interface IZooTools_Metronome_DCLConnect_Command {
    id: string;
    callback: (value: string) => any;
}

export interface IZooTools_Metronome_DCLConnect_Assign_Command extends IZooTools_Metronome_DCLConnect_Command {
    actions: IZooTools_Metronome_DCLConnect_Command[];
}

export class ZooTools_Metronome_DCLConnect_Assign_Commands_Instance {
    public commands: Map<string, IZooTools_Metronome_DCLConnect_Assign_Command> = new Map()
    constructor(public metronome: ZooTools_Metronome, cmds?: IZooTools_Metronome_DCLConnect_Assign_Command[]) {
        cmds && this.setCommands(cmds);
    }
    setCommands(cmds: IZooTools_Metronome_DCLConnect_Assign_Command[]) {
        cmds.forEach(cmd => this.commands.set(cmd.id, cmd));
    }
    apply(json: string): ZooTools_Metronome_ISubscription[] | undefined {
        try {
            json = JSON.parse(json);

            if (!Array.isArray(json)) throw Error(`Must be a JSON array`);

            return json.map(j => {
                const cmd = this.commands.get(j.id);
                if (!cmd) throw Error(`Missing command for ${j.id}`);

                const { callback, actions } = cmd;
                if (!callback) throw Error(`Missing callback for ${j.id}`);
                if (actions.length !== j.actions.length) throw Error(`Action count doesn't match`);

                return {
                    ...j,
                    callback,
                    actions: j.actions.map((a: any, index: number) => {
                        const action = cmd.actions[index];
                        if (!action) throw Error(`Missing action for ${j.id} action at index ${index}`)
                        if (!action.callback) throw Error(`Missing callback for ${j.id} action at index ${index}`)
                        return {
                            ...a,
                            callback: action.callback,
                        }
                    })
                }
            });
        } catch (err: any) {
            log(`ZooToolsMetronome Apply Error: ${err.message}`);
        }
    }
    subscribeOrUpdate(commandSet: string) {
        const application = this.apply(commandSet);
        if (application) {
            this.metronome.subscribeOrUpdate(application);
        } else {
            log(`ZooToolsMetronome failed to subscribe`)
        }
    }

}