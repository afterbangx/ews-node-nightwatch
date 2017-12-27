const path = require('path');

module.exports = {
    fetchEmails(emailaddress, pw, timeout) {
        console.log('fetching emails...');
        const spawnSync = require('child_process').spawnSync;        
        const projectPath = path.join(__dirname, '..', '..', '/ews-fetch/ews-fetch.csproj');
        
        const result = spawnSync('dotnet', ['run', '-p', projectPath, emailaddress, pw, timeout]);   
        
        if(result.output[1]) {
            console.log('stdout: ', result.output[1].toString());
        }

        if(result.output[2]) {
            console.log('stderr: ', result.output[2].toString());
        }

        if(result.status !== 0) {
            return false;
        }

        return true;
    }
}