const wink = require('wink-nlp');
const model = require('wink-eng-lite-web-model');
const nlp = wink(model);

// Load and prepare training data
const trainingData = require('./twitter_training.json');

// Create vocabulary and encode sentences
function createVocabulary(data) {
    const vocabulary = new Set();
    data.forEach(item => {
        const tokens = nlp.readDoc(item.text).tokens().out();
        tokens.forEach(token => vocabulary.add(token.toLowerCase()));
    });
    return new Map([...vocabulary].map((word, index) => [word, index]));
}

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

// Train simple classifier
function trainClassifier(data, vocabulary) {
    // Initialize sentiment scores with all possible sentiments
    const sentimentScores = {};
    
    // First pass: collect all unique sentiments from the data
    data.forEach(item => {
        const normalizedSentiment = item.sentiment.toLowerCase();
        if (!sentimentScores[normalizedSentiment]) {
            sentimentScores[normalizedSentiment] = Array(vocabulary.size).fill(0.1);
        }
    });

    // Second pass: train the classifier
    data.forEach(item => {
        const vector = textToVector(item.text, vocabulary);
        const normalizedSentiment = item.sentiment.toLowerCase();
        
        vector.forEach((value, index) => {
            if (value === 1) {
                sentimentScores[normalizedSentiment][index] += 1;
            }
        });
    });
    
    return sentimentScores;
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

// Initialize and train the model
const vocabulary = createVocabulary(trainingData);
const sentimentScores = trainClassifier(trainingData, vocabulary);

// Example usage with user input
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
        analyzeSentiment(); // Continue prompting
    });
}

console.log('Sentiment Analysis Model Ready!');
analyzeSentiment();
