"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var csv_parser_1 = __importDefault(require("csv-parser"));
var readline = __importStar(require("readline"));
var FLASHCARD_DATA_FILE = "flashcards.json";
var flashCards = [];
var shuffleArray = function (array) {
    var _a;
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [array[j], array[i]], array[i] = _a[0], array[j] = _a[1];
    }
    return array;
};
// Function to apply the SM-2 algorithm to a flashcard
var updateSM2 = function (flashCard, performanceRating) {
    if (performanceRating < 3) {
        flashCard.repetition = 0;
        flashCard.interval = 1;
    }
    else {
        flashCard.repetition += 1;
        if (flashCard.repetition === 1) {
            flashCard.interval = 1;
        }
        else if (flashCard.repetition === 2) {
            flashCard.interval = 6;
        }
        else {
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
var readCsvFile = function (filePath) {
    var newCards = [];
    return new Promise(function (resolve, reject) {
        fs.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)(["english", "chinese"]))
            .on("data", function (data) {
            newCards.push(__assign(__assign({}, data), { repetition: 0, interval: 1, EF: 2.5, nextReviewDate: new Date() }));
        })
            .on("end", function () {
            resolve(newCards);
        })
            .on("error", function (error) {
            reject(error);
        });
    });
};
// Function to save flashcard data to a file
var saveFlashcardData = function (cards) {
    fs.writeFileSync(FLASHCARD_DATA_FILE, JSON.stringify(cards, null, 2));
};
var mergeFlashcards = function (existingCards, newCards) {
    var mergedCardsMap = new Map();
    // Add existing flashcards to the map
    existingCards.forEach(function (card) {
        mergedCardsMap.set(card.english, card);
    });
    // Add new flashcards to the map, skipping existing ones
    newCards.forEach(function (card) {
        if (!mergedCardsMap.has(card.english)) {
            mergedCardsMap.set(card.english, card);
        }
    });
    // Convert map values back to an array
    return Array.from(mergedCardsMap.values());
};
// Function to initialize flashcards
var initializeFlashcards = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var flashCards, data, newCards, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                flashCards = [];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                // Load existing flashcard data from file if it exists
                if (fs.existsSync(FLASHCARD_DATA_FILE)) {
                    data = fs.readFileSync(FLASHCARD_DATA_FILE, "utf-8");
                    flashCards = JSON.parse(data);
                }
                return [4 /*yield*/, readCsvFile(filePath)];
            case 2:
                newCards = _a.sent();
                flashCards = mergeFlashcards(flashCards, newCards);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error("Error initializing flashcards:", error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/, flashCards];
        }
    });
}); };
var displayFlashCards = function (rl, showChineseFirst) { return __awaiter(void 0, void 0, void 0, function () {
    var performanceRatings, remainingCards, remainingCardsLength, _i, remainingCards_1, card, contentToDisplay, answerSide, prompt_1, userAnswer, performanceRating, correctContent;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                performanceRatings = [];
                remainingCards = flashCards.filter(function (c) { return new Date(c.nextReviewDate) <= new Date(); });
                remainingCardsLength = remainingCards.length;
                if (remainingCardsLength === 0)
                    console.log("All cards have been reviewed today! See you tomorrow!");
                remainingCards = shuffleArray(remainingCards);
                _i = 0, remainingCards_1 = remainingCards;
                _a.label = 1;
            case 1:
                if (!(_i < remainingCards_1.length)) return [3 /*break*/, 4];
                card = remainingCards_1[_i];
                contentToDisplay = showChineseFirst ? card.chinese : card.english;
                answerSide = showChineseFirst ? "English" : "Chinese";
                prompt_1 = "Type the corresponding ".concat(answerSide, " for: ").concat(contentToDisplay, ": ");
                return [4 /*yield*/, askQuestion(rl, prompt_1)];
            case 2:
                userAnswer = _a.sent();
                performanceRating = evaluatePerformance(card, userAnswer, !showChineseFirst);
                updateSM2(card, performanceRating);
                correctContent = showChineseFirst ? card.english : card.chinese;
                console.log(userAnswer === correctContent ? "Correct!" : "Wrong! Correct answer: ".concat(correctContent));
                performanceRatings.push(performanceRating);
                remainingCardsLength--;
                console.log("Remaining cards for review today: ".concat(remainingCardsLength));
                console.log("-------------------------------------------------");
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, performanceRatings];
        }
    });
}); };
// Function to handle the flashcard review process
var handleFlashcardReview = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var rl_1, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, initializeFlashcards(filePath)];
            case 1:
                flashCards = _a.sent();
                rl_1 = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });
                rl_1.question("Would you like to see Chinese first? (default yes; press Enter to continue): ", function (answer) { return __awaiter(void 0, void 0, void 0, function () {
                    var showChineseFirst, performanceRatings;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                showChineseFirst = answer.trim().toLowerCase() !== "no";
                                return [4 /*yield*/, displayFlashCards(rl_1, showChineseFirst)];
                            case 1:
                                performanceRatings = _a.sent();
                                saveFlashcardData(flashCards); // Save flashcard data after review
                                rl_1.close();
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error("An error occurred:", error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var askQuestion = function (rl, question) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve) {
                rl.question(question, function (answer) {
                    resolve(answer); // Trim the answer to remove leading and trailing whitespace
                });
            })];
    });
}); };
var evaluatePerformance = function (card, userAnswer, showChineseFirst) {
    var correctContent = showChineseFirst ? card.chinese : card.english;
    var isCorrect = userAnswer.trim().toLowerCase() === correctContent.trim().toLowerCase();
    // Assign performance rating based on correctness
    return isCorrect ? 5 : 0; // For simplicity, you can use a binary rating (correct or incorrect)
};
var handleExit = function () {
    console.log("\n-------------------------------------------------");
    console.log("Saving flashcard data before exiting...");
    saveFlashcardData(flashCards);
};
process.on("beforeExit", handleExit);
handleFlashcardReview("vocab.csv");
