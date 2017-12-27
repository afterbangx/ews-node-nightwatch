using System;
using Microsoft.Exchange.WebServices.Data;
using System.Collections.ObjectModel;
using System.IO;
using System.Threading;

namespace ews_fetch
{
    class Program
    {
        static int Main(string[] args)
        {
            string userEmail = "";
            string pw = "";
            int TIMEOUT_IN_SECONDS = 0;

            //change this to a valid emailaddress or shared mailbox
            const string TEST_MAILBOX = "test@test.com";

            //make sure input is valid before continuing
            try
            {
                userEmail = args[0];
                pw = args[1];
                TIMEOUT_IN_SECONDS = Int32.Parse(args[2]);
            }
            catch(IndexOutOfRangeException ex)
            {
                Console.WriteLine("\r\n*** An argument is missing. Please pass in an email address, password, and timeout (in seconds).");
                Console.WriteLine("*** Example: dotnet run -p path/to/ews-fetch.csproj email@somedomain.com password 120\r\n");
                Console.WriteLine(ex.Message);
                return 1;
            }            

            const int RETRY_INTERVAL = 10;
            int MAX_RETRIES = TIMEOUT_IN_SECONDS / RETRY_INTERVAL;          

            ExchangeService service = new ExchangeService();            
            service.Url = new Uri("https://outlook.office365.com/EWS/Exchange.asmx");
            service.Credentials = new WebCredentials(userEmail, pw);             

            FindItemsResults<Item> items;
            int retryAttempts = 0;
            bool searchFailed = false;

            do
            {
                FolderId redteamtest = new FolderId(WellKnownFolderName.Inbox, TEST_MAILBOX);
                SearchFilter filter = new SearchFilter.IsEqualTo(EmailMessageSchema.IsRead, false);
                ItemView view = new ItemView(1);

                Console.WriteLine("Searching for unread emails...");
                items = service.FindItems(redteamtest, filter, view);

                if(items.Equals(null) || items.TotalCount < 1)
                {
                    retryAttempts++;

                    if (retryAttempts == MAX_RETRIES)
                    {
                        searchFailed = true;
                        break;
                    }

                    Thread.Sleep(RETRY_INTERVAL * 1000);
                }              

            } while (items.Equals(null) || items.TotalCount < 1);

            if(searchFailed)
            {
                Console.WriteLine("Could not find unread emails in allotted amount of time.");
                return 1;
            }
            else
            {
                Console.WriteLine("Message found...");
                service.LoadPropertiesForItems(items, PropertySet.FirstClassProperties);

                //write file to disk so we can use it in nightwatch test
                ExportItem(service, items.Items[0]);

                //delete email
                DeleteItems(service, items.Items);
            }

            return 0;
        }        

        private static void ExportItem(ExchangeService service, Item item)
        {
            PropertySet props = new PropertySet(EmailMessageSchema.MimeContent);
            EmailMessage message = EmailMessage.Bind(service, item.Id, props);

            string filename = $"{Directory.GetCurrentDirectory()}\\export\\email.eml";
            Directory.CreateDirectory(Path.GetDirectoryName(filename));

            Console.WriteLine("Writing message to disk at {0}", filename);
            using (FileStream fs = new FileStream(filename, FileMode.Create, FileAccess.Write))
            {
                fs.Write(message.MimeContent.Content, 0, message.MimeContent.Content.Length);
            }
        }

        private static void DeleteItems(ExchangeService service, Collection<Item> emails)
        {
            foreach(var email in emails)
            {
                Item item = Item.Bind(service, email.Id);
                item.Delete(DeleteMode.MoveToDeletedItems);
                Console.WriteLine("Message moved to deleted items folder.");
            }
        }        
    }
}
