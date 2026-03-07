import type { IServerInfo } from './store';
import { ServerProvider } from './store';

export const TIDGI_AUTH_TOKEN_HEADER = 'x-tidgi-auth-token';
export const DEFAULT_TIDGI_AUTH_USER_NAME = 'TidGi User';

export function getTidGiAuthHeaderName(authToken: string) {
  return `${TIDGI_AUTH_TOKEN_HEADER}-${authToken.trim()}`;
}

export function getTidGiAuthHeaderValue(server: Pick<IServerInfo, 'authUserName'>) {
  return server.authUserName?.trim() || DEFAULT_TIDGI_AUTH_USER_NAME;
}

export function shouldUseTidGiAuth(server: Pick<IServerInfo, 'provider' | 'authToken' | 'uri'>) {
  return server.provider === ServerProvider.TidGiDesktop && Boolean(server.authToken?.trim());
}

export function getTidGiAuthHeaders(server: Pick<IServerInfo, 'provider' | 'authToken' | 'authUserName' | 'uri'>) {
  if (!shouldUseTidGiAuth(server)) {
    return {};
  }

  return {
    [getTidGiAuthHeaderName(server.authToken as string)]: getTidGiAuthHeaderValue(server),
  };
}