import React, { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Platform = 'curl' | 'javascript' | 'python' | 'java' | 'dotnet' | 'php';

const BASE_URL = 'http://localhost:8080';

const snippets: Record<Platform, { label: string; language: string; code: string }> = {
  curl: {
    label: 'cURL',
    language: 'bash',
    code: `# Start a new conversation
curl -X POST ${BASE_URL}/api/v1/chat \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{"message": "What is your return policy?"}'

# Continue an existing conversation (use sessionId from previous response)
curl -X POST ${BASE_URL}/api/v1/chat \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{"message": "Tell me more", "sessionId": "SESSION_ID_FROM_PREVIOUS_RESPONSE"}'`,
  },

  javascript: {
    label: 'JavaScript / TypeScript',
    language: 'typescript',
    code: `const API_BASE = '${BASE_URL}';
const API_KEY  = 'YOUR_API_KEY';

interface ChatResponse {
  sessionId: string;
  reply: string;
  chatbotName: string;
}

async function chat(message: string, sessionId?: string): Promise<ChatResponse> {
  const res = await fetch(\`\${API_BASE}/api/v1/chat\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({ message, sessionId }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Chat request failed');
  }

  return res.json();
}

// Usage
let sessionId: string | undefined;

const first = await chat('Hello, what services do you offer?');
console.log(first.reply);
sessionId = first.sessionId;

const followUp = await chat('Tell me more about pricing', sessionId);
console.log(followUp.reply);`,
  },

  python: {
    label: 'Python',
    language: 'python',
    code: `import requests

API_BASE = '${BASE_URL}'
API_KEY  = 'YOUR_API_KEY'

def chat(message: str, session_id: str = None) -> dict:
    payload = {'message': message}
    if session_id:
        payload['sessionId'] = session_id

    response = requests.post(
        f'{API_BASE}/api/v1/chat',
        json=payload,
        headers={
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
        }
    )
    response.raise_for_status()
    return response.json()

# Usage
result = chat('What are your business hours?')
print(result['reply'])

session_id = result['sessionId']

follow_up = chat('What about weekends?', session_id)
print(follow_up['reply'])`,
  },

  java: {
    label: 'Java',
    language: 'java',
    code: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ChatbotClient {

    private static final String BASE_URL = "${BASE_URL}";
    private static final String API_KEY  = "YOUR_API_KEY";

    private final HttpClient client = HttpClient.newHttpClient();

    public String chat(String message, String sessionId) throws Exception {
        String body = sessionId != null
            ? String.format("""
                {"message":"%s","sessionId":"%s"}
                """, message, sessionId)
            : String.format("""
                {"message":"%s"}
                """, message);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BASE_URL + "/api/v1/chat"))
            .header("Content-Type", "application/json")
            .header("X-API-Key", API_KEY)
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();

        HttpResponse<String> response =
            client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Chat failed: " + response.body());
        }

        return response.body(); // parse JSON as needed
    }

    // Usage
    public static void main(String[] args) throws Exception {
        ChatbotClient bot = new ChatbotClient();

        String response1 = bot.chat("What is your refund policy?", null);
        System.out.println(response1);

        // Extract sessionId from response1 JSON, then continue:
        // String response2 = bot.chat("How long does it take?", sessionId);
    }
}`,
  },

  dotnet: {
    label: '.NET / C#',
    language: 'csharp',
    code: `using System.Net.Http.Json;

public record ChatRequest(string Message, string? SessionId = null);
public record ChatResponse(string SessionId, string Reply, string ChatbotName);

public class ChatbotClient
{
    private const string BaseUrl = "${BASE_URL}";
    private const string ApiKey  = "YOUR_API_KEY";

    private readonly HttpClient _http;

    public ChatbotClient()
    {
        _http = new HttpClient();
        _http.DefaultRequestHeaders.Add("X-API-Key", ApiKey);
    }

    public async Task<ChatResponse> ChatAsync(string message, string? sessionId = null)
    {
        var request = new ChatRequest(message, sessionId);
        var response = await _http.PostAsJsonAsync($"{BaseUrl}/api/v1/chat", request);

        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<ChatResponse>()
               ?? throw new Exception("Empty response");
    }
}

// Usage (Program.cs / controller)
var bot = new ChatbotClient();

var first = await bot.ChatAsync("Do you offer free trials?");
Console.WriteLine(first.Reply);

var followUp = await bot.ChatAsync("How long is the trial?", first.SessionId);
Console.WriteLine(followUp.Reply);`,
  },

  php: {
    label: 'PHP',
    language: 'php',
    code: `<?php

const BASE_URL = '${BASE_URL}';
const API_KEY  = 'YOUR_API_KEY';

function chat(string $message, ?string $sessionId = null): array {
    $payload = ['message' => $message];
    if ($sessionId !== null) {
        $payload['sessionId'] = $sessionId;
    }

    $ch = curl_init(BASE_URL . '/api/v1/chat');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'X-API-Key: ' . API_KEY,
        ],
    ]);

    $response = curl_exec($ch);
    $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($status !== 200) {
        throw new RuntimeException('Chat failed: ' . $response);
    }

    return json_decode($response, true);
}

// Usage
$result = chat('What payment methods do you accept?');
echo $result['reply'] . PHP_EOL;

$sessionId = $result['sessionId'];
$followUp  = chat('Do you accept crypto?', $sessionId);
echo $followUp['reply'] . PHP_EOL;`,
  },
};

const ApiDocsModal: React.FC<Props> = ({ open, onClose }) => {
  const [platform, setPlatform] = useState<Platform>('curl');
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const { code, language } = snippets[platform];

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Integration Docs">
      <div className="modal-box docs-modal">
        <div className="modal-header">
          <h2>Integration Guide</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* Endpoint reference */}
        <div className="docs-endpoint">
          <h3>Endpoint</h3>
          <code>POST /api/v1/chat</code>
          <p>Authenticate every request with the <code>X-API-Key</code> header.</p>

          <h3>Request Body</h3>
          <pre className="docs-pre">{`{
  "message": "string (required)",
  "sessionId": "string (optional — omit to start a new conversation)"
}`}</pre>

          <h3>Response</h3>
          <pre className="docs-pre">{`{
  "sessionId": "uuid — pass this back to continue the conversation",
  "reply": "The chatbot's response",
  "chatbotName": "Name of the chatbot"
}`}</pre>
        </div>

        {/* Platform tabs */}
        <h3 style={{ marginBottom: '0.5rem' }}>Code Examples</h3>
        <div className="tab-bar" style={{ flexWrap: 'wrap' }}>
          {(Object.keys(snippets) as Platform[]).map(p => (
            <button
              key={p}
              className={`tab-btn ${platform === p ? 'active' : ''}`}
              onClick={() => setPlatform(p)}
              type="button"
            >
              {snippets[p].label}
            </button>
          ))}
        </div>

        <div className="code-block-wrapper">
          <button className="copy-btn-code" onClick={copy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <pre className={`code-block language-${language}`}>
            <code>{code}</code>
          </pre>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ApiDocsModal;
