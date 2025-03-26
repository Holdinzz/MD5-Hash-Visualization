# MD5 Algorithm Documentation

## Overview
MD5 (Message-Digest Algorithm 5) is a cryptographic hash function that produces a 128-bit (16-byte) hash value. It is commonly used to verify data integrity and create digital signatures.

## Main Steps

### 1. Padding
1. Append a single '1' bit to the message
2. Append '0' bits until the message length is congruent to 448 modulo 512
3. Append the original message length (in bits) as a 64-bit integer

### 2. Initialize Variables
Initialize four 32-bit variables (A, B, C, D) with the following values:
- A = 0x67452301
- B = 0xEFCDAB89
- C = 0x98BADCFE
- D = 0x10325476

### 3. Process Message in 512-bit Blocks
For each 512-bit block:
1. Break the block into 16 32-bit words (M[0] to M[15])
2. Save the current values of A, B, C, D
3. Perform four rounds of operations (16 operations each round)

### 4. Four Rounds of Operations
Each round uses a different function (F, G, H, I) and constant table:

#### Round 1 (F function)
- Function: F(x,y,z) = (x & y) | (~x & z)
- Uses constants from table T[1-16]

#### Round 2 (G function)
- Function: G(x,y,z) = (x & z) | (y & ~z)
- Uses constants from table T[17-32]

#### Round 3 (H function)
- Function: H(x,y,z) = x ^ y ^ z
- Uses constants from table T[33-48]

#### Round 4 (I function)
- Function: I(x,y,z) = y ^ (x | ~z)
- Uses constants from table T[49-64]

### 5. Update Variables
After each round:
- Add the result to the original A, B, C, D values
- Rotate the results appropriately

### 6. Final Hash
1. Concatenate A, B, C, D in little-endian order
2. Convert to hexadecimal string
3. The resulting 32-character string is the MD5 hash

## Implementation Notes
- All operations are performed modulo 2^32
- The algorithm processes the input in little-endian byte order
- The final hash is always 32 hexadecimal characters
- The algorithm is deterministic (same input always produces same output)

## Security Considerations
While MD5 is widely used, it is not cryptographically secure for many applications due to:
- Collision vulnerabilities
- Pre-image attacks
- Length extension attacks

For cryptographic security, consider using stronger alternatives like SHA-256 or SHA-3. 