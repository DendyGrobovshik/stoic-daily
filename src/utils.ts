import * as path from 'path';
import { quotes } from 'quotes.json';
import { practices } from 'practices.json';

const ROOT_DIR = 'stoic-daily';
const MONTH_NAMES = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
];

interface Quote {
    text: string,
    author: string,
}

interface Practice {
    text: string,
}

function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

const getRandomQuote = (): Quote => {
    const id = getRandomInt(0, quotes.length);

    return quotes[id];
}

const getRandomPractice = (): Practice => {
    const id = getRandomInt(0, practices.length);

    return practices[id];
}

const getToday = (): number[] => {
    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();

    return [year, month, date];
}

const getTodayNoteName = (): string => {
    const [nYear, nMonth, nDate] = getToday();

    const year = nYear.toString();
    const month = nMonth.toString().padStart(2, '0');
    const date = nDate.toString().padStart(2, '0');

    return `${year}${month}${date}`;
}

const getTodayNotePath = (): string => {
    const [nYear, nMonth] = getToday();

    const year = nYear.toString();
    const month = MONTH_NAMES[nMonth - 1];

    return path.join(ROOT_DIR, `${month}${year}`);
}

const getTodayNoteFullPath = (): string => {
    return path.join(getTodayNotePath(), `${getTodayNoteName()}.md`);
}

const getMonthNoteName = (): string => {
    const [nYear, nMonth] = getToday();

    const month = MONTH_NAMES[nMonth - 1];

    return `${month}${nYear}`;
}

const getMonthNotePath = (): string => {
    const [nYear, nMonth] = getToday();

    const year = nYear.toString();
    const month = MONTH_NAMES[nMonth - 1];

    return path.join(ROOT_DIR, `${month}${year}`);
}

const getMonthNoteFullPath = (): string => {
    return path.join(getMonthNotePath(), `${getMonthNoteName()}.md`);
}

const getTemplateNotePath = (): string => {
    return path.join(ROOT_DIR);
}

const getTemplateNoteFullPath = (): string => {
    return path.join(getTemplateNotePath(), 'TEMPLATE.md');
}

export {
    getRandomQuote, getRandomPractice,

    getTodayNoteName, getTodayNotePath, getTodayNoteFullPath,

    getMonthNoteName, getMonthNotePath, getMonthNoteFullPath,

    getTemplateNotePath, getTemplateNoteFullPath,
}