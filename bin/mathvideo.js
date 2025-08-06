#!/usr/bin/env node

const MathVideo = require('../index.js');

async function main() {
  const mathVideo = new MathVideo();
  
  // Check if input was provided as command line argument
  const inputString = process.argv[2];
  
  if (inputString) {
    // Command line usage: mathvideo "2x+3=7 solve for x"
    console.log('🎬 MathVideo - Convert strings to videos using Groq API and Manim');
    console.log(`📝 Input: ${inputString}`);
    
    try {
      await mathVideo.initialize();
      await mathVideo.createVideo(inputString);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  } else {
    // Interactive usage: mathvideo
    try {
      await mathVideo.run();
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }
}

main().catch(console.error); 