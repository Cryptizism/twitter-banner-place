const Twitter = require('twitter');
const magma = require('magma-sdk');
const ApiClient = magma.ApiClient;
const fs = require('fs');
require('dotenv').config();

const apiToken = process.env.MAGMA_API_TOKEN;
const apiClient = new ApiClient({ apiToken });

const credentials = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
};

const client = new Twitter(credentials);

async function getCanvasImage(){
    return await apiClient.download(process.env.MAGMA_PROJECT_ID, 'png').then(async (stream) => { await stream.stream.pipe(fs.createWriteStream('image.png')); });
}

async function base64_encode(file) {
    // read binary data
    var bitmap = await fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer.from(bitmap).toString('base64');
}

async function uploadBanner(){
    var base64;
    await getCanvasImage().then(async () => { base64 = await base64_encode('image.png'); }).then(() => {
        
        client.post('account/update_profile_banner', { banner: base64 }, (error, data, response) => {
            if (error) {
                console.error("failed to update profile banner", error);
            } else {
                console.log("updated profile banner");
            }
        })
    });
}

function startLoop(){
    uploadBanner();
    setTimeout(startLoop, 1000 * 60 * 5);
}

startLoop();