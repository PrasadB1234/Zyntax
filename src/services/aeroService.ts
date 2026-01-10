
interface AeroResponse {
    status: 'success' | 'error';
    text?: string;
    imageUrl?: string;
    error?: string;
}

const API_KEY = "v1-Z0FBQUFBQnBZbnJGM01HcEpLa1FSYVdPaGNGaXJ2QWZ1TmE1RmtlZkE0ekNLdjFlX053Q193V3hKbC1TZVo2S0k1QXU5QThkM3M0ME5fcDVIM2ppNklTQ2lRRmE4RTV3ZHc9PQ==";

const CHAT_API_URL = `https://backend.buildpicoapps.com/aero/run/llm-api?pk=${API_KEY}`;
const IMAGE_API_URL = `https://backend.buildpicoapps.com/aero/run/image-generation-api?pk=${API_KEY}`;

export const callAeroApi = async (prompt: string, isImageRequest: boolean = false): Promise<AeroResponse> => {
    const apiUrl = isImageRequest ? IMAGE_API_URL : CHAT_API_URL;

    // Prepend persona for text chat if it's not an image request
    const finalPrompt = !isImageRequest
        ? "Follow instructions precisely! If the user asks to generate, create or make an image, photo, or picture by describing it, You will reply with '/image' + description. Otherwise, You will respond normally. Avoid additional explanations." + prompt
        : prompt;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: finalPrompt })
        });

        const data = await response.json();
        console.log("Aero API response:", data);
        return data;
    } catch (error) {
        console.error("Error calling Aero API:", error);
        return { status: 'error', error: 'Failed to communicate with API' };
    }
};
