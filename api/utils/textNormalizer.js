/**
 * Text Normalization Utilities
 * Handles proper capitalization of names, locations, and other text fields
 */

// Common abbreviations that should be ALL CAPS
const ABBREVIATIONS = new Set([
  // Canadian Provinces
  'bc', 'ab', 'sk', 'mb', 'on', 'qc', 'nb', 'ns', 'pe', 'nl', 'yt', 'nt', 'nu',
  // US States (common abbreviations)
  'al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 'id', 'il', 'in', 'ia', 'ks', 
  'ky', 'la', 'me', 'md', 'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm', 'ny', 
  'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 
  'wi', 'wy', 'dc',
  // Car model abbreviations
  'ss', 'gt', 'gto', 'rs', 'z28', 'ls', 'lt', 'lx', 'se', 'sl', 'amg', 'quattro', 'awd', '4wd',
  'v6', 'v8', 'v10', 'v12', 'hp', 'xr', 'xt', 'svt', 'srt', 'rt', 'se', 'sx', 'dx', 'lx', 'ex',
  'gli', 'gti', 'tdi', 'tsi', 'glx', 'glc', 'gle', 'cls', 'slk', 'clk', 'ml', 'gl',
  // Common words/abbreviations
  'usa', 'uk', 'usa', 'usd', 'cad', 'ii', 'iii', 'iv'
]);

/**
 * Converts text to title case (first letter of each word capitalized)
 * Handles special cases like McDonald's, O'Brien, BC, SS, etc.
 * @param {string} text - Text to convert
 * @returns {string} Title cased text
 */
export function toTitleCase(text) {
  if (!text || typeof text !== 'string') return text;
  
  // Trim and convert to lowercase first
  text = text.trim().toLowerCase();
  
  // Split by spaces and capitalize each word
  return text
    .split(' ')
    .map(word => {
      if (!word) return word;
      
      const lowerWord = word.toLowerCase();
      
      // Check if entire word is a known abbreviation
      if (ABBREVIATIONS.has(lowerWord)) {
        return word.toUpperCase();
      }
      
      // Handle hyphenated words (Mary-Jane, Z-28)
      if (word.includes('-')) {
        return word
          .split('-')
          .map(part => {
            if (ABBREVIATIONS.has(part.toLowerCase())) {
              return part.toUpperCase();
            }
            return part.charAt(0).toUpperCase() + part.slice(1);
          })
          .join('-');
      }
      
      // Handle apostrophes (O'Brien, McDonald's)
      if (word.includes("'")) {
        // Check if it's after first character (O'Brien)
        const apostropheIndex = word.indexOf("'");
        if (apostropheIndex === 1) {
          // O'Brien pattern
          return word.charAt(0).toUpperCase() + 
                 word.charAt(1) + 
                 word.charAt(2).toUpperCase() + 
                 word.slice(3);
        } else {
          // McDonald's pattern - just capitalize first letter
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
      }
      
      // Standard capitalization
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Normalizes registration data for consistent formatting
 * @param {Object} data - Raw registration data
 * @returns {Object} Normalized data
 */
export function normalizeRegistrationData(data) {
  return {
    ...data,
    // Normalize names
    firstName: toTitleCase(data.firstName),
    lastName: toTitleCase(data.lastName),
    
    // Normalize location
    country: toTitleCase(data.country),
    province: toTitleCase(data.province),
    city: toTitleCase(data.city),
    // Keep postal code as uppercase (standard format)
    postalCode: data.postalCode?.toUpperCase().trim(),
    
    // Normalize car details
    make: toTitleCase(data.make),
    model: toTitleCase(data.model),
    year: data.year?.trim(), // Just trim year
    
    // Normalize club name
    clubName: data.clubName ? toTitleCase(data.clubName) : data.clubName,
    
    // Keep email lowercase (standard)
    email: data.email?.toLowerCase().trim(),
    
    // Swag options - keep as-is (they're likely dropdowns anyway)
    buyHat: data.buyHat,
    buyShirt: data.buyShirt,
    hatColour: data.hatColour,
    hatSize: data.hatSize,
    shirtColour: data.shirtColour,
    shirtGender: data.shirtGender,
    shirtSize: data.shirtSize
  };
}

/**
 * Test function to verify normalization
 */
export function testNormalization() {
  const tests = [
    { input: 'john doe', expected: 'John Doe' },
    { input: 'MARY JANE', expected: 'Mary Jane' },
    { input: "patrick o'brien", expected: "Patrick O'Brien" },
    { input: 'mary-jane smith', expected: 'Mary-Jane Smith' },
    { input: "mcdonald's restaurant", expected: "Mcdonald's Restaurant" },
    { input: '  extra   spaces  ', expected: 'Extra Spaces' }
  ];
  
  console.log('Testing text normalization:');
  tests.forEach(({ input, expected }) => {
    const result = toTitleCase(input);
    const pass = result === expected;
    console.log(`${pass ? '✅' : '❌'} "${input}" → "${result}" ${!pass ? `(expected: "${expected}")` : ''}`);
  });
}

