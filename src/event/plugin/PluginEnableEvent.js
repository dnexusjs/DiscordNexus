import { Events } from "../Events.js";
import { PluginEvent } from "./PluginEvent.js";

export class PluginEnableEvent extends PluginEvent {

    constructor(plugin) {
        super(Events.PLUGIN_ENABLE_EVENT, plugin);
    }
}