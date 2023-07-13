const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/getDynosQuantity', () => ({
  getDynosQuantity: jest.fn()
}));

let { getDynosQuantity } = require('../src/getDynosQuantity');

describe('GET the root page', function () {

  it('respond OK with HTML and restart button populated from referrer', function (done) {
    getDynosQuantity.mockReset();
    getDynosQuantity.mockResolvedValue("0");

    request(app)
      .get('/')
      .set('Referrer', 'https://some-protoype-name.herokuapp.com/')
      .expect(200, done)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text.includes('This prototype is currently turned off')).toBe(true);
        expect(response.text.includes('Restart prototype')).toBe(true);
        expect(response.text.includes('<form method=\"post\" action=\"/some-protoype-name\">')).toBe(true);
        });
  });

  it('respond OK with HTML and restart button when Heroku URL contains 12-digit string', function (done) {
    getDynosQuantity.mockReset();
    getDynosQuantity.mockResolvedValue("0");

    request(app)
      .get('/')
      .set('Referrer', 'https://some-protoype-name-30936500fe0a.herokuapp.com/')
      .expect(200, done)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text.includes('This prototype is currently turned off')).toBe(true);
        expect(response.text.includes('Restart prototype')).toBe(true);
        expect(response.text.includes('<form method=\"post\" action=\"/some-protoype-name\">')).toBe(true);
      });
  });

  it('respond OK with HTML when no valid referrer passed as header', function (done) {
    getDynosQuantity.mockReset();
    getDynosQuantity.mockResolvedValue("0");

    request(app)
    .get('/')
    .expect(200, done)
    .expect('Content-Type', /html/)
    .expect((response) => {
      expect(response.text.includes('This prototype is currently turned off')).toBe(true);
      expect(response.text.includes('Restart prototype')).toBe(false);
    });
  });

  it('returns informative content when dyno count is 0', function (done) {
    getDynosQuantity.mockReset();
    getDynosQuantity.mockResolvedValue("0");

    request(app)
      .get('/')
      .expect(200, done)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text.includes('This prototype is currently turned off')).toBe(true);
        expect(response.text.includes('This prototype is deployed to Heroku but is turned off.')).toBe(true);
        expect(response.text.includes('This prototype is not currently deployed to Heroku.')).toBe(false);
        expect(response.text.includes('This prototype is turned on but it failed to start up due to an error')).toBe(false);
      }, done);
  });

  it('returns informative content when dyno count is -1 due to error', function (done) {
    getDynosQuantity.mockReset();
    getDynosQuantity.mockResolvedValue("-1");

    request(app)
      .get('/')
      .expect(200, done)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text.includes('This prototype is not deployed')).toBe(true);
        expect(response.text.includes('This name does not match a prototype currently deployed to Heroku.')).toBe(true);
        expect(response.text.includes('This prototype is deployed to Heroku but is turned off.')).toBe(false);
        expect(response.text.includes('This prototype is turned on but it failed to start up due to an error')).toBe(false);
      }, done);
  });

  it('returns informative content when dyno count is greater than 0', function (done) {
    getDynosQuantity.mockReset();
    getDynosQuantity.mockResolvedValue("2");

    request(app)
      .get('/')
      .expect(200, done)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text.includes('This prototype has errors')).toBe(true);
        expect(response.text.includes('This prototype is turned on but it failed to start up due to an error')).toBe(true);
        expect(response.text.includes('This prototype is not currently deployed to Heroku.')).toBe(false);
        expect(response.text.includes('This prototype is deployed to Heroku but is turned off.')).toBe(false);
      }, done);
  });
});
