exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const DIFY_API_KEY = process.env.DIFY_API_KEY;
  const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1/workflows/run';

  if (!DIFY_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '伺服器尚未設定 DIFY_API_KEY 環境變數' })
    };
  }

  try {
    const incoming = JSON.parse(event.body);
    const action = incoming.action || 'workflow';

    let requestBody, apiUrl;

    if (action === 'chatbot') {
      // Dify Chatflow API — query 欄位傳入用戶訊息
      apiUrl = process.env.DIFY_API_URL || 'https://api.dify.ai/v1/chat-messages';
      requestBody = {
        inputs: { user_input: incoming.user_input || '' },
        query: incoming.user_input || '',
        response_mode: 'blocking',
        conversation_id: incoming.conversation_id || '',
        user: 'patent-bot'
      };
    } else {
      // Dify Workflow API（同步等待結果）
      apiUrl = DIFY_API_URL;
      requestBody = {
        inputs: { user_input: incoming.user_input || '' },
        response_mode: 'blocking',
        user: 'patent-bot'
      };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIFY_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const text = await response.text();
    if (!response.ok) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ ok: false, status: response.status, detail: text })
      };
    }

    let result;
    try { result = JSON.parse(text); } catch { result = { raw: text }; }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '代理請求失敗：' + err.message })
    };
  }
};
