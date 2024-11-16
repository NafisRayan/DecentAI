const wink = require('wink-nlp');
const model = require('wink-eng-lite-web-model');
const nlp = wink(model);

// Load trained model
const modelArtifacts = require('./model_artifacts.json');
const vocabulary = new Map(modelArtifacts.vocabulary);
const sentimentScores = modelArtifacts.sentimentScores;

// Convert text to feature vector
function textToVector(text, vocabulary) {
    const vector = new Array(vocabulary.size).fill(0);
    const tokens = nlp.readDoc(text).tokens().out();
    tokens.forEach(token => {
        const index = vocabulary.get(token.toLowerCase());
        if (index !== undefined) {
            vector[index] = 1;
        }
    });
    return vector;
}

// Predict sentiment
function predictSentiment(text, vocabulary, sentimentScores) {
    const vector = textToVector(text, vocabulary);
    const scores = {};
    
    // Initialize scores for all sentiments
    Object.keys(sentimentScores).forEach(sentiment => {
        scores[sentiment] = 0;
    });
    
    Object.keys(scores).forEach(sentiment => {
        scores[sentiment] = vector.reduce((sum, value, index) => {
            return sum + (value * sentimentScores[sentiment][index]);
        }, 0);
    });
    
    return Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
}

// Command line interface
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

function analyzeSentiment() {
    readline.question('Enter a sentence to analyze (or type "exit" to quit): ', text => {
        if (text.toLowerCase() === 'exit') {
            readline.close();
            return;
        }
        
        const sentiment = predictSentiment(text, vocabulary, sentimentScores);
        console.log(`Sentiment: ${sentiment}`);
        analyzeSentiment();
    });
}

console.log('Sentiment Analysis Model Ready!');
analyzeSentiment(); 