const ews = require('./helpers/ews');
const faker = require('faker');

let ews_user, ews_pw, timeout;

module.exports = {
    before: (browser) => {
        ews_user = browser.globals.EWS_USER;
        ews_pw = browser.globals.EWS_PW;
        timeout = browser.globals.EWS_TIMEOUT_IN_SECONDS;

        //login to app and send email here
    },

    'Test example 1': (browser) => {
        const uuid = faker.random.uuid();
        const expectedSubject = 'Some subject';
        const expectedTestMessage = `This is a test: ${uuid}`;

        browser.perform((done) => {
            ews.fetchEmails(ews_user, ews_pw, timeout, uuid).then((message) => {
                browser.verify.ok(message.subject.includes(expectedSubject), 
                    `Expected subject to include: <${expectedSubject}>`); 
    
                browser.verify.ok(message.body.includes(expectedTestMessage),
                    `Expected body to include: <${expectedTestMessage}>`);
                
                done();
            }, (err) => {
                browser.assert.fail(err);
                done();
            });
        });
    }
}