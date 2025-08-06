# MathVideo 🎬

Convert mathematical concepts into beautiful animated videos using Groq API and Manim.

## Features

- 🤖 AI-powered video generation using Groq's Llama 3.1 8B model
- 🎨 Beautiful mathematical animations with Manim
- 🔐 Secure API key management
- 📁 Automatic output organization with timestamps
- 🖥️ Interactive CLI interface

## Prerequisites

Before using MathVideo, you need to have the following installed:

### 1. Python and Manim
```bash
# Install Python (if not already installed)
# Download from https://python.org

# Install Manim
pip install manim

# For better performance, you might want to install additional dependencies:
pip install manim[all]
```

### 2. Groq API Key
You'll need a Groq API key to use this package:
1. Go to [Groq Console](https://console.groq.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key for use with MathVideo

## Installation

### Global Installation (Recommended)
```bash
npm install -g mathvideo
```

### Local Installation
```bash
npm install mathvideo
```

## Usage

### Global Installation
After installing globally, you can run:

**Interactive mode:**
```bash
mathvideo
```

**Command line mode:**
```bash
mathvideo "2x+3=7 solve for x"
mathvideo "The Pythagorean theorem states that a² + b² = c²"
```

### Local Installation
If installed locally, run:
```bash
npx mathvideo
```

### Programmatic Usage
```javascript
const MathVideo = require('mathvideo');

const mathVideo = new MathVideo();
await mathVideo.initialize();
await mathVideo.createVideo("The Pythagorean theorem states that a² + b² = c²");
```

## How It Works

1. **Input**: You provide a mathematical concept as a string
2. **AI Processing**: The concept is sent to Groq's Llama 3.1 8B model using a configurable system prompt
3. **Code Generation**: The AI generates complete Manim Python code
4. **Video Rendering**: Manim renders the animation into an MP4 file
5. **Output**: The video is saved in the `output` folder with timestamp

## Configuration

The package includes a `systemprompt.txt` file that contains the instructions for the AI model. You can modify this file to customize how the AI generates Manim code.

## Example Inputs

Here are some example mathematical concepts you can try:

- "The Pythagorean theorem states that a² + b² = c²"
- "Derivative of x² is 2x"
- "Integration of 2x is x² + C"
- "The area of a circle is πr²"
- "Euler's identity: e^(iπ) + 1 = 0"
- "The quadratic formula: x = (-b ± √(b² - 4ac)) / 2a"

## Output

Videos are saved in the `output` folder with the following naming convention:
- `manim_script_YYYY-MM-DDTHH-MM-SS-sssZ.py` (Python script)
- `MathScene_YYYY-MM-DDTHH-MM-SS-sssZ.mp4` (Video file)

## Configuration

The package automatically:
- Creates an `output` directory in your current working directory
- Handles API key setup interactively
- Manages temporary Python files
- Provides real-time rendering progress
- Uses a configurable system prompt from `systemprompt.txt`

## Troubleshooting

### Common Issues

1. **Manim not found**
   ```bash
   pip install manim
   ```

2. **Python not in PATH**
   - Ensure Python is installed and added to your system PATH
   - On Windows, you might need to restart your terminal after installation

3. **API Key Issues**
   - Verify your Groq API key is correct
   - Check your internet connection
   - Ensure you have sufficient API credits

4. **Rendering Errors**
   - Check that Manim is properly installed
   - Ensure you have sufficient disk space
   - Try simpler mathematical concepts first

### Getting Help

If you encounter issues:
1. Check that all prerequisites are installed
2. Verify your Groq API key is valid
3. Try with a simple mathematical concept first
4. Check the console output for error messages

## Development

To contribute to this project:

```bash
git clone https://github.com/yourusername/mathvideo.git
cd mathvideo
npm install
npm start
```

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For support, please open an issue on GitHub or contact the maintainers. 