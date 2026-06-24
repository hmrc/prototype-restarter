import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import request from 'supertest';

const getDynosQuantity = mock.fn(async () => 0);

mock.module('../src/getDynosQuantity.mjs', {
  exports: { getDynosQuantity }
})

const { default: app } = await import("../src/app.mjs");

describe('GET the root page', function (t) {

  it('respond OK with HTML and restart button populated from referrer', async function() {
    const response = await request(app)
      .get('/')
      .set('Referrer', 'https://some-protoype-name.herokuapp.com/')

    assert.match(response.headers["content-type"], /html/);
    assert.strictEqual(response.status, 200);
    assert.ok(response.text.includes('This prototype is currently turned off'));
    assert.ok(response.text.includes('Restart prototype'));
    assert.ok(response.text.includes('<form method=\"post\" action=\"/some-protoype-name\">'));
  });

  it('respond OK with HTML and restart button when Heroku URL contains 12-digit string', async function() {
    const response = await request(app)
      .get('/')
      .set('Referrer', 'https://some-protoype-name-30936500fe0a.herokuapp.com/')

    assert.match(response.headers["content-type"], /html/);
    assert.strictEqual(response.status, 200);
    assert.ok(response.text.includes('This prototype is currently turned off'));
    assert.ok(response.text.includes('Restart prototype'));
    assert.ok(response.text.includes('<form method=\"post\" action=\"/some-protoype-name\">'));
  });

  it('respond OK with HTML and restart button, when Heroku URL contains 12-digit string with no number', async function() {
    const response = await request(app)
      .get('/')
      .set('Referrer', 'https://some-protoype-with-arrangements.herokuapp.com/')

    assert.match(response.headers["content-type"], /html/);
    assert.strictEqual(response.status, 200);
    assert.ok(response.text.includes('This prototype is currently turned off'));
    assert.ok(response.text.includes('Restart prototype'));
    assert.ok(response.text.includes('<form method=\"post\" action=\"/some-protoype-with-arrangements\">'));
  });

  it('respond OK with HTML when no valid referrer passed as header', async function() {
    const response = await request(app).get('/')

    assert.match(response.headers["content-type"], /html/);
    assert.strictEqual(response.status, 200);
    assert.ok(response.text.includes('This prototype is currently turned off'));
    assert.equal(response.text.includes('Restart prototype'), false);
  });

  it('returns informative content when dyno count is 0', async function() {
    const response = await request(app).get('/')

    assert.match(response.headers["content-type"], /html/);
    assert.strictEqual(response.status, 200);
    assert.ok(response.text.includes('This prototype is currently turned off'));
    assert.ok(response.text.includes('This prototype is deployed to Heroku but is turned off.'));
    assert.equal(response.text.includes('This prototype is not currently deployed to Heroku.'), false);
    assert.equal(response.text.includes('This prototype is turned on but it failed to start up due to an error'), false);
  });

  it('returns informative content when dyno count is -1 due to error', async function() {
    getDynosQuantity.mock.mockImplementationOnce(async () => -1);

    const response = await request(app).get('/')

    assert.match(response.headers["content-type"], /html/);
    assert.strictEqual(response.status, 200);
    assert.ok(response.text.includes('This prototype is not deployed'));
    assert.ok(response.text.includes('This name does not match a prototype currently deployed to Heroku.'));
    assert.equal(response.text.includes('This prototype is deployed to Heroku but is turned off.'), false);
    assert.equal(response.text.includes('This prototype is turned on but it failed to start up due to an error'), false);
  });

  it('returns informative content when dyno count is greater than 0', async function() {
    getDynosQuantity.mock.mockImplementationOnce(async () => 1);

    const response = await request(app).get('/')

    assert.match(response.headers["content-type"], /html/);
    assert.strictEqual(response.status, 200);
    assert.ok(response.text.includes('This prototype has errors'));
    assert.ok(response.text.includes('This prototype is turned on but it failed to start up due to an error'));
    assert.equal(response.text.includes('This prototype is not currently deployed to Heroku.'), false);
    assert.equal(response.text.includes('This prototype is deployed to Heroku but is turned off.'), false);
  });
});
