import { getTidGiAuthRules } from './tidgiAuthRules';
import { ServerProvider, ServerStatus } from '../shared/server/store';

describe('getTidGiAuthRules', () => {
  test('creates header rules for local TidGi servers with auth token', () => {
    const rules = getTidGiAuthRules({
      local: {
        id: 'local',
        name: 'Local TidGi',
        uri: 'http://localhost:5112',
        provider: ServerProvider.TidGiDesktop,
        status: ServerStatus.online,
        active: true,
        authToken: 'secret-token',
        authUserName: 'alice',
      },
    });

    expect(rules).toHaveLength(1);
    expect(rules[0]?.action.requestHeaders?.[0]).toEqual({
      operation: 'set',
      header: 'x-tidgi-auth-token-secret-token',
      value: 'alice',
    });
    expect(rules[0]?.condition.regexFilter).toContain('localhost:5112');
  });

  test('creates header rules for LAN TidGi servers with auth token', () => {
    const rules = getTidGiAuthRules({
      lan: {
        id: 'lan',
        name: 'LAN TidGi',
        uri: 'http://192.168.3.24:5212',
        provider: ServerProvider.TidGiDesktop,
        status: ServerStatus.online,
        active: true,
        authToken: 'lan-token',
        authUserName: 'bob',
      },
    });

    expect(rules).toHaveLength(1);
    expect(rules[0]?.action.requestHeaders?.[0]).toEqual({
      operation: 'set',
      header: 'x-tidgi-auth-token-lan-token',
      value: 'bob',
    });
    expect(rules[0]?.condition.regexFilter).toContain('192\\.168\\.3\\.24:5212');
  });

  test('ignores tokenless or non-TidGi servers', () => {
    const rules = getTidGiAuthRules({
      tokenless: {
        id: 'tokenless',
        name: 'Tokenless',
        uri: 'http://192.168.3.24:5212',
        provider: ServerProvider.TidGiDesktop,
        status: ServerStatus.online,
        active: true,
      },
      nonTidGi: {
        id: 'nonTidGi',
        name: 'Non TidGi',
        uri: 'http://192.168.3.24:5212',
        provider: ServerProvider.TiddlyHost,
        status: ServerStatus.online,
        active: true,
      },
    });

    expect(rules).toHaveLength(0);
  });
});