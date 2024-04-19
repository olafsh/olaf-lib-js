export const getHost = () => {
  const result: RegExpMatchArray | null = location.origin.match(
    "http(s)?:\\/\\/(?<host>[A-Za-z0-9-.]*)((:\\d*))?(.*)?"
  );
  const groups = result ? result.groups : null;
  if (groups == null || !("host" in groups)) {
    return null;
  }
  return groups["host"];
};

export const setStyles = (styles: any) => {
  const _document = document.documentElement;
  styles.map((s: any) => {
    _document.style.setProperty(s["name"], String(s["value"]));
  });
};

const urlEncodeBase64 = (input: string) => {
  const base64Chars: { [index: string]: string } = {
    "+": "-",
    "/": "_",
    "=": "",
  };
  return input.replace(/[+/=]/g, (m: string) => base64Chars[m]);
};

export const bufferToBase64UrlEncoded = (input: number[] | Uint8Array) => {
  const safeInput = new Uint8Array(input);
  return urlEncodeBase64(window.btoa(String.fromCharCode(...Array.from(safeInput))));
};

export const createQueryParams = (params: any) => {
  return Object.keys(params)
    .filter(k => typeof params[k] !== "undefined")
    .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
    .join("&");
};

export const parseQueryResult = (queryString: string) => {
  if (queryString.indexOf("#") > -1) {
    queryString = queryString.substring(0, queryString.indexOf("#"));
  }

  const queryParams = queryString.split("&");

  const parsedQuery: any = {};
  queryParams.forEach(qp => {
    const [key, val] = qp.split("=");
    parsedQuery[key] = decodeURIComponent(val);
  });

  return {
    ...parsedQuery,
    expires_in: parseInt(parsedQuery.expires_in),
  };
};

export function fetchData<T>(
  method: string,
  url: string,
  body?: BodyInit | null | undefined,
  headers?: any,
  includeCredentials = false
): Promise<T | null> {
  if (headers == null) {
    headers = new Headers({
      "Content-Type": "application/json",
    });
  }

  // !! for sending cookies and session data !!
  const credentials: RequestCredentials = includeCredentials ? "include" : "omit";

  return fetch(url, { method, headers: headers, body, credentials }).then(response => {
    if (response.status === 201 || response.status === 204) {
      return null;
    } else if (response.status === 401) {
      throw response;
    }
    return response.json();
  }) as Promise<T | null>;
}
