import { EmailMessageSchema } from 'ews-javascript-api';

const ews = require('ews-javascript-api');
ews.EwsLogging.DebugLogEnabled = false;

const testmailbox = 'test@test.com';

let message = {
    subject: '',
    body: '',
    attachments: []
};

function deleteItem(service, email) {
    return new Promise((resolve, reject) => {
        ews.Item.Bind(service, email.Id).then((item) => {
                item.Delete(ews.DeleteMode.MoveToDeletedItems)
                    .then(() => {
                        resolve();
                    }, err => {
                        reject('deleting message failed...');
                    });                
            });        
        });       
};

function markItemRead(service, email) {
    return new Promise((resolve, reject) => {
        const props = new ews.PropertySet(ews.BasePropertySet.IdOnly, ews.EmailMessageSchema.IsRead);

        ews.EmailMessage.Bind(service, email.Id, props).then((emailmessage) => {
            if(!emailmessage.IsRead) {
                emailmessage.IsRead = true;
                emailmessage.Update(ews.ConflictResolutionMode.AutoResolve)
                    .then(() => {
                        resolve();
                    }, err => {
                        reject('updating message failed...');
                    });
            }
        });
    });
}

module.exports = {

    fetchEmails: (emailaddress, pw, timeout, uniqueID) => {
        return new Promise((resolve, reject) => {
            const RETRY_INTERVAL = 10;
            const MAX_RETRIES = timeout / RETRY_INTERVAL;

            let service = new ews.ExchangeService();
            service.Url = new ews.Uri('https://outlook.office365.com/EWS/Exchange.asmx');
            service.Credentials = new ews.WebCredentials(emailaddress, pw);
        
            let retryAttempts = 0;

            let fetchInterval = setInterval(() => { findEmails() }, RETRY_INTERVAL * 1000);

            findEmails = () => {
                console.log('searching for emails...');
           
                const sharedMailbox = new ews.Mailbox(testmailbox);
                const folderId = new ews.FolderId(ews.WellKnownFolderName.Inbox, sharedMailbox);

                const filter = new ews.SearchFilter.IsEqualTo(ews.EmailMessageSchema.IsRead, false);
                const view = new ews.ItemView();            

                service.FindItems(folderId, filter, view).then((items) => {
                    
                    if (items.TotalCount < 1) {
                        retryAttempts++;

                        if(retryAttempts === MAX_RETRIES) {
                            stopInterval();
                            reject('Message was not found within allotted time.');
                        }

                    }  else {
                        console.log('message found...');
                        stopInterval();

                        const propertySet = new ews.PropertySet(ews.BasePropertySet.FirstClassProperties, ews.EmailMessageSchema.TextBody);
                        service.LoadPropertiesForItems(items.Items, propertySet).then((result) => {
                            // leaving these here for debugging purposes
                            // console.log(items.Items[0].Subject);
                            // console.log(items.Items[0].TextBody.Text);
                            // console.log(items.Items[0].Attachments.Items);

                            let testmail = items.Items
                                .find(item => item.TextBody.Text.includes(uniqueID));

                            message.subject = testmail.Subject;
                            message.body = testmail.TextBody.Text;

                            if(testmail.HasAttachments) {
                                message.attachments = testmail.Attachments.Items;
                            }

                            markItemRead(service, testmail).then(() => {
                                resolve(message);
                            });                                                        
                        });                  
                    }      
                });
            }

            stopInterval = () => {
                console.log('stopping search...');
                clearInterval(fetchInterval);
            }            
        });                
    }
}