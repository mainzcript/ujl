# UJL-Framework

**Unified JSON Layout (UJL)** - The Open-Source Web-Builder of the Future

## About UJL

UJL is a building block system for digital content. At its heart is an editor – the UJL **Crafter** – with which content can be managed and combined.
A central concept of UJL is the strict separation of content and design. Unlike HTML and CSS, where content and styling are technically separated, UJL works at a higher abstraction level. Content is structured and described through modules as reusable building blocks in a JSON format (`.ujl.json`), while design specifications are centrally stored in a `.ujlt.json` file. The UJL Renderer combines both elements and generates a **ContentFrame** (HTML/CSS/JS) that consistently adheres to the corporate design.

### Core Concepts

- **Separation of Content and Design**: Content in `.ujl.json` files, design in `.ujlt.json` theme files
- **Modular & Open Source**: Fully open source and extensible
- **LLM-ready by Design**: Optimized for language models and AI assistants
- **Easy Integration**: Adapts to existing systems

## Project Structure

```
ujl/
├── packages/
│   ├── core/           # Schemas, Validator, Renderer
│   ├── ui/             # Shadcn-svelte UI Components
│   ├── crafter/        # Visual UJL Editor
│   └── examples/       # Example Material and Test Data
├── services/           # Backend Services (Docker-based)
│   └── media/          # Payload CMS-based Media Management
└── apps/
    ├── landing/        # Marketing Landing Page
    ├── demo/           # Demo Application
    └── docs/           # Documentation Website
```

## License

TODO: Looks like it will be an MIT license.
