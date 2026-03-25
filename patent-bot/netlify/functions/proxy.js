exports.handler = async function (event) {
  // 只接受 POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // API Key 從 Netlify 環境變數讀取，前端永遠看不到
  const DIFY_API_KEY = process.env.DIFY_API_KEY;
  const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1/workflows/run';

  if (!DIFY_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '伺服器尚未設定 DIFY_API_KEY 環境變數' })
    };
  }

  try {
    const body = JSON.parse(event.body);

    const response = await fetch(DIFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIFY_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.text();

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: data
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '代理請求失敗：' + err.message })
    };
  }
};
