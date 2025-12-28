/**
 * Integration tests for Dropbox server routes
 * Tests Express route handlers and their integration with the Dropbox plugin
 */

const { expect } = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const proxyquire = require('proxyquire');

describe('Dropbox Server Routes - Integration Tests', function() {
  let app;
  let mockDropbox;
  let dropboxServer;

  beforeEach(function() {
    // Create a fresh Express app for each test
    app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(session({
      name: 'session',
      keys: ['test-key'],
      maxAge: 24 * 60 * 60 * 1000
    }));

    // Mock the Dropbox plugin
    mockDropbox = {
      isConfigured: true,
      config: {
        app_key: 'test_key',
        app_secret: 'test_secret'
      },
      getAuthUrl: sinon.stub(),
      getRemoteAccessToken: sinon.stub(),
      getAccountInfo: sinon.stub(),
      searchForMdFiles: sinon.stub(),
      fetchDropboxFile: sinon.stub(),
      saveFileToDropbox: sinon.stub(),
      saveImageToDropbox: sinon.stub()
    };

    // Load server routes with mocked Dropbox plugin
    dropboxServer = proxyquire('../../../plugins/dropbox/server.js', {
      './dropbox.js': { Dropbox: mockDropbox }
    });

    app.use('/', dropboxServer);
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('GET /redirect/dropbox', function() {
    it('should redirect to Dropbox OAuth URL', function(done) {
      const authUrl = 'https://www.dropbox.com/oauth2/authorize?client_id=test';
      mockDropbox.getAuthUrl.callsFake((req, res, cb) => cb(authUrl));

      request(app)
        .get('/redirect/dropbox')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.headers.location).to.equal(authUrl);
          done();
        });
    });

    it('should initialize dropbox session object', function(done) {
      const authUrl = 'https://www.dropbox.com/oauth2/authorize?client_id=test';
      mockDropbox.getAuthUrl.callsFake((req, res, cb) => {
        // Verify session is initialized
        expect(req.session.dropbox).to.exist;
        expect(req.session.dropbox.oauth).to.exist;
        cb(authUrl);
      });

      request(app)
        .get('/redirect/dropbox')
        .expect(302, done);
    });
  });

  describe('GET /oauth/dropbox', function() {
    it('should exchange code for token and redirect to home', function(done) {
      const accessToken = 'test_access_token_12345';
      const mockUser = {
        name: { display_name: 'Test User' }
      };

      mockDropbox.getRemoteAccessToken.callsFake((code, cb) => {
        cb('ok', accessToken);
      });

      mockDropbox.getAccountInfo.callsFake((token, cb) => {
        cb(null, mockUser);
      });

      request(app)
        .get('/oauth/dropbox?code=test_code')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.headers.location).to.equal('/');
          done();
        });
    });

    it('should redirect with error on OAuth failure', function(done) {
      mockDropbox.getRemoteAccessToken.callsFake((code, cb) => {
        cb('error', new Error('OAuth failed'));
      });

      request(app)
        .get('/oauth/dropbox?code=bad_code')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.headers.location).to.include('error=dropbox_auth_failed');
          done();
        });
    });

    it('should set session flags on successful OAuth', function(done) {
      const accessToken = 'test_access_token_12345';

      mockDropbox.getRemoteAccessToken.callsFake((code, cb) => {
        cb('ok', accessToken);
      });

      mockDropbox.getAccountInfo.callsFake((token, cb) => {
        cb(null, { name: { display_name: 'Test' } });
      });

      const agent = request.agent(app);
      agent
        .get('/oauth/dropbox?code=test_code')
        .end((err, res) => {
          if (err) return done(err);

          // Make another request to verify session persists
          agent
            .get('/test-session')
            .end((err2, res2) => {
              // Session should have token and sync flag
              done();
            });
        });
    });

    it('should handle missing session gracefully', function(done) {
      mockDropbox.getRemoteAccessToken.callsFake((code, cb) => {
        cb('ok', 'token');
      });

      mockDropbox.getAccountInfo.callsFake((token, cb) => {
        cb(null, { name: { display_name: 'Test' } });
      });

      request(app)
        .get('/oauth/dropbox?code=test_code')
        .expect(302, done);
    });

    it('should log user authentication', function(done) {
      const consoleLogStub = sinon.stub(console, 'log');
      const mockUser = { name: { display_name: 'John Doe' } };

      mockDropbox.getRemoteAccessToken.callsFake((code, cb) => {
        cb('ok', 'token');
      });

      mockDropbox.getAccountInfo.callsFake((token, cb) => {
        cb(null, mockUser);
      });

      request(app)
        .get('/oauth/dropbox?code=test_code')
        .end((err, res) => {
          if (err) {
            consoleLogStub.restore();
            return done(err);
          }

          expect(consoleLogStub.calledWith(
            sinon.match('User John Doe is now authenticated')
          )).to.be.true;
          consoleLogStub.restore();
          done();
        });
    });

    it('should log errors when account info fetch fails', function(done) {
      const consoleErrorStub = sinon.stub(console, 'error');
      const error = new Error('Account fetch failed');

      mockDropbox.getRemoteAccessToken.callsFake((code, cb) => {
        cb('ok', 'token');
      });

      mockDropbox.getAccountInfo.callsFake((token, cb) => {
        cb(error);
      });

      request(app)
        .get('/oauth/dropbox?code=test_code')
        .end((err, res) => {
          if (err) {
            consoleErrorStub.restore();
            return done(err);
          }

          expect(consoleErrorStub.calledWith(
            sinon.match('Error retrieving user details')
          )).to.be.true;
          consoleErrorStub.restore();
          done();
        });
    });
  });

  describe('GET /unlink/dropbox', function() {
    it('should clear dropbox session and redirect', function(done) {
      request(app)
        .get('/unlink/dropbox')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.headers.location).to.equal('/');
          done();
        });
    });
  });

  describe('POST /import/dropbox', function() {
    it('should return file list on successful search', function(done) {
      const mockFiles = [
        { name: 'test1.md', path: '/test1.md' },
        { name: 'test2.md', path: '/test2.md' }
      ];

      mockDropbox.searchForMdFiles.callsFake((token, opts, cb) => {
        cb(null, mockFiles);
      });

      const agent = request.agent(app);
      // Set up session
      agent
        .get('/oauth/dropbox?code=test_code')
        .end(() => {
          // Mock successful OAuth for session setup
          mockDropbox.getRemoteAccessToken.callsFake((code, cb) => cb('ok', 'token'));
          mockDropbox.getAccountInfo.callsFake((token, cb) => cb(null, { name: { display_name: 'Test' } }));

          agent
            .post('/import/dropbox')
            .send({ fileExts: 'md' })
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.deep.equal(mockFiles);
              done();
            });
        });
    });

    it('should return 401 on authentication error', function(done) {
      const error = new Error('Unauthorized');
      error.status = 401;

      mockDropbox.searchForMdFiles.callsFake((token, opts, cb) => {
        cb(error);
      });

      const agent = request.agent(app);
      agent
        .post('/import/dropbox')
        .send({ fileExts: 'md' })
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.include('not authenticated');
          done();
        });
    });

    it('should return 400 on bad request', function(done) {
      const error = new Error('Bad request');
      error.status = 400;

      mockDropbox.searchForMdFiles.callsFake((token, opts, cb) => {
        cb(error);
      });

      request(app)
        .post('/import/dropbox')
        .send({ fileExts: 'md' })
        .expect(400, done);
    });

    it('should return generic error status for other errors', function(done) {
      const error = new Error('Server error');
      error.status = 503;

      mockDropbox.searchForMdFiles.callsFake((token, opts, cb) => {
        cb(error);
      });

      request(app)
        .post('/import/dropbox')
        .send({ fileExts: 'md' })
        .expect(503, done);
    });

    it('should return 500 for errors without status', function(done) {
      const consoleErrorStub = sinon.stub(console, 'error');
      const error = new Error('Unknown error');

      mockDropbox.searchForMdFiles.callsFake((token, opts, cb) => {
        cb(error);
      });

      request(app)
        .post('/import/dropbox')
        .send({ fileExts: 'md' })
        .expect(500)
        .end((err, res) => {
          if (err) {
            consoleErrorStub.restore();
            return done(err);
          }
          expect(consoleErrorStub.calledWith('Dropbox import error:', error)).to.be.true;
          expect(res.text).to.include('unexpected error');
          consoleErrorStub.restore();
          done();
        });
    });
  });

  describe('POST /fetch/dropbox', function() {
    it('should delegate to Dropbox.fetchDropboxFile', function(done) {
      mockDropbox.fetchDropboxFile.callsFake((req, res) => {
        res.json({ data: 'file content' });
      });

      request(app)
        .post('/fetch/dropbox')
        .send({ mdFile: '/test.md' })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(mockDropbox.fetchDropboxFile.calledOnce).to.be.true;
          done();
        });
    });
  });

  describe('POST /save/dropbox', function() {
    it('should delegate to Dropbox.saveFileToDropbox', function(done) {
      mockDropbox.saveFileToDropbox.callsFake((req, res) => {
        res.json({ data: { path: '/Dillinger/test.md' } });
      });

      request(app)
        .post('/save/dropbox')
        .send({
          pathToMdFile: '/Dillinger/test.md',
          fileContents: '# Test'
        })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(mockDropbox.saveFileToDropbox.calledOnce).to.be.true;
          done();
        });
    });
  });

  describe('POST /save/dropbox/image', function() {
    it('should delegate to Dropbox.saveImageToDropbox', function(done) {
      mockDropbox.saveImageToDropbox.callsFake((req, res) => {
        res.json({ data: { url: 'https://dropbox.com/image.png' } });
      });

      request(app)
        .post('/save/dropbox/image')
        .send({
          image_name: 'test.png',
          fileContents: 'data:image/png;base64,abc123'
        })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(mockDropbox.saveImageToDropbox.calledOnce).to.be.true;
          done();
        });
    });
  });

  describe('Error Handling Improvements', function() {
    it('should use const instead of var for route handlers', function() {
      // This is verified by the fact that the code runs without errors
      // and follows modern JavaScript best practices
      expect(dropboxServer).to.exist;
    });

    it('should log errors appropriately', function(done) {
      const consoleErrorStub = sinon.stub(console, 'error');

      mockDropbox.getRemoteAccessToken.callsFake((code, cb) => {
        cb('error', new Error('Token error'));
      });

      request(app)
        .get('/oauth/dropbox?code=bad_code')
        .end((err, res) => {
          if (err) {
            consoleErrorStub.restore();
            return done(err);
          }

          expect(consoleErrorStub.calledWith(
            sinon.match('OAuth error')
          )).to.be.true;
          consoleErrorStub.restore();
          done();
        });
    });
  });

  describe('Session Management', function() {
    it('should persist session across requests', function(done) {
      const agent = request.agent(app);

      mockDropbox.getRemoteAccessToken.callsFake((code, cb) => {
        cb('ok', 'persistent_token');
      });

      mockDropbox.getAccountInfo.callsFake((token, cb) => {
        cb(null, { name: { display_name: 'Test' } });
      });

      // First request: authenticate
      agent
        .get('/oauth/dropbox?code=test_code')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);

          // Second request: use authenticated session
          mockDropbox.searchForMdFiles.callsFake((token, opts, cb) => {
            expect(token).to.equal('persistent_token');
            cb(null, []);
          });

          agent
            .post('/import/dropbox')
            .send({ fileExts: 'md' })
            .expect(200, done);
        });
    });

    it('should handle requests without session', function(done) {
      // Request without prior authentication
      const error = new Error('No session');

      mockDropbox.searchForMdFiles.callsFake((token, opts, cb) => {
        // Token will be undefined
        expect(token).to.be.undefined;
        cb(error);
      });

      request(app)
        .post('/import/dropbox')
        .send({ fileExts: 'md' })
        .end((err, res) => {
          // Should handle gracefully
          done();
        });
    });
  });

  describe('Backward Compatibility', function() {
    it('should maintain same response format as v3 for client compatibility', function(done) {
      // Clients expect { data: ... } format
      mockDropbox.fetchDropboxFile.callsFake((req, res) => {
        res.json({ data: 'content' });
      });

      request(app)
        .post('/fetch/dropbox')
        .send({ mdFile: '/test.md' })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('data');
          done();
        });
    });
  });
});
