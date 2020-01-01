const EventEmitter = require('events');

class EcovacsIOTMQ extends EventEmitter {
    constructor(bot, user, hostname, resource, secret, continent, vacuum, server_address, server_port) {
        super();
        this.mqtt = require('mqtt');

        this.bot = bot;
        this.user = user;
        this.hostname = hostname;
        this.resource = resource;
        this.secret = secret;
        this.continent = continent;
        this.vacuum = vacuum;

        this.iter = 1;

        if (!server_address) {
            this.server_address = 'mq-{}.ecouser.net'.format({
                continent: continent
            });
        } else {
            this.server_address = server_address;
        }

        if (!server_port) {
            this.server_port = 8883
        } else {
            this.server_port = server_port;
        }

        this.scheduler = sched.scheduler(time.time, time.sleep);
        this.scheduler_thread = threading.scheduler_thread(self.scheduler.run, true, "mqtt_schedule_thread");

        this._client_id = this.user + '@' + this.hostname.split(".")[0] + '/' + this.resource;
        this.mqtt.password.set(this.user + '@' + this.domain, secret)
    }

    connect_and_wait_until_ready() {
        envLog("[EcovacsIOTMQ] Connecting as %s to %s", this.user + '@' + this.hostname, this.server_address + ":" + this.server_port);
        // TODO: This is pretty insecure and accepts any cert
        this.ClientMQTT.connect(this.hostname, this.server_port, {
            rejectUnauthorized: false
        });

        this.ClientMQTT.on('connect', () => {
            client.subscribe('presence', function (err) {
                if (!err) {
                    client.publish('presence', 'Hello mqtt')
                }
            })
        });

        this.ClientMQTT.on('message', (topic, message) => {
            // message is Buffer
            console.log(message.toString())
            client.end()
        });

        this.connect(this.hostname, this.port);
        this.loop_start();
        this.wait_until_ready();
    }

    wait_until_ready() {
        this.ready_flag.wait();
    }

    subscribe_to_ctls(self, func) {
        this.ctl_subscribers.append(func)
    }

    _disconnect() {
        //disconnect mqtt connection
        this.disconnect();
        //Clear schedule queue
        this.scheduler.empty();
    }

    _run_scheduled_func(self, timer_seconds, timer_func) {
        timer_func();
        this.schedule(timer_seconds, timer_func);
    }

    schedule(self, timer_seconds, timer_func) {
        this.scheduler.enter(timer_seconds, 1, this._run_scheduled_func, (timer_seconds, timer_func));
        if (!this.scheduler_thread.isAlive()) {
            this.scheduler_thread.start();
        }
    }

    on_connect(client, userdata, flags, rc) {
        if (rc !== 0) {
            return;
        }
        this.subscribe('iot/atr/+/' + this.vacuum['did'] + '/' + this.vacuum['class'] + '/' + this.vacuum['resource'] + '/+', 0);
        this.ready_flag.set();
    }

    send_ping() {
        let rc = this._send_simple_command(MQTTPublish.paho.PINGREQ);
        if (rc === MQTTPublish.paho.MQTT_ERR_SUCCESS) {
            return true;
        } else {
            return false;
        }
    }

    send_command(action, recipient) {
        // For handling Clean when action not specified (i.e. CLI)
        if (action.name === "Clean" && !'act' in action.args['clean']) {
            // Inject a start action
            action.args['clean']['act'] = CLEAN_ACTION_TO_ECOVACS['start'];
        }

        let c;
        if (action.is_td_command) {
            c = this._wrap_td_command(action, recipient);
        } else {
            c = this._wrap_command(action, recipient);
        }

        this._handle_ctl_api(action, this.__call_ecovacs_device_api(c, action.api_base_url))
    }

    _wrap_command(self, cmd, recipient) {
        // Remove the td from ctl xml for RestAPI
        let payloadXml = cmd.to_xml();
        payloadXml.attrib.pop("td");

        return {
            'auth': {
                'realm': EcoVacsAPI.REALM,
                'resource': this.resource,
                'token': this.secret,
                'userid': this.user,
                'with': 'users',
            },
            "cmdName": cmd.name,
            "payload": ET.tostring(payloadXml).decode(),

            "payloadType": "x",
            "td": "q",
            "toId": recipient,
            "toRes": this.vacuum['resource'],
            "toType": this.vacuum['class']
        }
    }

    _wrap_td_command(self, cmd, recipient) {
        return {
            'auth': {
                'realm': EcoVacsAPI.REALM,
                'resource': this.resource,
                'token': this.secret,
                'userid': this.user,
                'with': 'users',
            },
            "td": cmd.name,
            "did": recipient,
            "resource": this.vacuum['resource']
        }
    }

    __call_ecovacs_device_api(self, args, base_url = EcoVacsAPI.IOTDEVMANAGERAPI) {
        let params = {};
        params.update(args);

        let url = (EcoVacsAPI.PORTAL_URL_FORMAT + "/" + base_url).format(this.continent);
        //The RestAPI sometimes doesnt provide a response depending on command, reduce timeout to 3 to accomodate and make requests faster
        try {
            //May think about having timeout as an arg that could be provided in the future
            let response = requests.post(url, params, 3);
        } catch (e) {

        }

        let json = response.json();
        if (json['ret'] === 'ok') {
            return json;
        } else if (json['ret'] === 'fail') {
            if ('debug' in json) {
                if (json['debug'] === 'wait for response timed out') {
                    // TODO - Maybe handle timeout for IOT better in the future
                    return {};
                }
            }
        } else
            //TODO - Not sure if we want to raise an error yet, just return empty for now
            return {};
    }

    _handle_ctl_api(self, action, message) {
        let resp = null;
        if (!message === {}) {
            if ('resp' in message) {
                resp = this._ctl_to_dict_api(action, message['resp']);
            } else {
                resp = {
                    'event': action.name.replace("Get", "", 1).replace(/^_+|_+$/g, '').lower().replace('([A-Z]{1})', '_\1'),
                    'data': message
                };
            }
            if (resp != null) {
                for (let s in this.ctl_subscribers) {
                    s(resp);
                }
            }
        }
    }

    _ctl_to_dict_api(self, action, xmlstring) {
        let xml = ET.fromstring(xmlstring);
        let xmlChild = xml.getchildren();
        if (len(xmlChild) > 0) {
            let result = xmlChild[0].attrib.copy();
            //Fix for difference in XMPP vs API response
            //Depending on the report will use the tag and add "report" to fit the mold of ozmo library
            if (xmlChild[0].tag === "clean") {
                result['event'] = "CleanReport";
            } else if (xmlChild[0].tag === "charge") {
                result['event'] = "ChargeState";
            } else if (xmlChild[0].tag === "battery") {
                result['event'] = "BatteryInfo";
            } else { //Default back to replacing Get from the api cmdName
                result['event'] = action.name.replace("Get", "", 1);
            }
        } else {
            let result = xml.attrib.copy();
            result['event'] = action.name.replace("Get", "", 1);
            if ('ret' in result) { //Handle errors as needed
                if (result['ret'] === 'fail') {
                    if (action.name === "Charge") { //So far only seen this with Charge, when already docked
                        result['event'] = "ChargeState";
                    }
                }
            }
            for (let key in result) {
                if (result.hasOwnProperty(key)) {
                    if (!parseInt(result[key])) { //Fix to handle negative int values
                        result[key] = stringcase.snakecase(result[key]);
                    }
                }
            }
            return result;
        }
    }

    _handle_ctl_mqtt(self, client, userdata, message) {
        //_LOGGER.debug("EcoVacs MQTT Received Message on Topic: {} - Message: {}".format(message.topic, str(message.payload.decode("utf-8"))))
        let as_dict = this._ctl_to_dict_mqtt(message.topic, str(message.payload.decode("utf-8")));
        if (as_dict != null) {
            for (let s in this.ctl_subscribers) {
                s(as_dict);
            }
        }
    }

    _ctl_to_dict_mqtt(self, topic, xmlstring) {
        //I haven't seen the need to fall back to data within the topic (like we do with IOT rest call actions), but it is here in case of future need
        let xml = ET.fromstring(xmlstring); //Convert from string to xml (like IOT rest calls), other than this it is similar to XMPP

        //Including changes from jasonarends @ 28da7c2 below
        let result = xml.attrib.copy();

        if (!'td' in result) {
            // This happens for commands with no response data, such as PlaySound
            // Handle response data with no 'td'

            // single element with type and val
            if ('type' in result) {
                // seems to always be LifeSpan type
                result['event'] = "LifeSpan";
            } else {
                // case where there is child element
                if (len(xml) > 0) {
                    if ('clean' in xml[0].tag) {
                        result['event'] = "CleanReport";
                    } else if ('charge' in xml[0].tag) {
                        result['event'] = "ChargeState";
                    } else if ('battery' in xml[0].tag) {
                        result['event'] = "BatteryInfo";
                    } else {
                        return;
                    }
                    result.update(xml[0].attrib);
                } else {
                    // for non-'type' result with no child element, e.g., result of PlaySound
                    return;
                }
            }
        } else {
            // response includes 'td'
            result['event'] = result.pop('td');
            if (xml) {
                result.update(xml[0].attrib);
            }
        }

        for (let key in result) {
            if (result.hasOwnProperty(key)) {
                //Check for RepresentInt to handle negative int values, and ',' for ignoring position updates
                if (!parseInt(result[key]) && !',' in result[key]) {
                    result[key] = stringcase.snakecase(result[key]);
                }
            }
        }
        return result
    }
}

module.exports = EcovacsIOTMQ;