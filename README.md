# ews-node-nightwatch
An example of how to fetch emails from Exchange/Office365 using nightwatchjs and a node child process.

This example uses a shared mailbox that I have access too. You could easily do the same with any mailbox with a slight modification.

To run the test you will need to set the environment variables first and change the value of `TEST_MAILBOX` in `Program.cs`

```
set EWS_USER=someuser@test.com
set EWS_PW=password
```

Then you can just run `npm test` and the console app should start running. Note: `spawnSync` doesn't return any output until the process is done executing. The console app will grab the first unread email it sees so it's a good idea to make sure the mailbox is clean before running the test. 
