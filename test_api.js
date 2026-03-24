const API_KEY = "v1-Z0FBQUFBQnBZbnJGM01HcEpLa1FSYVdPaGNGaXJ2QWZ1TmE1RmtlZkE0ekNLdjFlX053Q193V3hKbC1TZVo2S0k1QXU5QThkM3M0ME5fcDVIM2ppNklTQ2lRRmE4RTV3ZHc9PQ==";
const CHAT_API_URL = `https://backend.buildpicoapps.com/aero/run/llm-api?pk=${API_KEY}`;
fetch(CHAT_API_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt: "Hello" })
}).then(res => res.json()).then(console.log).catch(console.error);
