# cycle-bite

Build a single-page, mobile-responsive React web application named CycleBite.

Core App Concept:

A privacy-first, menstrual-cycle-synced nutrition assistant that recommends meal recipes and PMS craving swaps based on the user's current cycle phase.

Key Features:

1. Phase Calculator: Users input their last period start date and average cycle length (default 28 days). Calculate which of the 4 phases they are in:

   - Menstrual (Days 1-5): Focus on warm, iron-rich, comforting foods.

   - Follicular (Days 6-13): Focus on light, fresh, probiotic-rich foods.

   - Ovulatory (Days 14-17): Focus on high-energy, anti-inflammatory foods.

   - Luteal (Days 18-28): Focus on complex carbs, B-vitamins, and magnesium-rich foods.

2. Fridge-to-Plate Recipe Engine: An ingredient input text area (e.g., "eggs, spinach, sweet potato") where AI generates phase-specific recipes.

3. PMS Craving Swaps: A selector for cravings (e.g., Sugar, Salt, Chocolate) returning healthy functional alternatives.

STRICT CONSTRAINTS:

- 3-Suggestion Cap: NEVER show more than 3 recipe suggestions or 3 craving swaps at a time to prevent cognitive overload.

- Privacy Model: Save all user cycle dates strictly in browser localStorage. Do not send dates to external databases.

- API Target: Prepare an API caller to request completions from Nebius Token Factory API at `https://api.tokenfactory.nebius.com/v1/` using model `meta-llama/Meta-Llama-3.1-70B-Instruct`.

Design Style:

Clean, warm, soft earthy pastel palette (sage green, soft rose, cream). Modern typography, rounded card layouts, and intuitive icons.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e1fc7916-06df-45dd-bfad-c8f3a4306cb7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
