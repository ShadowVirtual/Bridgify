const translate = require('@iamtraction/google-translate');
const { db } = require("../database");

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; 

async function translator(text, sourceLang, targetLang) {
    const langCodes = {
        "English": "en",
        "German": "de",
        "French": "fr",
        "Spanish": "es",
        "Italian": "it",
        "Polish": "pl",
        "Turkish": "tr",
        "Dutch": "nl",
        "Swedish": "sv",
        "Russian": "ru",
        "Portuguese": "pt",
        "Czech": "cs",
    };

    const sourceLangCode = langCodes[sourceLang];
    const targetLangCode = langCodes[targetLang];

    if (!sourceLangCode || !targetLangCode) {
        throw new Error(`Invalid language specified. Source: ${sourceLang}, Target: ${targetLang}`);
    }

    try {
        const storedTranslation = await db.collection("translations").findOne({
            from: sourceLangCode,
            to: targetLangCode,
            text: text
        });

        if (storedTranslation) {
            return storedTranslation.translatedText;
        }

        const translatedText = await translateWithRetry(text, sourceLangCode, targetLangCode);

        if (sourceLangCode === "en" && targetLangCode === "en") {
            return translatedText;
        }

        await db.collection("translations").insertOne({
            from: sourceLangCode,
            to: targetLangCode,
            text: text,
            translatedText: translatedText
        });

        return translatedText;
    } catch (err) {
        console.error('Error during translation:', err);
        throw new Error(`Translation failed: ${err.message}`); 
    }
}

async function translateWithRetry(text, sourceLangCode, targetLangCode, retryCount = 0) {
    try {
        const res = await translate(text, { from: sourceLangCode, to: targetLangCode });
        return res.text;
    } catch (err) {
        if (retryCount < MAX_RETRIES) {
            console.log(`Translation failed, retrying in ${RETRY_DELAY}ms (${retryCount + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return translateWithRetry(text, sourceLangCode, targetLangCode, retryCount + 1);
        } else {
            throw err;
        }
    }
}


module.exports = { translator };