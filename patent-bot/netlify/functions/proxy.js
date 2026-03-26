exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // Dify Workflow API — Key 和 URL 存在 Netlify 環境變數，前端永遠看不到
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

    // 呼叫 Dify Workflow API（同步，等待 LLM 跑完才回傳）
    const response = await fetch(DIFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIFY_API_KEY}`
      },
      body: JSON.stringify({
        inputs: {
          user_input: incoming.user_input || ''
        },
        response_mode: 'blocking',
        user: 'patent-bot'
      })
    });

    const text = await response.text();
    let result;
    try { result = JSON.parse(text); } catch { result = { raw: text }; }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '代理請求失敗：' + err.message })
    };
  }
};
