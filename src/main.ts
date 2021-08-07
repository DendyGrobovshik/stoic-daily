import {
    Plugin,
    TFile,
} from 'obsidian';

import {
    getRandomQuote, getRandomPractice,

    getTodayNotePath, getTodayNoteFullPath,

    getMonthNoteName, getMonthNotePath, getMonthNoteFullPath,

    getTemplateNotePath, getTemplateNoteFullPath,
} from 'utils';

const getBaseTemplate = (): string => {
    return [
        '%META%',
        '%MONTH_LINK%',
        '',
        '%QUOTE%',
        '',
        '---',
        '# Morning notes',
        '',
        '---',
        '# Evening notes',
        '',
        '---',
        '%PRACTICE%',
    ].join('\n');
}

const getMetaData = (): string => {
    return [
        '---',
        'tags: daily',
        '---',
    ].join('\n');
}

const getQuote = (): string => {
    const { text, author } = getRandomQuote();

    return [
        `# Today Quote`,
        `> ${text}`,
        `\\- ${author}`,
    ].join('\n');
}

const getPractice = (): string => {
    const { text } = getRandomPractice();

    return [
        `# Today Practice`,
        `> ${text}`,
    ].join('\n');
}

const getMonthNoteText = (): string => {
    const metaData = getMetaData();

    return [
        metaData,
        '',
        '# The result of a stoic month',
    ].join('\n');
}

const parseCommand = (command: string): string => {
    switch (command) {
        case 'META':
            return getMetaData();
            break;
        case 'MONTH_LINK':
            return `Month: [[${getMonthNoteName()}]]`;
            break;
        case 'QUOTE':
            return getQuote();
            break;
        case 'PRACTICE':
            return getPractice();
            break;
        default: break;
    }
}

const createTextFromTemplate = (template: string): string => {
    let result = '';

    for (let i = 0; i < template.length; i++) {
        const char = template[i];

        if (char === '%') {
            let command = '';
            while (template[++i] !== '%') {
                command += template[i];
            }

            result += parseCommand(command);
        } else {
            result += char;
        }
    }

    return result;
}

export default class StoicDailyPlugin extends Plugin {
    async onload() {
        this.addCommands();

        await this.createBaseTemplate();
    }

    addCommands() {
        this.addCommand({
            id: 'open-daily-note',
            name: 'Open Daily Note',
            callback: async () => {
                await this.createBaseTemplate();
                await this.createAndOpenTodayNote();
            }, hotkeys: [
                {
                    modifiers: ["Ctrl"],
                    key: "s"
                }
            ],
        });
    }

    getNote(filePath: string): TFile {
        let note;

        this.app.vault.getFiles().forEach(file => {
            if (file.path === filePath) {
                note = file;
            }
        });

        return note;
    }

    // Do not rewrite note if it exists
    async createNote(dirPath: string, filePath: string, text: string): Promise<void> {
        const { vault } = this.app;

        // Create folder
        if (!await vault.adapter.exists(dirPath)) {
            await vault.createFolder(dirPath);
        }
        // Create file
        if (!await vault.adapter.exists(filePath)) {
            const file = await vault.create(filePath, text);
        }
    }

    async openNote(filePath: string): Promise<void> {
        const note = this.getNote(filePath);

        await this.app.workspace.activeLeaf.openFile(note);
    }

    async createBaseTemplate(): Promise<void> {
        await this.createNote(
            getTemplateNotePath(), getTemplateNoteFullPath(), getBaseTemplate()
        );
    }

    async createTodayNote(): Promise<void> {
        await this.createMonthNote();

        const dirPath = getTodayNotePath();
        const filePath = getTodayNoteFullPath();

        const templateNote = this.getNote(getTemplateNoteFullPath());
        const template = await this.app.vault.read(templateNote);
        const text = createTextFromTemplate(template);

        await this.createNote(dirPath, filePath, text);
    }

    async createAndOpenTodayNote(): Promise<void> {
        const filePath = getTodayNoteFullPath();

        await this.createTodayNote();
        await this.openNote(filePath);
    }

    async createMonthNote(): Promise<void> {
        const dirPath = getMonthNotePath();
        const filePath = getMonthNoteFullPath();

        await this.createNote(dirPath, filePath, getMonthNoteText());
    }
}
