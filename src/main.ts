import {
    App,
    Plugin,
    PluginSettingTab,
    Setting,
} from 'obsidian';

import {
    getRandomQuote,

    getTodayNotePath, getTodayNoteFullPath,

    getMonthNoteName, getMonthNotePath, getMonthNoteFullPath,

    getYearNoteName, getYearNotePath, getYearNoteFullPath, getRandomPractice,
} from 'utils';

const EMPTY_LINE = [''];
const DELIMETER = ['---'];

interface StoicDailySetting {
    name: string;
    description: string;
    value: boolean;
}

interface StoicDailySettings {
    showQuote: StoicDailySetting,
    showMorningNote: StoicDailySetting,
    showEveningNote: StoicDailySetting,
    showPractice: StoicDailySetting,
}

const DEFAULT_SETTINGS: StoicDailySettings = {
    showQuote: {
        name: 'Show Quote',
        description: 'Display stoic quote',
        value: true,
    },
    showMorningNote: {
        name: 'Show Morning Note',
        description: 'Display title for morning note',
        value: true,
    },
    showEveningNote: {
        name: 'Show Evening Note',
        description: 'Display title for evening note',
        value: true,
    },
    showPractice: {
        name: 'Show Practice',
        description: 'Display stoic practice',
        value: true,
    },
}

const getMetaData = (): string[] => {
    return [
        '---',
        'tags: daily',
        '---',
    ];
}

const getQuote = (): string[] => {
    const { text, author } = getRandomQuote();

    return [
        `> ${text}`,
        `\\- ${author}`,
    ];
}

const getMorningNotes = (): string[] => {
    return [
        '# Morning Notes',
        '- Today I will ...',
    ]
}

const getEveningNotes = (): string[] => {
    return [
        '# Evening Notes',
        '- This day was ...',
    ]
}

const getPractice = (): string[] => {
    const { text } = getRandomPractice();

    return [
        `# Today Practice`,
        `> ${text}`,
    ];
}


const getTodayNoteText = (plugin: StoicDailyPlugin): string => {
    const { settings } = plugin;

    const metaData = getMetaData();
    const quote = settings.showQuote.value ? [
        ...getQuote(),
        ...EMPTY_LINE,
        ...DELIMETER,
    ] : [];
    const morningNotes = settings.showMorningNote.value ? [
        ...getMorningNotes(),
        ...DELIMETER,

    ] : [];
    const eveningNotes = settings.showEveningNote.value ? [
        ...getEveningNotes(),
        ...DELIMETER,
    ] : [];
    const practice = settings.showPractice.value ? [
        ...getPractice(),
    ] : [];

    return [
        ...metaData,
        `Month: [[${getMonthNoteName()}]]`,
        ...EMPTY_LINE,
        ...quote,
        ...morningNotes,
        ...eveningNotes,
        ...practice,
    ].join('\n'); // TODO
}

const getMonthNoteText = (): string => {
    const metaData = getMetaData();

    return [
        ...metaData,
        `Year: [[${getYearNoteName()}]]`,
        ...EMPTY_LINE,
        '# The result of a stoic month',
    ].join('\n');
}

const getYearNoteText = (): string => {
    const metaData = getMetaData();

    return [
        ...metaData,
        ...EMPTY_LINE,
        '# The result of a stoic year',
    ].join('\n');
}

// Do not rewrite note if it exists
const createNote = async (
    dirPath: string,
    filePath: string,
    text: string,
    plugin: StoicDailyPlugin,
): Promise<void> => {
    const { vault } = plugin.app;

    // Create folder
    if (!await vault.adapter.exists(dirPath)) {
        await vault.createFolder(dirPath);
    }
    // Create file
    if (!await vault.adapter.exists(filePath)) {
        const file = await vault.create(filePath, text);
    }
}

const openNote = async (
    filePath: string,
    plugin: StoicDailyPlugin
): Promise<void> => {
    const { vault, workspace } = plugin.app;

    let note;
    vault.getFiles().forEach(file => {
        if (file.path === filePath) {
            note = file;
        }
    });

    await workspace.activeLeaf.openFile(note);
}

const createAndOpenTodayNote = async (plugin: StoicDailyPlugin): Promise<void> => {
    createYearNote(plugin);
    createMonthNote(plugin);

    const dirPath = getTodayNotePath();
    const filePath = getTodayNoteFullPath();

    await createNote(dirPath, filePath, getTodayNoteText(plugin), plugin);
    await openNote(filePath, plugin);
}

const createMonthNote = async (plugin: StoicDailyPlugin): Promise<void> => {
    const dirPath = getMonthNotePath();
    const filePath = getMonthNoteFullPath();

    createNote(dirPath, filePath, getMonthNoteText(), plugin);
}

const createYearNote = async (plugin: StoicDailyPlugin): Promise<void> => {
    const dirPath = getYearNotePath();
    const filePath = getYearNoteFullPath();

    createNote(dirPath, filePath, getYearNoteText(), plugin);
}

export default class StoicDailyPlugin extends Plugin {
    settings: StoicDailySettings;

    async onload() {
        await this.loadSettings();

        this.addCommands();

        this.addSettingTab(new SampleSettingTab(this.app, this));

        createAndOpenTodayNote(this);
        this.registerInterval(window.setInterval(
            () => createAndOpenTodayNote(this), 1000 * 60 * 1)
        );
    }

    addCommands() {
        this.addCommand({
            id: 'open-daily-note',
            name: 'Open Daily Note',
            callback: () => {
                createAndOpenTodayNote(this);
            }, hotkeys: [
                {
                    modifiers: ["Ctrl"],
                    key: "s"
                }
            ],
        });

    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class SampleSettingTab extends PluginSettingTab {
    plugin: StoicDailyPlugin;

    constructor(app: App, plugin: StoicDailyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let { containerEl } = this;
        const { settings } = this.plugin;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Stoic Daily plugin settings.' });

        for (const setting of Object.values(settings)) {
            new Setting(containerEl)
                .setName(setting.name)
                .setDesc(setting.description)
                .addToggle(toggle => toggle
                    .setValue(setting.value)
                    .onChange(async (value) => {
                        setting.value = value;
                        await this.plugin.saveSettings();
                    }));
        }
    }
}
