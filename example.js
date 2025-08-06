const MathVideo = require('./index.js');

async function runExample() {
  try {
    const mathVideo = new MathVideo();
    
    // Initialize the package (this will prompt for API key)
    await mathVideo.initialize();
    
    // Create a video for a mathematical concept
    console.log('Creating video for Pythagorean theorem...');
    await mathVideo.createVideo("The Pythagorean theorem states that in a right triangle, a² + b² = c²");
    
    console.log('Example completed!');
  } catch (error) {
    console.error('Error in example:', error.message);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runExample();
}

module.exports = runExample; 