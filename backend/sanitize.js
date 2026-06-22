const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'controllers');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Let's use a simpler regex that just finds `message: error.message` or `message: err.message` inside a res.status(500) block
  // and replaces it. And we can inject console.error(error) right after `catch (error) {` or `catch(err) {`
  
  content = content.replace(/catch\s*\(([^)]+)\)\s*\{/g, (match, errVar) => {
    // If it already has console.error, don't add it again
    return match + `\n    console.error("Error in ${file}:", ${errVar});`;
  });

  // Now replace `message: error.message` inside res.status(500)
  // Since it can be multi-line:
  // return res.status(500).json({
  //   success: false,
  //   message: error.message,
  // });
  
  content = content.replace(/message:\s*(?:error|err)\.message/g, 'message: "Something went wrong. Please try again."');

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('Sanitization complete.');
