import { headers } from "next/headers"

// 서버 컴포넌트 - JavaScript 없이도 작동
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
    <div className="min-h-screen p-4">
      <h1 className="mb-4 text-2xl font-bold">🔍 디버그 정보</h1>

      <div className="mb-4 rounded-lg border border-gray-300 bg-gray-50 p-4">
        <h2 className="mb-2 text-xl font-semibold">서버 정보</h2>

        <div className="my-2 rounded bg-white p-2">
          <span className="block font-bold">User Agent:</span>
          <div className="break-all font-mono text-sm">{userAgent}</div>
        </div>

        <div className="my-2 rounded bg-white p-2">
          <span className="block font-bold">NEXT_PUBLIC_SUPABASE_URL:</span>
          <span
            className={`inline-block rounded px-2 py-1 font-bold ${
              hasSupabaseUrl
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {hasSupabaseUrl ? "✅ 설정됨" : "❌ 없음"}
          </span>
          {hasSupabaseUrl && (
            <div className="mt-2 break-all font-mono text-sm">
              {supabaseUrlPreview}
            </div>
          )}
        </div>

        <div className="my-2 rounded bg-white p-2">
          <span className="block font-bold">
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          </span>
          <span
            className={`inline-block rounded px-2 py-1 font-bold ${
              hasSupabaseKey
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {hasSupabaseKey ? "✅ 설정됨" : "❌ 없음"}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded border border-yellow-500 bg-yellow-50 p-4">
        <strong>📝 참고:</strong> 이 페이지는 서버에서 렌더링되며 JavaScript가
        필요하지 않습니다. 이 페이지가 보인다면 서버는 정상 작동 중입니다.
        <br />
        <br />
        만약 메인 페이지에서 하얀 화면이 나온다면 클라이언트 사이드
        JavaScript 실행에 문제가 있는 것입니다.
      </div>

      {/* 클라이언트 정보 추가용 div */}
      <div id="client-info-container"></div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
          // 클라이언트 사이드 정보 추가
          (function() {
            try {
              var container = document.getElementById('client-info-container');
              if (!container) {
                console.error('Client info container not found');
                return;
              }

              var clientBox = document.createElement('div');
              clientBox.className = 'mb-4 rounded-lg border border-gray-300 bg-gray-50 p-4 mt-4';
              clientBox.innerHTML = '<h2 class="mb-2 text-xl font-semibold">클라이언트 정보</h2>';

              // localStorage
              var hasLocalStorage = false;
              try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                hasLocalStorage = true;
              } catch(e) {}

              var localStorageDiv = document.createElement('div');
              localStorageDiv.className = 'my-2 rounded bg-white p-2';
              localStorageDiv.innerHTML = '<span class="block font-bold">localStorage:</span><span class="inline-block rounded px-2 py-1 font-bold ' + (hasLocalStorage ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') + '">' + (hasLocalStorage ? '✅ 사용 가능' : '❌ 사용 불가') + '</span>';
              clientBox.appendChild(localStorageDiv);

              // sessionStorage
              var hasSessionStorage = false;
              try {
                sessionStorage.setItem('test', 'test');
                sessionStorage.removeItem('test');
                hasSessionStorage = true;
              } catch(e) {}

              var sessionStorageDiv = document.createElement('div');
              sessionStorageDiv.className = 'my-2 rounded bg-white p-2';
              sessionStorageDiv.innerHTML = '<span class="block font-bold">sessionStorage:</span><span class="inline-block rounded px-2 py-1 font-bold ' + (hasSessionStorage ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') + '">' + (hasSessionStorage ? '✅ 사용 가능' : '❌ 사용 불가') + '</span>';
              clientBox.appendChild(sessionStorageDiv);

              // Cookies
              var hasCookies = navigator.cookieEnabled;
              var cookiesDiv = document.createElement('div');
              cookiesDiv.className = 'my-2 rounded bg-white p-2';
              cookiesDiv.innerHTML = '<span class="block font-bold">Cookies:</span><span class="inline-block rounded px-2 py-1 font-bold ' + (hasCookies ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') + '">' + (hasCookies ? '✅ 활성화됨' : '❌ 비활성화됨') + '</span>';
              clientBox.appendChild(cookiesDiv);

              // JavaScript
              var jsDiv = document.createElement('div');
              jsDiv.className = 'my-2 rounded bg-white p-2';
              jsDiv.innerHTML = '<span class="block font-bold">JavaScript:</span><span class="inline-block rounded px-2 py-1 font-bold bg-green-100 text-green-800">✅ 실행됨</span>';
              clientBox.appendChild(jsDiv);

              container.appendChild(clientBox);

              console.log('Debug page client script executed successfully');
            } catch(e) {
              console.error('Debug page client script error:', e);
              var errorDiv = document.createElement('div');
              errorDiv.className = 'mb-4 rounded-lg border border-red-500 bg-red-50 p-4 mt-4';
              errorDiv.innerHTML = '<h2 class="text-xl font-semibold">클라이언트 스크립트 에러</h2><div class="font-mono text-sm">' + e.message + '</div>';
              var container = document.getElementById('client-info-container');
              if (container) {
                container.appendChild(errorDiv);
              }
            }
          })();
        `,
        }}
      />
    </div>
  )
}
