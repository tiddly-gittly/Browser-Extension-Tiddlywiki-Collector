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

  test('ignores remote or tokenless servers', () => {
    const rules = getTidGiAuthRules({
      remote: {
        id: 'remote',
        name: 'Remote',
        uri: 'https://example.com',
        provider: ServerProvider.TidGiDesktop,
        status: ServerStatus.online,
        active: true,
        authToken: 'secret-token',
      },
      tokenless: {
        id: 'tokenless',
        name: 'Tokenless',
        uri: 'http://localhost:5112',
        provider: ServerProvider.TiddlyHost,
        status: ServerStatus.online,
        active: true,
      },
    });

    expect(rules).toHaveLength(0);
  });
});