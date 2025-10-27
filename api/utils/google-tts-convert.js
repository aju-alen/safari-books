import textToSpeech from '@google-cloud/text-to-speech';
import dotenv from "dotenv";
dotenv.config();

export const googleTtsConvert = async (text, narrationSampleHeartzRate, narrationSpeakingRate, narrationGender, narrationLanguageCode, narrationVoiceName) => {
  const client = new textToSpeech.TextToSpeechClient({
    projectId: 'safari-books',
    credentials: {
        client_email: process.env.GOOGLE_TTS_EMAIL,
        private_key: process.env.GOOGLE_TTS_PRIVATE_KEY.replace(/\\n/g, '\n');
    }
});

return await client.synthesizeSpeech({
    input: { text: text },
    voice: { languageCode: narrationLanguageCode, ssmlGender: narrationGender, name: narrationVoiceName },
    audioConfig: { audioEncoding: 'MP3', speakingRate: narrationSpeakingRate, volumeGainDb: 0.6,sampleRateHertz: narrationSampleHeartzRate },
});
}