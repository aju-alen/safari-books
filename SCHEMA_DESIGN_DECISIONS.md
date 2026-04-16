# Schema Design Decisions - Narration Fields

## Decision: String Fields vs Enums for Narration Settings

### Problem
Originally considered using Prisma enums for narration settings:
```prisma
enum NarrationSampleHeartzRate {
  LOW  // 22050
  HIGH // 44100
}

enum NarrationSpeakingRate {
  SLOW   // 0.7
  NORMAL // 1.0
  FAST   // 1.9
}

enum NarrationGender {
  MALE
  FEMALE
}
```

### Issues with Enums

1. **Client-side flexibility**: Enums are rigid and hard to change
2. **No type safety on client**: Client isn't strongly typed, so enums don't provide benefits
3. **Maintenance overhead**: Adding new options requires schema migration
4. **Client-server coupling**: Client must know exact enum values
5. **Limited extensibility**: Hard to add new values without breaking changes

### Solution: String Fields

```prisma
model Company {
  // ... other fields
  narrationSampleHeartzRate String? // "22050" or "44100"
  narrationSpeakingRate String?     // "0.7", "1.0", "1.9"
  narrationGender String?           // "MALE", "FEMALE"
  narrationLanguageCode String?     // "en-US", "es-ES", etc.
  narrationVoiceName String?        // "en-US-Standard-A", etc.
}

model Author {
  // ... same fields
}
```

### Benefits of String Fields

1. **Flexibility**: Easy to add new values without schema changes
2. **Client-friendly**: Works well with untyped client forms
3. **Extensible**: Can store any string value
4. **Simple**: No enum maintenance overhead
5. **Future-proof**: Easy to add new narration options

### Example Usage

```javascript
// Client can send any string values
const narrationData = {
  narrationSampleHeartzRate: "44100",
  narrationSpeakingRate: "1.2",      // Custom rate
  narrationGender: "FEMALE",
  narrationLanguageCode: "en-US",
  narrationVoiceName: "en-US-Standard-A"
};

// Server accepts and stores as-is
await prisma.company.update({
  where: { id: companyId },
  data: narrationData
});
```

### Validation (Optional)

If you need validation, you can add it at the application level:

```javascript
const VALID_SAMPLE_RATES = ["22050", "44100"];
const VALID_SPEAKING_RATES = ["0.7", "1.0", "1.9"];
const VALID_GENDERS = ["MALE", "FEMALE"];

const validateNarrationSettings = (data) => {
  if (data.narrationSampleHeartzRate && !VALID_SAMPLE_RATES.includes(data.narrationSampleHeartzRate)) {
    throw new Error("Invalid sample rate");
  }
  // ... other validations
};
```

### Alternative Approaches Considered

1. **JSON Field**: Good for complex nested data, but overkill for simple key-value pairs
2. **Separate Table**: Good for complex relationships, but adds unnecessary complexity
3. **Enums**: Good for strongly-typed systems, but not suitable for flexible client forms

### Conclusion

String fields provide the best balance of:
- **Simplicity**: Easy to implement and maintain
- **Flexibility**: Can handle any string values
- **Client compatibility**: Works well with untyped forms
- **Future extensibility**: Easy to add new options

This approach is particularly suitable for form-based applications where the client needs flexibility in data entry and the server needs to be accommodating of various input values.
