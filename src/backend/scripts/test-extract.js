const { extractFoodSearchTerms } = require('../graphql');

const messages = [
    'ở đây có món gỏi gà măng cục không',
    'hiển thị gỏi bò bóp thấu',
    'gỏi gà măng cục',
    'gỏi bò bóp thấu'
];

messages.forEach(msg => {
    console.log(`Input: "${msg}"`);
    console.log('Extracted terms:', extractFoodSearchTerms(msg));
    console.log('---');
});
