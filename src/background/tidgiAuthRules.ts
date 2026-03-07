import { addProtocolToUrl } from '../utils';
import { getTidGiAuthHeaderName, getTidGiAuthHeaderValue, shouldUseTidGiAuth } from '../shared/server/auth';
import type { IServerInfo } from '../shared/server/store';

const AUTH_RULE_BASE_ID = 10_000;
const AUTH_RULE_LIMIT = 100;

const resourceTypes: chrome.declarativeNetRequest.ResourceType[] = [
  'main_frame' as chrome.declarativeNetRequest.ResourceType,
  'sub_frame' as chrome.declarativeNetRequest.ResourceType,
  'script' as chrome.declarativeNetRequest.ResourceType,
  'xmlhttprequest' as chrome.declarativeNetRequest.ResourceType,
  'stylesheet' as chrome.declarativeNetRequest.ResourceType,
  'image' as chrome.declarativeNetRequest.ResourceType,
  'font' as chrome.declarativeNetRequest.ResourceType,
  'media' as chrome.declarativeNetRequest.ResourceType,
  'other' as chrome.declarativeNetRequest.ResourceType,
];

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getServerRegexFilter(server: IServerInfo) {
  const parsedUrl = new URL(addProtocolToUrl(server.uri));
  const normalizedPath = parsedUrl.pathname === '/' ? '/' : `${parsedUrl.pathname.replace(/\/$/, '')}/`;
  return `^${escapeRegex(`${parsedUrl.protocol}//${parsedUrl.host}${normalizedPath}`)}.*`;
}

export function getManagedTidGiRuleIds() {
  return Array.from({ length: AUTH_RULE_LIMIT }, (_, index) => AUTH_RULE_BASE_ID + index);
}

export function getTidGiAuthRules(servers: Record<string, IServerInfo>): chrome.declarativeNetRequest.Rule[] {
  return Object.values(servers)
    .filter(shouldUseTidGiAuth)
    .slice(0, AUTH_RULE_LIMIT)
    .map((server, index) => ({
      id: AUTH_RULE_BASE_ID + index,
      priority: 1,
      action: {
        type: 'modifyHeaders' as chrome.declarativeNetRequest.RuleActionType,
        requestHeaders: [
          {
            operation: 'set' as chrome.declarativeNetRequest.HeaderOperation,
            header: getTidGiAuthHeaderName(server.authToken as string),
            value: getTidGiAuthHeaderValue(server),
          },
        ],
      },
      condition: {
        regexFilter: getServerRegexFilter(server),
        resourceTypes,
      },
    }));
}