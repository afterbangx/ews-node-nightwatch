module.exports = function() {
    const path = require('path');
    const fs = require('fs');
    const emlformat = require('eml-format');
    const emlPath = path.join(__dirname, '..', '..', '/export/email.eml');

    const eml = fs.readFileSync(emlPath, 'utf-8');
    let message = {};
    
    emlformat.parse(eml, function(error, data) {
        if(error) return console.log(error);
    
        message = {
            subject: data.headers.Subject,
            body: typeof data.body === 'string' ? data.body : data.body[0].part.body
        };    
    });
    
    return message;
}