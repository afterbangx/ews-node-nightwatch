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

        //look for email
        let messageFound = false;
        browser.perform(() => {
            ews.fetchEmails(ews_user, ews_pw, timeout);
        })
        .perform(() => {            
            let message = ews.getMessage();
            
            if(message.subject) {
                browser.verify.ok(message.subject.includes(expectedSubject), 
                    `Expected email subject to contain: <${expectedSubject}>`); 
    
                browser.verify.ok(message.body.includes(expectedTestMessage),
                    `Expected email body to include: <${expectedTestMessage}>`);
            } else {
                browser.assert.fail('No message found.');
            }           
            
        })
    }
}