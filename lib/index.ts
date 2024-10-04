import type { ConfigModel } from "./models/config";
import type { UserModel } from "./models/user";
import {
  bufferToBase64UrlEncoded,
  createQueryParams,
  fetchData,
  getHost,
  parseQueryResult,
  setStyles,
} from "./utils/utils";
import { createRandomString, sha256 } from "./utils/crypto";
import { AuthModel } from "./models/auth";

class OLAFSDK {
  private OLAF_PUBLIC_ENDPOINT: string;
  private CONFIG_PATH = "/config/app/";
  private ACCESS_TOKEN_PATH = "/o/token/";
  private VERIFY_TOKEN_PATH = "/o/verify-token/";
  private AUTHORIZE_PATH = "/o/authorize/";
  private LOGOUT_PATH = "/o/logout/";
  private USER_DETAILS_PATH = "/users/me/";
  private AUTHORIZE_STORAGE_KEY = "olaf.auth.o";
  private ACCESS_TOKEN_STORAGE_KEY = "olaf.auth.token";
  private CONFIG_STORAGE_KEY = "olaf.config";
  private CONFIG_TTL = 3600;

  private _DEFAULT_OLAF_PUBLIC_ENDPOINT = "https://public.accounts.olaf.sh";
  private _DEFAULT_LANGUAGE = "en";

  constructor(olafPublicEndpoint?: string) {
    this.OLAF_PUBLIC_ENDPOINT = olafPublicEndpoint ?? this._DEFAULT_OLAF_PUBLIC_ENDPOINT;

    const config = this.getConfigFromLocalStorage();
    if (config !== undefined) {
      this.setConfig(config);
    }
  }

  private _config: ConfigModel | undefined;

  get config(): ConfigModel | undefined {
    return this._config;
  }

  private _isAuthenticated?: boolean;

  get isAuthenticated(): Promise<boolean> {
    if (this._isAuthenticated !== undefined) {
      return Promise.resolve(this._isAuthenticated);
    }

    return this.verifyToken();
  }

  private _language?: string;

  get language(): string {
    if (this._language !== undefined) {
      return this._language;
    }

    return this._DEFAULT_LANGUAGE;
  }

  get accessToken(): string {
    const auth = this.getAuthFromLocalStorage();
    if (auth !== undefined) {
      return auth.access_token;
    }
    return "";
  }

  private _user: UserModel | undefined;

  get user(): UserModel | undefined {
    return this._user;
  }

  public fetchConfig(): Promise<any> {
    const headers = { "X-APP-HOST": getHost() ?? "" };
    return fetchData("GET", `${this.OLAF_PUBLIC_ENDPOINT}${this.CONFIG_PATH}`, null, headers)
      .then((config: any) => {
        this.setConfigWithExpiry(config as ConfigModel);
        return Promise.resolve(config);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }

  public async buildAuthorizeUrl(): Promise<string> {
    if (this.config === undefined) {
      return Promise.reject("No config found.");
    }
    const codeVerifier = createRandomString();
    const codeChallengeBuffer = await sha256(codeVerifier);
    const codeChallenge = bufferToBase64UrlEncoded(codeChallengeBuffer);
    const redirectUrl = `${this.config.redirect_url}`;
    // authorize params
    const params = {
      client_id: this.config.client_id,
      response_type: "code",
      redirect_uri: redirectUrl,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      lang: this.language,
    };
    // generate authorize url
    const authorizeUrl = `${this.config.api_endpoint}${this.AUTHORIZE_PATH}?${createQueryParams(params)}`;
    // save data to session storage
    const authorizeStorageParams = {
      code_verifier: codeVerifier,
      redirect_uri: params.redirect_uri,
    };
    sessionStorage.setItem(this.AUTHORIZE_STORAGE_KEY, JSON.stringify(authorizeStorageParams));
    // return generated authorize url
    return Promise.resolve(authorizeUrl);
  }

  public async loginWithRedirect(): Promise<void> {
    window.location.href = await this.buildAuthorizeUrl();
    return Promise.resolve();
  }

  public logout(): Promise<void> | undefined {
    const config = this.config;
    const headers = { Authorization: `Bearer ${this.accessToken}` };
    return fetchData("POST", `${config?.api_endpoint}${this.LOGOUT_PATH}`, null, headers, true).then(() => {
      localStorage.removeItem(this.ACCESS_TOKEN_STORAGE_KEY);
      window.location.href = window.location.origin;
      this.setIsAuthenticated(false);
      return Promise.resolve();
    });
  }

  public async verifyToken(): Promise<boolean> {
    const headers = { Authorization: `Bearer ${this.accessToken}` };
    return await fetchData("POST", `${this.config?.api_endpoint}${this.VERIFY_TOKEN_PATH}`, null, headers)
      .then(() => {
        this.setIsAuthenticated(true);
        return Promise.resolve(true);
      })
      .catch(() => {
        this.setIsAuthenticated(false);
        return Promise.resolve(false);
      });
  }

  public handleRedirectCallback(): Promise<any> {
    // get params
    const queryStringFragments = window.location.href.split("?").slice(1);
    if (queryStringFragments.length === 0) {
      // remove authorize data from session storage
      sessionStorage.removeItem(this.AUTHORIZE_STORAGE_KEY);
      return Promise.reject("There are no query params available for parsing.");
    }
    const { code } = parseQueryResult(queryStringFragments.join(""));
    // get authorize data
    let authorizeData = JSON.parse(sessionStorage.getItem(this.AUTHORIZE_STORAGE_KEY) ?? "");
    // remove authorize data from session storage
    sessionStorage.removeItem(this.AUTHORIZE_STORAGE_KEY);
    // authorize data should have a `code_verifier` to do PKCE
    if (!authorizeData || !authorizeData.code_verifier) {
      return Promise.reject("Invalid state");
    }
    // get access token
    return this.getAccessToken(authorizeData.code_verifier, code)
      .then((data: any) => {
        if (data != null && "error" in data) {
          return Promise.reject(data);
        }
        // save access token
        const auth: AuthModel = new AuthModel(data);
        this.setIsAuthenticated(true);
        this.setAuthToLocalStorage(auth);
        return Promise.resolve(() => true);
      })
      .catch(() => {
        this.setIsAuthenticated(false);
        return Promise.reject("Error while fetching access token");
      });
  }

  // public getRefreshToken(token: string): Promise<any> {
  //   const config = this.config;
  //   const body = {
  //     refresh_token: token,
  //     client_id: config?.client_id,
  //     grant_type: "refresh_token",
  //   };
  //   return fetchData("POST", `${config?.api_endpoint}${this.ACCESS_TOKEN_PATH}`, JSON.stringify(body));
  // }

  public setLanguage(language: string): void {
    this._language = language;
  }

  public async me(): Promise<any> {
    const headers = { Authorization: `Bearer ${this.accessToken}` };
    return await fetchData("GET", `${this.config?.api_endpoint}${this.USER_DETAILS_PATH}`, null, headers)
      .then((user: any) => {
        this.setUser(user as UserModel);
        return Promise.resolve(user);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }

  private getAccessToken(code_verifier: string, code: string | undefined) {
    const config = this.config;
    const headers = new Headers({
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    });
    const body = {
      client_id: config?.client_id,
      grant_type: "authorization_code",
      redirect_uri: config?.redirect_url,
      code_verifier,
      code,
    };
    let formBodyTemp: string[] = [];
    for (let property in body) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(body[property]);
      formBodyTemp.push(encodedKey + "=" + encodedValue);
    }
    const formBody = formBodyTemp.join("&");
    return fetchData("POST", `${config?.api_endpoint}${this.ACCESS_TOKEN_PATH}`, formBody, headers);
  }

  private setIsAuthenticated(isAuthenticated: boolean): void {
    this._isAuthenticated = isAuthenticated;
  }

  private setConfigWithExpiry(config: ConfigModel) {
    const now = new Date();
    config = {
      ...config,
      expiry: now.getTime() + this.CONFIG_TTL * 1000,
    };
    // set config
    this.setConfig(config);
    // set config to localstorage
    this.setConfigToLocalStorage(config);
  }

  private setConfig(config: ConfigModel) {
    // set config
    this._config = config;
    // set styles
    setStyles(config.styles);
  }

  private setConfigToLocalStorage(config: ConfigModel): boolean {
    if (config && config.api_endpoint) {
      localStorage.setItem(this.CONFIG_STORAGE_KEY, JSON.stringify(config));
      return true;
    }
    return false;
  }

  private getConfigFromLocalStorage(): ConfigModel | undefined {
    try {
      const config = JSON.parse(localStorage.getItem(this.CONFIG_STORAGE_KEY) ?? "");
      const now = new Date();
      if (config.expiry >= now.getTime()) {
        return config;
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  private setAuthToLocalStorage(auth: AuthModel): boolean {
    // store auth authToken/refreshToken/expiresIn in local storage to keep user logged in between page refreshes
    if (auth && auth.access_token) {
      localStorage.setItem(this.ACCESS_TOKEN_STORAGE_KEY, JSON.stringify(auth));
      return true;
    }
    return false;
  }

  private getAuthFromLocalStorage(): AuthModel | undefined {
    try {
      return JSON.parse(localStorage.getItem(this.ACCESS_TOKEN_STORAGE_KEY) ?? "");
    } catch (error) {
      return undefined;
    }
  }

  private setUser(user: UserModel) {
    // set user
    this._user = user;
  }
}

module.exports = OLAFSDK;

export default OLAFSDK;
