const sentences = require('./words.json').sentences;

export function generateRandomParagraph() {
  const randomIndex = Math.floor(Math.random() * sentences.length);
  return sentences[randomIndex];
}
