// Google OAuth2 authentication for Vision API

class GoogleAuth {
  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLOUD_CLIENT_ID;
    this.clientSecret = import.meta.env.VITE_GOOGLE_CLOUD_CLIENT_SECRET;
    this.scope = 'https://www.googleapis.com/auth/cloud-platform';
    this.redirectUri = this.getRedirectUri();
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
  }

  // 適切なリダイレクトURIを取得
  getRedirectUri() {
    const origin = window.location.origin;
    return `${origin}/auth/callback`;
  }

  // OAuth2認証フローを開始
  async authenticate() {
    if (!this.clientId) {
      throw new Error('Google Cloud client ID not configured');
    }

    // 既存のトークンが有効かチェック
    if (this.isTokenValid()) {
      return this.accessToken;
    }

    // リフレッシュトークンがある場合は更新を試行
    if (this.refreshToken) {
      try {
        await this.refreshAccessToken();
        return this.accessToken;
      } catch (error) {
        console.warn('Failed to refresh token:', error);
        // リフレッシュ失敗時は再認証
      }
    }

    // 新規認証
    return this.initiateOAuthFlow();
  }

  // OAuth2フローを開始
  initiateOAuthFlow() {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    const params = {
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state: this.generateState()
    };

    Object.keys(params).forEach(key => {
      authUrl.searchParams.append(key, params[key]);
    });

    // 認証ページにリダイレクト
    window.location.href = authUrl.toString();
  }

  // 認証コードからアクセストークンを取得
  async exchangeCodeForToken(code, state) {
    if (!this.validateState(state)) {
      throw new Error('Invalid state parameter');
    }

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const data = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri
    };

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(data)
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status}`);
      }

      const tokenData = await response.json();
      
      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token;
      this.tokenExpiry = new Date(Date.now() + (tokenData.expires_in * 1000));

      // トークンをローカルストレージに保存
      this.saveTokens();

      return this.accessToken;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  // アクセストークンを更新
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const data = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: this.refreshToken,
      grant_type: 'refresh_token'
    };

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(data)
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const tokenData = await response.json();
      
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = new Date(Date.now() + (tokenData.expires_in * 1000));

      // 新しいリフレッシュトークンがある場合は更新
      if (tokenData.refresh_token) {
        this.refreshToken = tokenData.refresh_token;
      }

      this.saveTokens();
      return this.accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      throw error;
    }
  }

  // トークンの有効性をチェック
  isTokenValid() {
    return this.accessToken && 
           this.tokenExpiry && 
           new Date() < new Date(this.tokenExpiry.getTime() - 60000); // 1分のバッファ
  }

  // state パラメータを生成
  generateState() {
    const state = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('oauth_state', state);
    return state;
  }

  // state パラメータを検証
  validateState(state) {
    const savedState = sessionStorage.getItem('oauth_state');
    sessionStorage.removeItem('oauth_state');
    return savedState === state;
  }

  // トークンをローカルストレージに保存
  saveTokens() {
    const tokenData = {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      tokenExpiry: this.tokenExpiry?.toISOString()
    };
    localStorage.setItem('google_auth_tokens', JSON.stringify(tokenData));
  }

  // ローカルストレージからトークンを読み込み
  loadTokens() {
    try {
      const tokenData = localStorage.getItem('google_auth_tokens');
      if (tokenData) {
        const parsed = JSON.parse(tokenData);
        this.accessToken = parsed.accessToken;
        this.refreshToken = parsed.refreshToken;
        this.tokenExpiry = parsed.tokenExpiry ? new Date(parsed.tokenExpiry) : null;
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
      this.clearTokens();
    }
  }

  // トークンをクリア
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem('google_auth_tokens');
  }

  // ログアウト
  logout() {
    this.clearTokens();
  }
}

// シングルトンインスタンス
const googleAuth = new GoogleAuth();

// 初期化時にトークンを読み込み
googleAuth.loadTokens();

export default googleAuth;