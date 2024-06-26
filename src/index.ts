import * as fs from "fs";
import csv from "csv-parser";
import * as readline from "readline";

interface FlashCard {
  english: string;
  chinese: string;
  repetition: number;
  interval: number;
  EF: number; // Easiness Factor
  nextReviewDate: Date;
  performanceRating?: number; // New field to store performance rating
}

const FLASHCARD_DATA_FILE = "flashcards.json";
let flashCards: FlashCard[] = [];

const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Function to apply the SM-2 algorithm to a flashcard
const updateSM2 = (flashCard: FlashCard, performanceRating: number): FlashCard => {
  if (performanceRating < 3) {
    flashCard.repetition = 0;
    flashCard.interval = 1;
  } else {
    flashCard.repetition += 1;

    if (flashCard.repetition === 1) {
      flashCard.interval = 1;
    } else if (flashCard.repetition === 2) {
      flashCard.interval = 6;
    } else {
      flashCard.EF = flashCard.EF + (0.1 - (5 - performanceRating) * (0.08 + (5 - performanceRating) * 0.02));

      if (flashCard.EF < 1.3) {
        flashCard.EF = 1.3; // EF should not go below 1.3
      }

      flashCard.interval = Math.ceil(flashCard.interval * flashCard.EF);
    }
  }

  flashCard.nextReviewDate = new Date(Date.now() + flashCard.interval * 24 * 60 * 60 * 1000);
  flashCard.performanceRating = performanceRating;

  return flashCard;
};

// Function to read the CSV file and convert to flashcards
const readCsvFile = (filePath: string): Promise<FlashCard[]> => {
  const newCards: FlashCard[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv(["english", "chinese"]))
      .on("data", (data) => {
        newCards.push({
          ...data,
          repetition: 0,
          interval: 1,
          EF: 2.5,
          nextReviewDate: new Date(),
        });
      })
      .on("end", () => {
        resolve(newCards);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

// Function to save flashcard data to a file
const saveFlashcardData = (cards: FlashCard[]): void => {
  fs.writeFileSync(FLASHCARD_DATA_FILE, JSON.stringify(cards, null, 2));
};

const mergeFlashcards = (existingCards: FlashCard[], newCards: FlashCard[]): FlashCard[] => {
  const mergedCardsMap = new Map<string, FlashCard>();

  // Add existing flashcards to the map
  existingCards.forEach((card) => {
    mergedCardsMap.set(card.english, card);
  });

  // Add new flashcards to the map, skipping existing ones
  newCards.forEach((card) => {
    if (!mergedCardsMap.has(card.english)) {
      mergedCardsMap.set(card.english, card);
    }
  });

  // Convert map values back to an array
  return Array.from(mergedCardsMap.values());
};

// Function to initialize flashcards
const initializeFlashcards = async (filePath: string): Promise<FlashCard[]> => {
  let flashCards: FlashCard[] = [];

  try {
    // Load existing flashcard data from file if it exists
    if (fs.existsSync(FLASHCARD_DATA_FILE)) {
      const data = fs.readFileSync(FLASHCARD_DATA_FILE, "utf-8");
      flashCards = JSON.parse(data);
    }

    // Read flashcards from CSV and merge them with existing flashcards
    const newCards = await readCsvFile(filePath);
    flashCards = mergeFlashcards(flashCards, newCards);

    // Save merged flashcards to file
    // saveFlashcardData(flashCards);
  } catch (error) {
    console.error("Error initializing flashcards:", error);
  }

  return flashCards;
};

const displayFlashCards = async (rl: readline.Interface, showChineseFirst: boolean): Promise<number[]> => {
  const performanceRatings: number[] = [];
  let remainingCards = flashCards.filter((c) => new Date(c.nextReviewDate) <= new Date());
  let remainingCardsLength = remainingCards.length;

  if (remainingCardsLength === 0) console.log("All cards have been reviewed today! See you tomorrow!");
  remainingCards = shuffleArray(remainingCards);

  for (const card of remainingCards) {
    const contentToDisplay = showChineseFirst ? card.chinese : card.english;
    const answerSide = showChineseFirst ? "English" : "Chinese";
    const prompt = `Type the corresponding ${answerSide} for: ${contentToDisplay}: `;

    const userAnswer = await askQuestion(rl, prompt);
    const performanceRating = evaluatePerformance(card, userAnswer, !showChineseFirst);
    updateSM2(card, performanceRating);

    const correctContent = showChineseFirst ? card.english : card.chinese;
    console.log(userAnswer === correctContent ? "Correct!" : `Wrong! Correct answer: ${correctContent}`);

    performanceRatings.push(performanceRating);
    remainingCardsLength--;
    console.log(`Remaining cards for review today: ${remainingCardsLength}`);
    console.log("-------------------------------------------------");
  }

  return performanceRatings;
};

// Function to handle the flashcard review process
const handleFlashcardReview = async (filePath: string) => {
  try {
    flashCards = await initializeFlashcards(filePath);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Would you like to see Chinese first? (default yes; press Enter to continue): ", async (answer) => {
      const showChineseFirst = answer.trim().toLowerCase() !== "no";
      const performanceRatings = await displayFlashCards(rl, showChineseFirst);
      saveFlashcardData(flashCards); // Save flashcard data after review
      rl.close();
    });
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const askQuestion = async (rl: readline.Interface, question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer); // Trim the answer to remove leading and trailing whitespace
    });
  });
};

const evaluatePerformance = (card: FlashCard, userAnswer: string, showChineseFirst: boolean): number => {
  const correctContent = showChineseFirst ? card.chinese : card.english;
  const isCorrect = userAnswer.trim().toLowerCase() === correctContent.trim().toLowerCase();

  // Assign performance rating based on correctness
  return isCorrect ? 5 : 0; // For simplicity, you can use a binary rating (correct or incorrect)
};

const handleExit = () => {
  console.log("\n-------------------------------------------------");
  console.log("Saving flashcard data before exiting...");
  saveFlashcardData(flashCards);
};

process.on("beforeExit", handleExit);

handleFlashcardReview("vocab.csv");
