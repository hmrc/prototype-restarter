const request = require("supertest");
const app = require("../src/app");

describe('GET the root page', function () {

  it('respond OK with HTML and restart button populated from referrer', function (done) {
    request(app)
      .get('/')
      .set('Referrer', 'https://some-protoype-name.herokuapp.com/')
      .expect(200, done)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text.includes('This prototype is currently turned off')).toBe(true)
        expect(response.text.includes('Restart prototype')).toBe(true)
        expect(response.text.includes('<form method=\"post\" action=\"/some-protoype-name\">')).toBe(true)
        });
  });

  it('respond OK with HTML when no valid referrer passed as header', function (done) {
    request(app)
    .get('/')
    .expect(200, done)
    .expect('Content-Type', /html/)
    .expect((response) => {
      expect(response.text.includes('This prototype is currently turned off')).toBe(true)
      expect(response.text.includes('Restart prototype')).toBe(false)
    });
  });
});
