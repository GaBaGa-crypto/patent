exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const WEBHOOK_URL = process.env.DIFY_WEBHOOK_URL;

  if (!WEBHOOK_URL) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '伺服器尚未設定 DIFY_WEBHOOK_URL 環境變數' })
    };
  }

  try {
    const incoming = JSON.parse(event.body);

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_input: incoming.user_input || ''
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
