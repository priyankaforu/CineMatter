import languages from './languages.json';


const languageMap = {};
languages.forEach(lang => { languageMap[lang.iso_639_1] = lang.english_name });

export const getLanguage = (code) => languageMap[code] || code;
