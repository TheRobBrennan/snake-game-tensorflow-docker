const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Log the current directory
console.log('Current directory:', process.cwd());

// Run the build command
console.log('Running build command...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build command completed successfully');
} catch (error) {
  console.error('Build command failed:', error);
  process.exit(1);
}

// Check if dist directory exists
const distPath = path.join(process.cwd(), 'dist');
console.log('Checking if dist directory exists at:', distPath);
if (fs.existsSync(distPath)) {
  console.log('dist directory exists');

  // List contents of dist directory
  console.log('Contents of dist directory:');
  const files = fs.readdirSync(distPath);
  files.forEach(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    console.log(`- ${file} (${stats.isDirectory() ? 'directory' : 'file'}, ${stats.size} bytes)`);
  });
} else {
  console.error('dist directory does not exist!');
  process.exit(1);
}
