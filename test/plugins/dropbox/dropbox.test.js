/**
 * Unit tests for Dropbox SDK v10 integration
 * Tests all methods updated during the v3.0.5 -> v10.34.0 upgrade
 */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Dropbox Plugin - Unit Tests', function() {
  let Dropbox;
  let mockDropboxAuth;
  let mockDropboxClient;
  let dropboxModule;

  beforeEach(function() {
    // Mock DropboxAuth
    mockDropboxAuth = {
      getAuthenticationUrl: sinon.stub(),
      getAccessTokenFromCode: sinon.stub(),
      setAccessToken: sinon.stub(),
      setClientSecret: sinon.stub()
    };

    // Mock Dropbox client
    mockDropboxClient = {
      auth: mockDropboxAuth,
      usersGetCurrentAccount: sinon.stub(),
      filesDownload: sinon.stub(),
      filesSearch: sinon.stub(),
      filesUpload: sinon.stub(),
      sharingCreateSharedLink: sinon.stub(),
      sharingListSharedLinks: sinon.stub()
    };

    // Mock the dropbox module
    const mockDropboxSDK = {
      Dropbox: sinon.stub().returns(mockDropboxClient),
      DropboxAuth: sinon.stub().returns(mockDropboxAuth)
    };

    // Set environment variables
    process.env.DROPBOX_APP_KEY = 'test_app_key';
    process.env.DROPBOX_APP_SECRET = 'test_app_secret';
    process.env.DROPBOX_CALLBACK_URL = 'http://localhost:8080/oauth/dropbox';

    // Load the Dropbox plugin with mocked dependencies
    dropboxModule = proxyquire('../../../plugins/dropbox/dropbox.js', {
      'dropbox': mockDropboxSDK
    });

    Dropbox = dropboxModule.Dropbox;
  });

  afterEach(function() {
    sinon.restore();
    delete process.env.DROPBOX_APP_KEY;
    delete process.env.DROPBOX_APP_SECRET;
    delete process.env.DROPBOX_CALLBACK_URL;
  });

  describe('Configuration', function() {
    it('should load configuration from environment variables', function() {
      expect(Dropbox.config.app_key).to.equal('test_app_key');
      expect(Dropbox.config.app_secret).to.equal('test_app_secret');
      expect(Dropbox.config.callback_url).to.equal('http://localhost:8080/oauth/dropbox');
    });

    it('should be marked as configured when env vars are present', function() {
      expect(Dropbox.isConfigured).to.be.true;
    });
  });

  describe('getAuthUrl()', function() {
    it('should return auth URL from async getAuthenticationUrl', async function() {
      const expectedUrl = 'https://www.dropbox.com/oauth2/authorize?client_id=test';
      mockDropboxAuth.getAuthenticationUrl.resolves(expectedUrl);

      const cb = sinon.spy();
      await Dropbox.getAuthUrl({}, {}, cb);

      expect(mockDropboxAuth.getAuthenticationUrl.calledOnce).to.be.true;
      expect(mockDropboxAuth.getAuthenticationUrl.calledWith(
        'http://localhost:8080/oauth/dropbox',
        null,
        'code'
      )).to.be.true;
      expect(cb.calledWith(expectedUrl)).to.be.true;
    });

    it('should handle errors when getAuthenticationUrl fails', async function() {
      const error = new Error('Auth URL generation failed');
      mockDropboxAuth.getAuthenticationUrl.rejects(error);

      const cb = sinon.spy();
      await Dropbox.getAuthUrl({}, {}, cb);

      expect(cb.calledWith(null, error)).to.be.true;
    });
  });

  describe('getRemoteAccessToken()', function() {
    it('should extract access_token from response.result', async function() {
      const mockResponse = {
        result: {
          access_token: 'test_access_token_12345'
        }
      };
      mockDropboxAuth.getAccessTokenFromCode.resolves(mockResponse);

      const cb = sinon.spy();
      await Dropbox.getRemoteAccessToken('auth_code_123', cb);

      expect(mockDropboxAuth.getAccessTokenFromCode.calledWith(
        'http://localhost:8080/oauth/dropbox',
        'auth_code_123'
      )).to.be.true;
      expect(cb.calledWith('ok', 'test_access_token_12345')).to.be.true;
    });

    it('should handle errors and call callback with error status', async function() {
      const error = new Error('Token exchange failed');
      mockDropboxAuth.getAccessTokenFromCode.rejects(error);

      const cb = sinon.spy();
      await Dropbox.getRemoteAccessToken('bad_code', cb);

      expect(cb.calledWith('error', error)).to.be.true;
    });
  });

  describe('getAccountInfo()', function() {
    it('should extract user info from response.result', async function() {
      const mockUser = {
        account_id: 'dbid:123',
        name: { display_name: 'Test User' },
        email: 'test@example.com'
      };
      const mockResponse = { result: mockUser };
      mockDropboxClient.usersGetCurrentAccount.resolves(mockResponse);

      const cb = sinon.spy();
      await Dropbox.getAccountInfo('test_token', cb);

      expect(mockDropboxAuth.setAccessToken.calledWith('test_token')).to.be.true;
      expect(mockDropboxClient.usersGetCurrentAccount.calledOnce).to.be.true;
      expect(cb.calledWith(null, mockUser)).to.be.true;
    });

    it('should handle errors when fetching account info fails', async function() {
      const error = new Error('Account fetch failed');
      mockDropboxClient.usersGetCurrentAccount.rejects(error);

      const cb = sinon.spy();
      await Dropbox.getAccountInfo('test_token', cb);

      expect(cb.calledWith(error)).to.be.true;
    });
  });

  describe('fetchDropboxFile()', function() {
    let req, res;

    beforeEach(function() {
      req = {
        session: {
          isDropboxSynced: true,
          dropbox: { oauthtoken: 'test_token' }
        },
        body: { mdFile: '/test.md' }
      };
      res = {
        type: sinon.stub().returnsThis(),
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
        json: sinon.stub()
      };
    });

    it('should return 403 if not authenticated', async function() {
      req.session.isDropboxSynced = false;

      await Dropbox.fetchDropboxFile(req, res);

      expect(res.status.calledWith(403)).to.be.true;
      expect(res.send.calledWith("You are not authenticated with Dropbox.")).to.be.true;
    });

    it('should extract fileBinary from response.result', async function() {
      const fileContent = Buffer.from('# Test Content');
      const mockResponse = {
        result: {
          fileBinary: fileContent
        }
      };
      mockDropboxClient.filesDownload.resolves(mockResponse);

      await Dropbox.fetchDropboxFile(req, res);

      expect(mockDropboxAuth.setAccessToken.calledWith('test_token')).to.be.true;
      expect(mockDropboxClient.filesDownload.calledWith({ path: '/test.md' })).to.be.true;
      expect(res.json.calledWith({ data: '# Test Content' })).to.be.true;
    });

    it('should handle empty files', async function() {
      const mockResponse = {
        result: {
          fileBinary: null
        }
      };
      mockDropboxClient.filesDownload.resolves(mockResponse);

      await Dropbox.fetchDropboxFile(req, res);

      expect(res.json.calledWith({ data: '' })).to.be.true;
    });

    it('should handle errors with proper status codes', async function() {
      const error = new Error('File not found');
      error.status = 404;
      mockDropboxClient.filesDownload.rejects(error);

      await Dropbox.fetchDropboxFile(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.called).to.be.true;
    });
  });

  describe('searchForMdFiles()', function() {
    it('should extract matches from response.result', async function() {
      const mockMatches = [
        { metadata: { name: 'test1.md', path_lower: '/test1.md' } },
        { metadata: { name: 'test2.md', path_lower: '/test2.md' } }
      ];
      const mockResponse = { result: { matches: mockMatches } };
      mockDropboxClient.filesSearch.resolves(mockResponse);

      const cb = sinon.spy();
      await Dropbox.searchForMdFiles('test_token', { fileExts: 'md' }, cb);

      expect(mockDropboxAuth.setAccessToken.calledWith('test_token')).to.be.true;
      expect(mockDropboxClient.filesSearch.calledWith({
        path: '',
        query: 'md',
        max_results: 500,
        mode: { '.tag': 'filename' }
      })).to.be.true;
      expect(cb.calledWith(null, sinon.match.array)).to.be.true;
      expect(cb.args[0][1]).to.have.lengthOf(2);
    });

    it('should handle multiple file extensions', async function() {
      const mockResponse1 = { result: { matches: [
        { metadata: { name: 'test.md', path_lower: '/test.md' } }
      ]}};
      const mockResponse2 = { result: { matches: [
        { metadata: { name: 'test.txt', path_lower: '/test.txt' } }
      ]}};

      mockDropboxClient.filesSearch
        .onFirstCall().resolves(mockResponse1)
        .onSecondCall().resolves(mockResponse2);

      const cb = sinon.spy();
      await Dropbox.searchForMdFiles('test_token', { fileExts: 'md|txt' }, cb);

      expect(mockDropboxClient.filesSearch.calledTwice).to.be.true;
      expect(cb.calledWith(null, sinon.match.array)).to.be.true;
      expect(cb.args[0][1]).to.have.lengthOf(2);
    });

    it('should filter results by extension regex', async function() {
      const mockMatches = [
        { metadata: { name: 'test.md', path_lower: '/test.md' } },
        { metadata: { name: 'test.txt', path_lower: '/test.txt' } }
      ];
      const mockResponse = { result: { matches: mockMatches } };
      mockDropboxClient.filesSearch.resolves(mockResponse);

      const cb = sinon.spy();
      await Dropbox.searchForMdFiles('test_token', { fileExts: 'md' }, cb);

      // Should only include .md file
      expect(cb.args[0][1]).to.have.lengthOf(1);
      expect(cb.args[0][1][0].name).to.equal('test.md');
    });

    it('should handle search errors', async function() {
      const error = new Error('Search failed');
      mockDropboxClient.filesSearch.rejects(error);

      const cb = sinon.spy();
      await Dropbox.searchForMdFiles('test_token', { fileExts: 'md' }, cb);

      expect(cb.calledWith(error, null)).to.be.true;
    });
  });

  describe('saveFileToDropbox()', function() {
    let req, res;

    beforeEach(function() {
      req = {
        session: {
          isDropboxSynced: true,
          dropbox: { oauthtoken: 'test_token' }
        },
        body: {
          pathToMdFile: '/Dillinger/test.md',
          fileContents: '# Test Content'
        }
      };
      res = {
        type: sinon.stub().returnsThis(),
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
        json: sinon.stub()
      };
    });

    it('should return 403 if not authenticated', async function() {
      req.session.isDropboxSynced = false;

      await Dropbox.saveFileToDropbox(req, res);

      expect(res.status.calledWith(403)).to.be.true;
    });

    it('should upload file and return response.result', async function() {
      const mockResult = {
        name: 'test.md',
        path_display: '/Dillinger/test.md',
        id: 'id:123'
      };
      const mockResponse = { result: mockResult };
      mockDropboxClient.filesUpload.resolves(mockResponse);

      await Dropbox.saveFileToDropbox(req, res);

      expect(mockDropboxAuth.setAccessToken.calledWith('test_token')).to.be.true;
      expect(mockDropboxClient.filesUpload.calledWith({
        path: '/Dillinger/test.md',
        contents: '# Test Content',
        autorename: true,
        mode: { '.tag': 'overwrite' }
      })).to.be.true;
      expect(res.json.calledWith({ data: mockResult })).to.be.true;
    });

    it('should add .md extension if missing', async function() {
      req.body.pathToMdFile = '/Dillinger/test';
      const mockResponse = { result: {} };
      mockDropboxClient.filesUpload.resolves(mockResponse);

      await Dropbox.saveFileToDropbox(req, res);

      expect(mockDropboxClient.filesUpload.args[0][0].path).to.equal('/Dillinger/test.md');
    });

    it('should handle upload errors', async function() {
      const error = new Error('Upload failed');
      error.status = 500;
      mockDropboxClient.filesUpload.rejects(error);

      await Dropbox.saveFileToDropbox(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.called).to.be.true;
    });
  });

  describe('saveImageToDropbox()', function() {
    let req, res;

    beforeEach(function() {
      req = {
        session: {
          isDropboxSynced: true,
          dropbox: { oauthtoken: 'test_token' }
        },
        body: {
          image_name: 'test.png',
          fileContents: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        }
      };
      res = {
        type: sinon.stub().returnsThis(),
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
        json: sinon.stub()
      };
    });

    it('should return 403 if not authenticated', async function() {
      req.session.isDropboxSynced = false;

      await Dropbox.saveImageToDropbox(req, res);

      expect(res.status.calledWith(403)).to.be.true;
    });

    it('should upload image with Buffer.from() and create shared link', async function() {
      const mockUploadResponse = { result: {} };
      const mockLinkResponse = {
        result: {
          url: 'https://www.dropbox.com/s/abc123/test.png?dl=0'
        }
      };

      mockDropboxClient.filesUpload.resolves(mockUploadResponse);
      mockDropboxClient.sharingCreateSharedLink.resolves(mockLinkResponse);

      await Dropbox.saveImageToDropbox(req, res);

      // Check that filesUpload was called with Buffer
      const uploadCall = mockDropboxClient.filesUpload.args[0][0];
      expect(uploadCall.path).to.equal('/Dillinger/_images/test.png');
      expect(Buffer.isBuffer(uploadCall.contents)).to.be.true;
      expect(uploadCall.mode).to.deep.equal({ '.tag': 'add' });

      // Check shared link creation
      expect(mockDropboxClient.sharingCreateSharedLink.calledWith({
        path: '/Dillinger/_images/test.png'
      })).to.be.true;

      // Check response includes &raw=1
      expect(res.json.calledOnce).to.be.true;
      const response = res.json.args[0][0];
      expect(response.data.url).to.include('&raw=1');
    });

    it('should handle "link already exists" error gracefully', async function() {
      const mockUploadResponse = { result: {} };
      mockDropboxClient.filesUpload.resolves(mockUploadResponse);

      const linkError = new Error('Shared link already exists');
      linkError.error = {
        error_summary: 'shared_link_already_exists/...'
      };
      mockDropboxClient.sharingCreateSharedLink.rejects(linkError);

      const mockListResponse = {
        result: {
          links: [{
            url: 'https://www.dropbox.com/s/existing/test.png?dl=0'
          }]
        }
      };
      mockDropboxClient.sharingListSharedLinks.resolves(mockListResponse);

      await Dropbox.saveImageToDropbox(req, res);

      // Should call sharingListSharedLinks to get existing link
      expect(mockDropboxClient.sharingListSharedLinks.calledWith({
        path: '/Dillinger/_images/test.png'
      })).to.be.true;

      // Should return existing link with &raw=1
      expect(res.json.calledOnce).to.be.true;
      const response = res.json.args[0][0];
      expect(response.data.url).to.include('&raw=1');
    });

    it('should handle upload errors', async function() {
      const error = new Error('Upload failed');
      error.status = 507;
      mockDropboxClient.filesUpload.rejects(error);

      await Dropbox.saveImageToDropbox(req, res);

      expect(res.status.calledWith(507)).to.be.true;
      expect(res.json.called).to.be.true;
    });

    it('should convert base64 to Buffer correctly', async function() {
      const mockUploadResponse = { result: {} };
      const mockLinkResponse = { result: { url: 'http://example.com' } };
      mockDropboxClient.filesUpload.resolves(mockUploadResponse);
      mockDropboxClient.sharingCreateSharedLink.resolves(mockLinkResponse);

      await Dropbox.saveImageToDropbox(req, res);

      const uploadCall = mockDropboxClient.filesUpload.args[0][0];
      const buffer = uploadCall.contents;

      // Verify it's a Buffer and has correct length for the test image
      expect(Buffer.isBuffer(buffer)).to.be.true;
      expect(buffer.length).to.be.greaterThan(0);
    });
  });

  describe('Error Handling', function() {
    it('should log errors with console.error', async function() {
      const consoleErrorStub = sinon.stub(console, 'error');
      const error = new Error('Test error');
      mockDropboxClient.usersGetCurrentAccount.rejects(error);

      const cb = sinon.spy();
      await Dropbox.getAccountInfo('test_token', cb);

      expect(consoleErrorStub.calledWith('Error getting account info:', error)).to.be.true;
      consoleErrorStub.restore();
    });
  });

  describe('Response Wrapping', function() {
    it('should handle v10 response format with .result property', async function() {
      // This test verifies that all methods properly unwrap the v10 response format
      const methods = [
        {
          name: 'usersGetCurrentAccount',
          method: 'getAccountInfo',
          mockData: { account_id: '123' }
        }
      ];

      for (const test of methods) {
        const mockResponse = { result: test.mockData };
        mockDropboxClient[test.name].resolves(mockResponse);

        const cb = sinon.spy();
        await Dropbox[test.method]('test_token', cb);

        // Verify the unwrapped data was passed to callback
        expect(cb.calledWith(null, test.mockData)).to.be.true;
      }
    });
  });
});
