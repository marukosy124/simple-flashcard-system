# Terminal Flash Card System

This is a simple flash card system designed to help you learn English vocabulary. You can use this tool to review flash cards created from a CSV file containing English and Chinese words. The system utilizes the SM-2 algorithm to optimize your learning process by adjusting the review schedule based on your performance.

## Features

- **CSV File Import**: Import a CSV file containing English and Chinese word pairs to create flash cards.
- **Flash Card Review**: Review flash cards one by one and provide your response to each card.
- **Performance Tracking**: The system tracks your performance on each flash card and adjusts the review schedule accordingly.
- **Local Storage**: Your progress and performance data are saved locally so that you can continue from where you left off the next time you start the system.

## Getting Started

1. **Clone the Repository**: Clone this repository to your local machine.

2. **Install Dependencies**: Run `yarn install` to install the required dependencies.

3. **Prepare CSV File**: Create a CSV file containing English and Chinese word pairs. Each row should represent a word pair, with the English word in one column and the corresponding Chinese word in another column.

4. **Start the System**: Build the system using `yarn build`. Run the system using `yarn start`. Follow the on-screen instructions to import the CSV file and start reviewing flash cards.

## Usage

- When prompted, provide the path to the CSV file you want to import.
- Review each flash card displayed on the terminal.
- Enter the English or Chinese word corresponding to the displayed word.
- Rate your performance based on how well you remembered the word.
- Your progress and performance data will be saved locally for future sessions.
