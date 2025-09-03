// Test the HTML to text and text to HTML conversion functions

const htmlToText = (html) => {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

const textToHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
};

// Test with sample content
const originalText = "This is a test with some content.\n\nThis is a new paragraph.\nAnd this is a line break.";
console.log("Original text:", originalText);

const htmlVersion = textToHtml(originalText);
console.log("Converted to HTML:", htmlVersion);

const backToText = htmlToText(htmlVersion);
console.log("Back to text:", backToText);

console.log("Text matches original:", backToText === originalText);

// Test with empty content
console.log("\n--- Testing empty content ---");
console.log("Empty text to HTML:", textToHtml(''));
console.log("Empty HTML to text:", htmlToText(''));

// Test with existing HTML content
console.log("\n--- Testing existing HTML ---");
const existingHtml = "<p>Some existing content</p><p>Another paragraph</p>";
console.log("Existing HTML:", existingHtml);
console.log("HTML to text:", htmlToText(existingHtml));
console.log("Back to HTML:", textToHtml(htmlToText(existingHtml)));