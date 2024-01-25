export const getCrypto = () => {
  // ie 11.x uses msCrypto
  return (window.crypto || (window as any).msCrypto) as Crypto;
};

export const getCryptoSubtle = () => {
  const crypto = getCrypto();
  // safari 10.x uses webkitSubtle
  return crypto.subtle || (crypto as any).webkitSubtle;
};

export const createRandomString = () => {
  const charset =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.';
  let random = '';
  const randomValues = Array.from(
    getCrypto().getRandomValues(new Uint8Array(43))
  );
  randomValues.forEach(v => (random += charset[v % charset.length]));
  return random;
};

export const sha256 = async (s: string) => {
  const digestOp: any = getCryptoSubtle().digest(
    { name: 'SHA-256' },
    new TextEncoder().encode(s)
  );
  // msCrypto (IE11) uses the old spec, which is not Promise based
  // https://msdn.microsoft.com/en-us/expression/dn904640(v=vs.71)
  // Instead of returning a promise, it returns a CryptoOperation with a result property in it.
  // As a result, the various events need to be handled in the event that we're
  // working in IE11 (hence the msCrypto check). These events just call resolve
  // or reject depending on their intention.
  if ((window as any).msCrypto) {
    return new Promise((res, rej) => {
      digestOp.oncomplete = (e: any) => {
        res(e.target.result);
      };
      digestOp.onerror = (e: ErrorEvent) => {
        rej(e.error);
      };
      digestOp.onabort = () => {
        rej('The digest operation was aborted');
      };
    });
  }
  return await digestOp;
};
