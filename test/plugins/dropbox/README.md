# Dropbox Plugin Tests

Comprehensive test suite for the Dropbox SDK v10 upgrade (v3.0.5 → v10.34.0).

## Overview

This test suite validates all functionality changes made during the Dropbox SDK upgrade, including:

- Response unwrapping (v10 wraps responses in `.result`)
- Async/await conversion (getAuthenticationUrl now returns Promise)
- Authentication object changes (DropboxAuth)
- Error handling improvements
- Buffer.from() migration (deprecated new Buffer())
- Modern JavaScript syntax (const/let)

## Test Structure

```
test/plugins/dropbox/
├── dropbox.test.js    # Unit tests for core Dropbox SDK integration
├── server.test.js     # Integration tests for Express routes
└── README.md          # This file
```

## Running Tests

### Install Test Dependencies

```bash
npm install
```

This will install:
- `mocha` - Test runner
- `chai` - Assertion library
- `sinon` - Mocking and stubbing
- `proxyquire` - Dependency injection for testing
- `supertest` - HTTP assertion library

### Run All Dropbox Tests

```bash
npm run test:dropbox
```

### Run All Backend Tests

```bash
npm run test:backend
```

### Run All Tests (Frontend + Backend)

```bash
npm run test:all
```

### Run Individual Test Files

```bash
# Unit tests only
npx mocha test/plugins/dropbox/dropbox.test.js

# Integration tests only
npx mocha test/plugins/dropbox/server.test.js
```

## Test Coverage

### Unit Tests (`dropbox.test.js`)

Tests all methods in `plugins/dropbox/dropbox.js`:

#### Configuration
- ✅ Environment variable loading
- ✅ Configuration validation

#### getAuthUrl()
- ✅ Async Promise handling (v9 breaking change)
- ✅ Auth URL generation
- ✅ Error handling

#### getRemoteAccessToken()
- ✅ Token extraction from `response.result.access_token` (v6 breaking change)
- ✅ OAuth code exchange
- ✅ Error callback with 'error' status

#### getAccountInfo()
- ✅ User info extraction from `response.result` (v6 breaking change)
- ✅ Access token setting via DropboxAuth
- ✅ Error handling

#### fetchDropboxFile()
- ✅ File content extraction from `response.result.fileBinary` (v6 breaking change)
- ✅ Empty file handling
- ✅ Authentication check (403 response)
- ✅ Error handling with proper status codes

#### searchForMdFiles()
- ✅ Matches extraction from `response.result.matches` (v6 breaking change)
- ✅ Multiple file extension handling
- ✅ Regex filtering
- ✅ Mode parameter format: `{ '.tag': 'filename' }`
- ✅ Error handling

#### saveFileToDropbox()
- ✅ Response unwrapping from `response.result` (v6 breaking change)
- ✅ File extension auto-append (.md)
- ✅ Authentication check
- ✅ Error handling

#### saveImageToDropbox()
- ✅ `Buffer.from()` usage (deprecated Buffer constructor fixed)
- ✅ Response unwrapping from `response.result` (v6 breaking change)
- ✅ Shared link creation
- ✅ &raw=1 parameter appending
- ✅ "Link already exists" error handling
- ✅ Fallback to sharingListSharedLinks()
- ✅ Base64 to Buffer conversion
- ✅ Authentication check

#### Error Handling
- ✅ console.error() logging
- ✅ DropboxResponseError handling (v8 breaking change)

#### Response Wrapping
- ✅ V10 response format validation

### Integration Tests (`server.test.js`)

Tests all routes in `plugins/dropbox/server.js`:

#### GET /redirect/dropbox
- ✅ OAuth URL redirect
- ✅ Session initialization

#### GET /oauth/dropbox
- ✅ Code-to-token exchange
- ✅ Home redirect on success
- ✅ Error redirect with query param
- ✅ Session flags (oauthtoken, isDropboxSynced)
- ✅ User authentication logging
- ✅ Error logging for failed account fetch
- ✅ Missing session handling

#### GET /unlink/dropbox
- ✅ Session clearing
- ✅ Redirect to home

#### POST /import/dropbox
- ✅ File list response
- ✅ 401 error handling (authentication)
- ✅ 400 error handling (bad request)
- ✅ Generic error status (503, etc.)
- ✅ 500 error for unknown errors
- ✅ Error logging

#### POST /fetch/dropbox
- ✅ Delegation to Dropbox.fetchDropboxFile()

#### POST /save/dropbox
- ✅ Delegation to Dropbox.saveFileToDropbox()

#### POST /save/dropbox/image
- ✅ Delegation to Dropbox.saveImageToDropbox()

#### Error Handling Improvements
- ✅ Modern JavaScript (const vs var)
- ✅ Enhanced error logging
- ✅ OAuth error handling

#### Session Management
- ✅ Session persistence across requests
- ✅ Unauthenticated request handling

#### Backward Compatibility
- ✅ Response format matches v3 (client compatibility)

## Key Validations

### Breaking Changes Tested

1. **v9.0.0**: `getAuthenticationUrl()` now returns Promise
   - ✅ Tested with async/await
   - ✅ Error handling for rejected promises

2. **v6.0.0**: All responses wrapped in `.result`
   - ✅ All API methods unwrap responses correctly
   - ✅ Nested properties accessed properly (e.g., `response.result.access_token`)

3. **v6.0.0**: Auth methods moved to DropboxAuth
   - ✅ `setAccessToken()` called on dbxAuth
   - ✅ `getAccessTokenFromCode()` called on dbxAuth
   - ✅ `getAuthenticationUrl()` called on dbxAuth

4. **v8.0.0**: DropboxResponseError class
   - ✅ Error objects have `.status` property
   - ✅ Error handling works with Error instances

5. **v7.0.0**: No null parameters for no-arg methods
   - ✅ `usersGetCurrentAccount()` called without arguments

### Code Quality Improvements

- ✅ `Buffer.from()` instead of `new Buffer()`
- ✅ `const`/`let` instead of `var`
- ✅ Enhanced error logging with console.error()
- ✅ Comprehensive try-catch blocks

## Test Output Example

```bash
$ npm run test:dropbox

  Dropbox Plugin - Unit Tests
    Configuration
      ✓ should load configuration from environment variables
      ✓ should be marked as configured when env vars are present
    getAuthUrl()
      ✓ should return auth URL from async getAuthenticationUrl
      ✓ should handle errors when getAuthenticationUrl fails
    getRemoteAccessToken()
      ✓ should extract access_token from response.result
      ✓ should handle errors and call callback with error status
    ... (47 more tests)

  Dropbox Server Routes - Integration Tests
    GET /redirect/dropbox
      ✓ should redirect to Dropbox OAuth URL
      ✓ should initialize dropbox session object
    GET /oauth/dropbox
      ✓ should exchange code for token and redirect to home
      ✓ should redirect with error on OAuth failure
    ... (28 more tests)

  75 passing (1.2s)
```

## Debugging Tests

### Run with verbose output

```bash
npx mocha test/plugins/dropbox/*.test.js --reporter spec
```

### Run specific test suites

```bash
# Only getAuthUrl tests
npx mocha test/plugins/dropbox/dropbox.test.js --grep "getAuthUrl"

# Only OAuth route tests
npx mocha test/plugins/dropbox/server.test.js --grep "oauth"
```

### Debug individual tests

Add `.only` to focus on a single test:

```javascript
it.only('should extract access_token from response.result', async function() {
  // This test will run exclusively
});
```

## Continuous Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Run Dropbox tests
  run: npm run test:dropbox
```

## Contributing

When adding new Dropbox features:

1. Write tests first (TDD approach)
2. Ensure all existing tests pass
3. Add new test cases to cover edge cases
4. Update this README with new test coverage

## Troubleshooting

### "Cannot find module 'chai'"

Run `npm install` to install test dependencies.

### "Error: Timeout of 5000ms exceeded"

Some async operations may take longer. Increase timeout:

```bash
npx mocha test/plugins/dropbox/*.test.js --timeout 10000
```

### Tests fail with "Error: connect ECONNREFUSED"

Tests use mocks - no real network requests are made. If you see connection errors, check your proxyquire setup.

## References

- [Dropbox SDK v10 UPGRADING Guide](https://github.com/dropbox/dropbox-sdk-js/blob/main/UPGRADING.md)
- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Sinon Mocking](https://sinonjs.org/)
