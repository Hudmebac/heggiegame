# Firebase Studio

This is the README for HEGGIE: Hegg Interstellar Exchange.

HEGGIE is a space-themed game where you build and manage your own intergalactic enterprise. Explore vast star systems, customize your spaceship with various upgrades and modules, engage in profitable trading ventures across different planets and stations, and navigate the challenges of deep space.

Key features of HEGGIE include:

- **Trading:** Participate in a dynamic market simulation with real-time price fluctuations, allowing for strategic buying and selling of goods across the galaxy.
- **Exploration:** Discover new star systems, planets, and stations, each with their own opportunities and challenges.
- **Ship Customization and Upgrades:** Modify your spaceship with a wide array of upgrades and modules to enhance its capabilities for trading, combat, or exploration. Manage and customize your entire fleet for optimal performance.
- **Gambling:** Test your luck and skill in the in-game casino for a chance to boost your finances.
- **Hardcore Mode:** For experienced players seeking a greater challenge, a hardcore mode is available with increased difficulty and consequences.
- **Lore:** Delve into the rich backstory of the HEGGIE universe through the lore codex found within the Encyclopedia.

The game also features an comprehensive Encyclopedia, providing details on various in-game items such as ships, systems, and different types of codex entries like Anatomy, Business, and Gameplay. Your objective is to grow your wealth and influence, become a renowned captain, and dominate the intergalactic exchange.

## Businesses and Banking

HEGGIE allows you to engage in various business ventures and manage your finances. A key business opportunity is the **Galactic Bank**. You can own and manage a bank, which provides a consistent source of income. The operation and themes of the bank are influenced by different bank themes (see [/src/lib/bank-themes.ts](src/lib/bank-themes.ts)).

The Encyclopedia's Business Codex ([/src/app/components/encyclopedia/business-codex.tsx](src/app/components/encyclopedia/business-codex.tsx)) provides further details on different business types and financial strategies within the game. Explore these resources to maximize your profits and expand your intergalactic empire.

## Careers

Choose from a variety of careers, each offering unique starting conditions, perks, and challenges. Your chosen career will influence your initial fleet, net worth, and the types of missions and opportunities available to you. The available careers, their descriptions, perks, risks, starting fleets, and starting net worth are defined in [/src/lib/careers.ts](src/lib/careers.ts).

## Ships

Your spaceship is your lifeline in the vast expanse of space. HEGGIE features various ship types, each with different characteristics suited for specific roles like trading, combat, or exploration. Details about each ship type, including their ID, name, and description, can be found in [/src/lib/ships.ts](src/lib/ships.ts). You can also view blueprint images for these ships in the [/public/images/blueprints/](public/images/blueprints/) directory.

## Loading the Application

To get the HEGGIE application up and running, follow these steps:

1. **Clone the repository:** If you haven't already, clone the project repository to your local machine.

2. **Install dependencies:** Navigate to the project's root directory in your terminal and run:



