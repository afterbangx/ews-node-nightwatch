# ews-node-nightwatch
An example of how to fetch emails from Exchange/Office365 using nightwatchjs and ews-javascript-api.

This example uses a shared mailbox that I have access too. You could easily do the same with any mailbox with a slight modification.

To run the test you will need to set the environment variables first and change the value of `testmailbox` in `helpers\ews.js`

```
set EWS_USER=someuser@test.com
set EWS_PW=password
```
