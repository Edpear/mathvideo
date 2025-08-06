const inquirer = require('inquirer');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');

class MathVideo {
  constructor() {
    this.groqApiKey = null;
    this.outputDir = path.join(process.cwd(), 'output');
  }

  async initialize() {
    console.log('🎬 Welcome to MathVideo!');
    console.log('Convert your mathematical concepts into beautiful videos.\n');
    
    // Check if Manim is installed
    const manimInstalled = await this.checkManimInstallation();
    if (!manimInstalled) {
      throw new Error('Manim is not installed. Please install it with: pip install manim');
    }
    
    await this.setupGroqApiKey();
    await this.ensureOutputDirectory();
  }

  async setupGroqApiKey() {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'apiKeyOption',
        message: 'Do you have a Groq API key?',
        choices: [
          { name: 'Yes, I have an API key', value: 'existing' },
          { name: 'No, I need to create one', value: 'new' }
        ]
      }
    ]);

    if (answers.apiKeyOption === 'new') {
      console.log('\n📝 To get your Groq API key:');
      console.log('1. Go to https://console.groq.com/');
      console.log('2. Sign up or log in to your account');
      console.log('3. Navigate to API Keys section');
      console.log('4. Create a new API key');
      console.log('5. Copy the key and paste it below\n');
      
      const apiKeyAnswer = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: 'Please enter your Groq API key:',
          validate: (input) => {
            if (input.length > 0) return true;
            return 'API key is required';
          }
        }
      ]);
      
      this.groqApiKey = apiKeyAnswer.apiKey;
    } else {
      const apiKeyAnswer = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: 'Please enter your Groq API key:',
          validate: (input) => {
            if (input.length > 0) return true;
            return 'API key is required';
          }
        }
      ]);
      
      this.groqApiKey = apiKeyAnswer.apiKey;
    }
  }

  async ensureOutputDirectory() {
    try {
      await fs.ensureDir(this.outputDir);
    } catch (error) {
      console.error('Error creating output directory:', error);
    }
  }

  async checkManimInstallation() {
    return new Promise((resolve) => {
      const checkProcess = spawn('manim', ['--version'], {
        stdio: 'pipe'
      });

      checkProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Manim is installed and ready');
          resolve(true);
        } else {
          console.log('❌ Manim is not installed or not in PATH');
          console.log('💡 Install Manim with: pip install manim');
          resolve(false);
        }
      });

      checkProcess.on('error', () => {
        console.log('❌ Manim is not installed or not in PATH');
        console.log('💡 Install Manim with: pip install manim');
        resolve(false);
      });
    });
  }

  async generateManimCode(inputString) {
    // Read system prompt from file
    let systemPrompt;
    try {
      systemPrompt = await fs.readFile('systemprompt.txt', 'utf8');
    } catch (error) {
      console.error('Error reading system prompt file:', error);
      throw new Error('Failed to read system prompt file');
    }

    const prompt = `${systemPrompt}

CONVERT THIS MATHEMATICAL CONCEPT INTO A MANIM ANIMATION:
"${inputString}"

FOLLOW THE ALGORITHMIC FRAMEWORK EXACTLY. RETURN ONLY PYTHON CODE.`;

    try {
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.1-8b-instant',
                 messages: [
           {
             role: 'system',
             content: systemPrompt
           },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      let code = response.data.choices[0].message.content;
      
      // Clean the code if it contains markdown formatting
      code = this.cleanGeneratedCode(code);
      
      return code;
    } catch (error) {
      console.error('Error calling Groq API:', error.response?.data || error.message);
      throw new Error('Failed to generate Manim code');
    }
  }

  cleanGeneratedCode(code) {
    // Remove markdown code blocks if present
    code = code.replace(/```python\s*/g, '');
    code = code.replace(/```\s*$/g, '');
    code = code.replace(/^```\s*/g, '');
    
    // Remove any leading/trailing whitespace
    code = code.trim();
    
    return code;
  }

  async createVideo(inputString) {
    try {
      console.log('🤖 Generating Manim code...');
      const manimCode = await this.generateManimCode(inputString);
      
      // Basic validation of the generated code
      if (!manimCode.includes('from manim import') || !manimCode.includes('class')) {
        console.log('Generated code preview:', manimCode.substring(0, 200) + '...');
        throw new Error('Generated code is missing required imports or class definition');
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const pythonFileName = `manim_script_${timestamp}.py`;
      const pythonFilePath = path.join(this.outputDir, pythonFileName);
      
      console.log('📝 Writing Python script...');
      await fs.writeFile(pythonFilePath, manimCode);
      console.log(`📄 Python script saved: ${pythonFileName}`);
      
      console.log('🎬 Rendering video with Manim...');
      await this.runManim(pythonFilePath);
      
      // Final check for video files
      const videoFiles = await this.findVideoFiles();
      if (videoFiles.length > 0) {
        console.log('✅ Video created successfully!');
        console.log(`📁 Video file: ${videoFiles[0]}`);
        console.log(`📂 Location: ${this.outputDir}`);
      } else {
        throw new Error('Video file was not created successfully');
      }
      
    } catch (error) {
      console.error('❌ Error creating video:', error.message);
      console.log('💡 Try using a simpler mathematical concept or check your API key.');
      console.log('🔧 Make sure Manim is properly installed: pip install manim');
    }
  }

  async runManim(pythonFilePath) {
    return new Promise((resolve, reject) => {
      console.log('🎬 Starting Manim rendering...');
      
      // Use basic Manim flags for compatibility
      const manimArgs = [
        '-pql',  // Preview, quality low, show progress
        pythonFilePath,
        'MathScene'
      ];
      
      console.log(`🎬 Running: manim ${manimArgs.join(' ')}`);
      
      const manimProcess = spawn('manim', manimArgs, {
        cwd: this.outputDir,
        stdio: 'pipe'
      });

      let output = '';
      let errorOutput = '';

      manimProcess.stdout.on('data', (data) => {
        const dataStr = data.toString();
        output += dataStr;
        process.stdout.write(dataStr);
      });

      manimProcess.stderr.on('data', (data) => {
        const dataStr = data.toString();
        errorOutput += dataStr;
        process.stderr.write(dataStr);
      });

      manimProcess.on('close', async (code) => {
        console.log(`\n🎬 Manim process completed with code: ${code}`);
        
        if (code === 0) {
          // Wait a moment for file system to sync
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if video file was created
          const videoFiles = await this.findVideoFiles();
          
          if (videoFiles.length > 0) {
            console.log(`✅ Video file created: ${videoFiles[0]}`);
            resolve();
          } else {
            console.log('⚠️ No video file found, checking for errors...');
            reject(new Error('No video file was generated. Check the output above for errors.'));
          }
        } else {
          reject(new Error(`Manim process failed with code ${code}: ${errorOutput}`));
        }
      });

      manimProcess.on('error', (error) => {
        reject(new Error(`Failed to start Manim: ${error.message}`));
      });

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        manimProcess.kill('SIGTERM');
        reject(new Error('Manim process timed out after 5 minutes'));
      }, 5 * 60 * 1000); // 5 minutes timeout

      manimProcess.on('close', async (code) => {
        clearTimeout(timeout);
        console.log(`\n🎬 Manim process completed with code: ${code}`);
        
        if (code === 0) {
          // Wait a moment for file system to sync
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if video file was created
          const videoFiles = await this.findVideoFiles();
          
          if (videoFiles.length > 0) {
            console.log(`✅ Video file created: ${videoFiles[0]}`);
            resolve();
          } else {
            console.log('⚠️ No video file found, checking for errors...');
            reject(new Error('No video file was generated. Check the output above for errors.'));
          }
        } else {
          reject(new Error(`Manim process failed with code ${code}: ${errorOutput}`));
        }
      });
    });
  }

  async findVideoFiles() {
    try {
      // Look for video files in the media/videos subdirectories
      const mediaDir = path.join(this.outputDir, 'media', 'videos');
      if (!await fs.pathExists(mediaDir)) {
        return [];
      }

      const videoDirs = await fs.readdir(mediaDir);
      const videoFiles = [];

      for (const dir of videoDirs) {
        const videoDir = path.join(mediaDir, dir, '480p15');
        if (await fs.pathExists(videoDir)) {
          const files = await fs.readdir(videoDir);
          const mp4Files = files.filter(file => file.endsWith('.mp4') && file.includes('MathScene'));
          if (mp4Files.length > 0) {
            videoFiles.push(path.join(videoDir, mp4Files[0]));
          }
        }
      }

      return videoFiles;
    } catch (error) {
      console.error('Error reading video directories:', error);
      return [];
    }
  }

  async run() {
    await this.initialize();
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'inputString',
        message: 'Enter the mathematical concept you want to animate:',
        validate: (input) => {
          if (input.trim().length > 0) return true;
          return 'Please enter a mathematical concept';
        }
      }
    ]);

    await this.createVideo(answers.inputString);
  }

  // Method for direct video creation without interactive prompts
  async createVideoDirectly(inputString) {
    await this.initialize();
    await this.createVideo(inputString);
  }
}

// If this file is run directly
if (require.main === module) {
  const mathVideo = new MathVideo();
  mathVideo.run().catch(console.error);
}

module.exports = MathVideo; 