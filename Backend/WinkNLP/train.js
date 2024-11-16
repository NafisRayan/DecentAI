const wink = require('wink-nlp');
const model = require('wink-eng-lite-web-model');
const nlp = wink(model);
const fs = require('fs');

// Load training data
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

// Train and save the model
const vocabulary = createVocabulary(trainingData);
const sentimentScores = trainClassifier(trainingData, vocabulary);

// Save model artifacts
const modelArtifacts = {
    vocabulary: Array.from(vocabulary),
    sentimentScores
};

fs.writeFileSync('model_artifacts.json', JSON.stringify(modelArtifacts));
console.log('Model trained and saved successfully!');
