import { Client, GatewayIntentBits, Partials } from "discord.js";
import { configDotenv } from "dotenv";
import {
    existsSync,
    readFileSync,
    writeFileSync,
    mkdirSync,
    readdirSync
} from "fs";
import { SetupWizard } from "./application/SetupWizard.js";
import { VersionInfo } from "./VersionInfo.js";
import path from "path";
import { pluginLoader } from "./loader/pluginLoader.js";
import { BaseConsole } from "./utils/BaseConsole.js";
import { LocalData, LocalDataTypes } from "./utils/LocalData.js";
import { PluginManager } from "./plugin/PluginManager.js";
import { Internet } from "./utils/Internet.js";
import { Translatable } from "./lang/Translatable.js";
import { TranslationKeys } from "./lang/TranslationKeys.js";

class DiscordNexus {

    client;
    baseConsole;
    configuration;
    pluginManager;
    nexusProperties;
    language;
    supportLanguages = {
        "eng": {
            "name": "English",
            "file": "en-US"
        },
        "vie": {
            "name": "Tiếng Việt",
            "file": "vi-VN"
        }
    };

    constructor() {
        configDotenv()
        this.client = new Client({
            intents: Object.keys(GatewayIntentBits).map((a) => {
                return GatewayIntentBits[a]
            }),
            partials: Object.keys(Partials).map((a) => {
                return Partials[a]
            }),
        })

        this.client.login(process.env.CLIENT_TOKEN)
            .then(() => {
                console.log(`Logged as ${this.client.user.username}`)
            })

        global.dataPath = "./";
        this.baseConsole = new BaseConsole();
        this.pluginManager = new PluginManager(this);
        this.start().then((OK) => {
            if (!OK) return this.shutdown();
            
            this.getBaseConsole().info(this.language.get(TranslationKeys.NEXUS_LOADING_CONFIGURATION));
            const DiscordNexusJSON = "nexus.yml";
            if (!existsSync(DiscordNexusJSON)) {
                const content = readFileSync(path.join(this.getDataPath(), "src", "resources", "nexus.yml"), 'utf-8');
                if (VersionInfo.IS_DEVELOPMENT_BUILD) {
                    // TODO: Change to branch dev
                }
                writeFileSync(DiscordNexusJSON, content);
            }
            this.configuration = new LocalData(DiscordNexusJSON, LocalDataTypes.YAML);
    
            const pluginsPath = "plugins";
            const pluginDataPath = "plugin_data"
            if (!existsSync(pluginDataPath)) {
                mkdirSync(pluginDataPath);
            }
            if (!existsSync(pluginsPath)) {
                mkdirSync(pluginsPath);
            } else {
                const plugins = readdirSync(pluginsPath);
                for (let dirName of plugins) {
                    const pluginDirPath = `${pluginsPath}/${dirName}`;
                    const loader = new pluginLoader(this, pluginDirPath);
                    loader.load().then(() => {
                        const plugin = loader.getPlugin();
                        const pluginName = plugin.getDescription().getName();
                        const pluginVersion = plugin.getDescription().getVersion();
    
                        this.getBaseConsole().info(Translatable.translate(this.language.get(TranslationKeys.NEXUS_PLUGIN_ENABLING), [pluginName, pluginVersion]));
                        this.getPluginManager().install(plugin);
                    })
                }
            }
        })
    }

    getDataPath() {
        return dataPath;
    }

    getBaseConsole() {
        return this.baseConsole;
    }

    getPluginManager() {
        return this.pluginManager;
    }

    getNexusConfig() {
        return this.configuration;
    }

    getNexusProperties() {
        return this.nexusProperties;
    }

    getLanguage() {
        return this.language;
    }

    getClient() {
        return this.client;
    }

    shutdown() {
        this.client.destroy();
    }

    start = async () => {
        if (!existsSync("nexus.properties")) {
            const installer = new SetupWizard(this)
            if (!await installer.run()) {
                return false;
            }
        }
        this.nexusProperties = new LocalData("nexus.properties", LocalDataTypes.PROPERTIES);

        const languageSelected = this.nexusProperties.get("language");
        this.language = new LocalData(`./src/lang/${this.supportLanguages[languageSelected]["file"]}.yml`, LocalDataTypes.YAML);

        if (this.getNexusProperties().get("cron-enable")) {
            const currentIP = await Internet.getIP();
            const cronPort = this.getNexusProperties().get("cron-port");

            this.getBaseConsole().info(Translatable.translate(this.language.get(TranslationKeys.NEXUS_START_CRON_INFO), [currentIP, cronPort]))
        }
        
        return true;
    }
}

new DiscordNexus()