const assert = require('assert');
const axios = require('axios')

const ecovacsDeebot = require('../index.js');
const tools = require('../library/tools.js');
const constants = require('../library/ecovacsConstants');

describe('API', function () {
  describe('storing variables', function () {
    it('should connect to every continent API', async function () {
      const continents = [];

      await Promise.all(
          Object.values(ecovacsDeebot.countries).map(async ({continent}) => {
            if (continents.includes(continent)) return;
            continents.push(continent);

            try {
              await axios.get(constants.PORTAL_URL_FORMAT.format({continent}));
            } catch (err) {
              if (err.code === 'ENOTFOUND') {
                throw Error(err);
              }
              assert.strictEqual(err.response.status, 404);
            }
          })
      );
    });

    it('should store the country and device id parameter in a meta variable', function () {
      const device_id = "abcdefghijklmnopqrestuvwyz";
      const country = "nl";
      const api = new ecovacsDeebot.EcoVacsAPI(device_id, country, "eu");
      assert.strictEqual(api.meta.deviceId, device_id);
      assert.strictEqual(api.meta.country, country);
    });

    it('should store the first 8 characters of the device id as the resource id', function () {
      const api = new ecovacsDeebot.EcoVacsAPI("abcdefghijklmnopqrestuvwyz", "nl", "eu");
      assert.strictEqual(api.resource, "abcdefgh");
    });

    it('should store the country provided', function () {
      const country = "nl";
      const api = new ecovacsDeebot.EcoVacsAPI("abcdefghijklmnopqrestuvwyz", country, "eu");
      assert.ok(api.country);
      assert.strictEqual(api.country, country.toUpperCase());
    });

    it('should store the continent provided', function () {
      const continent = "eu";
      const api = new ecovacsDeebot.EcoVacsAPI("abcdefghijklmnopqrestuvwyz", "nl", continent);
      assert.ok(api.continent);
      assert.strictEqual(api.continent, continent);
    });

    it('should provide a version number', function () {
      const continent = "eu";
      const api = new ecovacsDeebot.EcoVacsAPI("abcdefghijklmnopqrestuvwyz", "nl", continent);
      assert.ok(api.getVersion());
      assert.ok(ecovacsDeebot.EcoVacsAPI.version());
      assert.strictEqual(api.getVersion(), ecovacsDeebot.EcoVacsAPI.version());
    });
  });

  describe('rsa key file', function () {
    const fs = require('fs')
      , crypto = require('crypto');

    it('should exist as a file', function (done) {
      fs.stat("key.pem", done);
    });

    it('should be a valid key file', function () {
      assert.doesNotThrow(() => {
        const encrypted = crypto.publicEncrypt({
          key: fs.readFileSync("key.pem", "utf8"),
          padding: crypto.constants.RSA_PKCS1_PADDING
        }, new Buffer("unencrypted")).toString('base64');
      });
    });
  });
});

describe('API tools', function () {
  describe('#isObject', function () {
    it('should check if a value is truly an object', function () {
      assert.strictEqual(tools.isObject(null), false);
      assert.strictEqual(tools.isObject("test"), false);
      assert.strictEqual(tools.isObject(String("test")), false);
      assert.strictEqual(tools.isObject(100), false);
      assert.strictEqual(tools.isObject(100.5), false);
      assert.strictEqual(tools.isObject(true), false);
      assert.strictEqual(tools.isObject(undefined), false);
      assert.strictEqual(tools.isObject(Symbol()), false);
      assert.strictEqual(tools.isObject({}), true);
      assert.strictEqual(tools.isObject({key: "value"}), true);
      assert.strictEqual(tools.isObject(JSON.parse('{"key": "value"}')), true);
      assert.strictEqual(tools.isObject(() => {
      }), true);
      assert.strictEqual(tools.isObject(new Object()), true);
      assert.strictEqual(tools.isObject(new Date()), true);
    });
  });

  describe('#string.format', function () {
    it('should add a format method to the prototype of String', function () {
      assert.ok("abcdefghijklmnopqrestuvwyz".format);
    });

    it('should replace key identifiers with provided values', function () {
      assert.strictEqual("{first} {second}".format({first: "Hello", second: "world"}), "Hello world");
      assert.strictEqual("{first} world".format({first: "Hello"}), "Hello world");
    });

    it('should not replace key identifiers when not provided as values', function () {
      assert.strictEqual("{first} {second}".format({foo: "Hello", bar: "world"}), "{first} {second}");
      assert.strictEqual("{first} world".format({foo: "Hello", bar: "world"}), "{first} world");
      assert.strictEqual("{first} {second}".format({}), "{first} {second}");
    });
  });

  describe('countries', function () {
    it('should export a countries object', function () {
      assert.ok(ecovacsDeebot.countries);
    });
  });
});
