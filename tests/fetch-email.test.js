const ews = require('./helpers/ews');

let ews_user, ews_pw, timeout;

module.exports = {
    before: (browser) => {
        ews_user = browser.globals.EWS_USER;
        ews_pw = browser.globals.EWS_PW;
        timeout = browser.globals.EWS_TIMEOUT_IN_SECONDS;

        //login to app and send email here
    },

    'Test example 1': (browser) => {
        const expectedSubject = 'Some subject';
        const expectedTestMessage = 'Some message that was sent.';

        browser.perform((done) => {
            ews.fetchEmails(ews_user, ews_pw, timeout).then((message) => {
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