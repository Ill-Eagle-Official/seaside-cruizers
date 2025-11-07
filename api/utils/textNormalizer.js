/**
 * Text Normalization Utilities
 * Handles proper capitalization of names, locations, and other text fields
 */

/**
 * Converts text to title case (first letter of each word capitalized)
 * Handles special cases like McDonald's, O'Brien, etc.
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
      
      // Handle hyphenated words (Mary-Jane)
      if (word.includes('-')) {
        return word
          .split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
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

