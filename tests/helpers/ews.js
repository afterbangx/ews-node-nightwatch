const ews = require('ews-javascript-api');
const testmailbox = 'test@test.com';

let message = {
    subject: '',
    body: '',
    attachments: []
};

deleteItems = (service, emails) => {    
    emails.forEach(email => {
        ews.Item.Bind(service, email.Id).then((item) => {
            item.Delete(ews.DeleteMode.MoveToDeletedItems);
            console.log('message deleted...');
        });        
    });
},

module.exports = {

    fetchEmails: (emailaddress, pw, timeout) => {
        const RETRY_INTERVAL = 10;
        const MAX_RETRIES = timeout / RETRY_INTERVAL;

        let service = new ews.ExchangeService();
        service.Url = new ews.Uri('https://outlook.office365.com/EWS/Exchange.asmx');
        service.Credentials = new ews.WebCredentials(emailaddress, pw);
        
        let retryAttempts = 0;

        console.log('searching for emails...');
        let fetchInterval = setInterval(() => { findEmails() }, RETRY_INTERVAL * 1000);

        findEmails = () => {           
            const sharedMailbox = new ews.Mailbox(testmailbox);
            const folderId = new ews.FolderId(ews.WellKnownFolderName.Inbox, sharedMailbox);

            const filter = new ews.SearchFilter.IsEqualTo(ews.EmailMessageSchema.IsRead, false);
            const view = new ews.ItemView(1);

            service.FindItems(folderId, filter, view).then((result) => {
                const items = result;

                if (items.TotalCount < 1) {
                    retryAttempts++;

                    if(retryAttempts === MAX_RETRIES) {
                        stopInterval();
                    }

                }  else {
                    console.log('message found...');
                    stopInterval();

                    const propertySet = new ews.PropertySet(ews.BasePropertySet.FirstClassProperties, ews.EmailMessageSchema.TextBody);
                    service.LoadPropertiesForItems(items.Items, propertySet).then((result) => {
                        // console.log(items.Items[0].Subject);
                        // console.log(items.Items[0].TextBody.Text);
                        // console.log(items.Items[0].Attachments.Items);

                        message.subject = items.Items[0].Subject;
                        message.body = items.Items[0].TextBody.Text;

                        if(items.Items[0].HasAttachments) {
                            message.attachments = items.Items[0].Attachments.Items;
                        }

                        deleteItems(service, items.Items);
                    });                  
                }      
            });
        }

        stopInterval = () => {
            console.log('stopping search...');
            clearInterval(fetchInterval);
        }        
    },

    getMessage: () => {
        return message;
    }
}