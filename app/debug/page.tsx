import { headers } from "next/headers"

// 서버 컴포넌트로 변경 - JavaScript 없이도 작동
export default async function DebugPage() {
  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || "Unknown"

  // 환경 변수 체크
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  // 환경 변수 값의 일부만 표시 (보안)
  const supabaseUrlPreview = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + "..."
    : "없음"

  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>디버그 정보</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          body {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 1rem;
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            color: #000;
          }
          h1 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }
          .info-box {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            background: #f9f9f9;
          }
          .info-item {
            margin: 0.5rem 0;
            padding: 0.5rem;
            background: white;
            border-radius: 4px;
          }
          .label {
            font-weight: bold;
            display: block;
            margin-bottom: 0.25rem;
          }
          .value {
            font-family: monospace;
            font-size: 0.875rem;
            word-break: break-all;
          }
          .status {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-weight: bold;
          }
          .status.ok {
            background: #d4edda;
            color: #155724;
          }
          .status.error {
            background: #f8d7da;
            color: #721c24;
          }
          .note {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 1rem;
            border-radius: 4px;
            margin-top: 1rem;
          }
        `,
          }}
        />
      </head>
      <body>
        <h1>🔍 디버그 정보</h1>

        <div className="info-box">
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
            서버 정보
          </h2>

          <div className="info-item">
            <span className="label">User Agent:</span>
            <div className="value">{userAgent}</div>
          </div>

          <div className="info-item">
            <span className="label">NEXT_PUBLIC_SUPABASE_URL:</span>
            <span className={`status ${hasSupabaseUrl ? "ok" : "error"}`}>
              {hasSupabaseUrl ? "✅ 설정됨" : "❌ 없음"}
            </span>
            {hasSupabaseUrl && (
              <div className="value" style={{ marginTop: "0.5rem" }}>
                {supabaseUrlPreview}
              </div>
            )}
          </div>

          <div className="info-item">
            <span className="label">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:</span>
            <span className={`status ${hasSupabaseKey ? "ok" : "error"}`}>
              {hasSupabaseKey ? "✅ 설정됨" : "❌ 없음"}
            </span>
          </div>
        </div>

        <div className="note">
          <strong>📝 참고:</strong> 이 페이지는 서버에서 렌더링되며 JavaScript가
          필요하지 않습니다. 이 페이지가 보인다면 서버는 정상 작동 중입니다.
          <br />
          <br />
          만약 메인 페이지에서 하얀 화면이 나온다면 클라이언트 사이드
          JavaScript 실행에 문제가 있는 것입니다.
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
          // 클라이언트 사이드 정보 추가
          (function() {
            try {
              var clientInfo = document.createElement('div');
              clientInfo.className = 'info-box';
              clientInfo.innerHTML = '<h2 style="font-size: 1.25rem; margin-bottom: 0.5rem;">클라이언트 정보</h2>';

              // localStorage
              var hasLocalStorage = false;
              try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                hasLocalStorage = true;
              } catch(e) {}

              clientInfo.innerHTML += '<div class="info-item"><span class="label">localStorage:</span><span class="status ' + (hasLocalStorage ? 'ok' : 'error') + '">' + (hasLocalStorage ? '✅ 사용 가능' : '❌ 사용 불가') + '</span></div>';

              // sessionStorage
              var hasSessionStorage = false;
              try {
                sessionStorage.setItem('test', 'test');
                sessionStorage.removeItem('test');
                hasSessionStorage = true;
              } catch(e) {}

              clientInfo.innerHTML += '<div class="info-item"><span class="label">sessionStorage:</span><span class="status ' + (hasSessionStorage ? 'ok' : 'error') + '">' + (hasSessionStorage ? '✅ 사용 가능' : '❌ 사용 불가') + '</span></div>';

              // Cookies
              var hasCookies = navigator.cookieEnabled;
              clientInfo.innerHTML += '<div class="info-item"><span class="label">Cookies:</span><span class="status ' + (hasCookies ? 'ok' : 'error') + '">' + (hasCookies ? '✅ 활성화됨' : '❌ 비활성화됨') + '</span></div>';

              // JavaScript
              clientInfo.innerHTML += '<div class="info-item"><span class="label">JavaScript:</span><span class="status ok">✅ 실행됨</span></div>';

              document.body.appendChild(clientInfo);

              console.log('Debug page client script executed successfully');
            } catch(e) {
              console.error('Debug page client script error:', e);
              var errorDiv = document.createElement('div');
              errorDiv.className = 'info-box';
              errorDiv.style.background = '#f8d7da';
              errorDiv.innerHTML = '<h2>클라이언트 스크립트 에러</h2><div class="value">' + e.message + '</div>';
              document.body.appendChild(errorDiv);
            }
          })();
        `,
          }}
        />
      </body>
    </html>
  )
}
