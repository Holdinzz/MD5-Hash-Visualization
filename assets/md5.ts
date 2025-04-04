/* MIT License
 *
 * Copyright (c) 2018 Bryce Wilson
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Constants
const A0: number = 0x67452301;
const B0: number = 0xefcdab89;
const C0: number = 0x98badcfe;
const D0: number = 0x10325476;

const S: number[] = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
  9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
  16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15,
  21,
];

const K: Uint32Array = new Uint32Array([
  0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a,
  0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
  0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340,
  0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
  0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
  0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
  0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa,
  0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
  0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92,
  0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
  0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
]);

const PADDING: Uint8Array = new Uint8Array([
  0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
]);

interface MD5State {
  A: number;
  B: number;
  C: number;
  D: number;
}

interface MD5StateSetters {
  setStage1: (value: string[][]) => void;
  setStage2: (value: {
    round: number;
    state: { A: string; B: string; C: string; D: string }[];
  }) => void;
  setStage3: (value: {
    working: { A: string; B: string; C: string; D: string };
    saved: { AA: string; BB: string; CC: string; DD: string };
    final: string;
  }) => void;
}

export default function md5(
  input: string | number,
  stateSetters?: MD5StateSetters
): ArrayBuffer {
  // Always convert input to a string
  input = input.toString();

  // Initialize digest buffers
  let A: number = A0;
  let B: number = B0;
  let C: number = C0;
  let D: number = D0;

  // Determine the size of the message in bytes
  const size: number = input.length;
  const paddingLength: number =
    size % 64 < 56 ? 56 - (size % 64) : 56 + 64 - (size % 64);
  const inputBytes: Uint8Array = new Uint8Array(size + paddingLength + 8);

  // Copy the number values of the characters into an array
  for (let i = 0; i < input.length; ++i) {
    inputBytes[i] = input.charCodeAt(i);
  }

  // Pad the array to be congruent to 56 mod 64 (bytes)
  for (let i = 0; i < paddingLength; ++i) {
    inputBytes[size + i] = PADDING[i];
  }

  // Separate the size in bits into two 32-bit unsigned integers
  const sizeBitsLower: number = (size * 8) >>> 0;
  const sizeBitsUpper: number = ((size * 8) / Math.pow(2, 32)) >>> 0;

  // Append the size in bits
  inputBytes[size + paddingLength + 0] = (sizeBitsLower >>> 0) & 0xff;
  inputBytes[size + paddingLength + 1] = (sizeBitsLower >>> 8) & 0xff;
  inputBytes[size + paddingLength + 2] = (sizeBitsLower >>> 16) & 0xff;
  inputBytes[size + paddingLength + 3] = (sizeBitsLower >>> 24) & 0xff;
  inputBytes[size + paddingLength + 4] = (sizeBitsUpper >>> 0) & 0xff;
  inputBytes[size + paddingLength + 5] = (sizeBitsUpper >>> 8) & 0xff;
  inputBytes[size + paddingLength + 6] = (sizeBitsUpper >>> 16) & 0xff;
  inputBytes[size + paddingLength + 7] = (sizeBitsUpper >>> 24) & 0xff;

  const numBlocks: number = Math.ceil((size + paddingLength) / 64);

  // Stage 1 - Padding Results
  const stage1Log = Array.from({ length: numBlocks }, (_, i) =>
    Array.from(inputBytes.slice(i * 64, (i + 1) * 64)).map((b) =>
      b.toString(2).padStart(8, "0")
    )
  );
  stateSetters?.setStage1(stage1Log);

  // Stage 2 - Block Processing
  let stage2State = {
    round: 0,
    state: [] as { A: string; B: string; C: string; D: string }[],
  };

  // Variables to save the last block's initial values
  let lastAA: number = 0;
  let lastBB: number = 0;
  let lastCC: number = 0;
  let lastDD: number = 0;

  // Variables to save the final values after all block processing
  let finalA: number = 0;
  let finalB: number = 0;
  let finalC: number = 0;
  let finalD: number = 0;

  for (let i = 0; i < numBlocks; ++i) {
    // Turn the input into an array of words
    const m: number[] = getChunk(i, inputBytes);
    let AA: number = A;
    let BB: number = B;
    let CC: number = C;
    let DD: number = D;

    // Save the last block's initial values
    if (i === numBlocks - 1) {
      lastAA = AA;
      lastBB = BB;
      lastCC = CC;
      lastDD = DD;
    }

    let E: number;
    let g: number;

    for (let j = 0; j < 64; ++j) {
      switch (Math.floor(j / 16)) {
        case 0:
          E = F(BB, CC, DD);
          g = j;
          break;
        case 1:
          E = G(BB, CC, DD);
          g = (j * 5 + 1) % 16;
          break;
        case 2:
          E = H(BB, CC, DD);
          g = (j * 3 + 5) % 16;
          break;
        default:
          E = I(BB, CC, DD);
          g = (j * 7) % 16;
          break;
      }

      const temp: number = DD;
      DD = CC;
      CC = BB;
      BB = unsigned32Add(
        BB,
        rotateLeft(unsigned32Add(AA, E, K[j], m[g]), S[j])
      );
      AA = temp;

      if (j % 16 === 0) {
        const stateA = (AA >>> 0).toString(2).padStart(32, "0");
        const stateB = (BB >>> 0).toString(2).padStart(32, "0");
        const stateC = (CC >>> 0).toString(2).padStart(32, "0");
        const stateD = (DD >>> 0).toString(2).padStart(32, "0");

        stage2State.state.push({
          A: stateA,
          B: stateB,
          C: stateC,
          D: stateD,
        });
        stage2State.round = Math.floor(j / 16) + 1;
        stateSetters?.setStage2(stage2State);
      }
    }

    A += AA;
    B += BB;
    C += CC;
    D += DD;

    // Save final values after last block
    if (i === numBlocks - 1) {
      finalA = A;
      finalB = B;
      finalC = C;
      finalD = D;
    }
  }

  // Stage 3 - Working State and Final Result
  const workingState = {
    A: (finalA - lastAA).toString(16).padStart(8, "0").slice(-8),
    B: (finalB - lastBB).toString(16).padStart(8, "0").slice(-8),
    C: (finalC - lastCC).toString(16).padStart(8, "0").slice(-8),
    D: (finalD - lastDD).toString(16).padStart(8, "0").slice(-8),
  };

  const savedState = {
    AA: lastAA.toString(16).padStart(8, "0"),
    BB: lastBB.toString(16).padStart(8, "0"),
    CC: lastCC.toString(16).padStart(8, "0"),
    DD: lastDD.toString(16).padStart(8, "0"),
  };

  const result: ArrayBuffer = new ArrayBuffer(16);
  const view: Uint32Array = new Uint32Array(result);
  view[0] = A;
  view[1] = B;
  view[2] = C;
  view[3] = D;

  const finalHash = Array.from(new Uint8Array(result))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  stateSetters?.setStage3({
    working: workingState,
    saved: savedState,
    final: finalHash,
  });

  return result;
}

/*
 * Functions defined by the algorithm
 */
function F(X: number, Y: number, Z: number): number {
  return (X & Y) | (~X & Z);
}

function G(X: number, Y: number, Z: number): number {
  return (X & Z) | (Y & ~Z);
}

function H(X: number, Y: number, Z: number): number {
  return X ^ Y ^ Z;
}

function I(X: number, Y: number, Z: number): number {
  return Y ^ (X | ~Z);
}

/*
 * Rotates a word x left by n bits
 */
function rotateLeft(x: number, n: number): number {
  if (n != Math.floor(n) || n < 0) {
    throw new Error("Invalid argument (n): requires positive integer");
  }

  return ((x << n) | (x >>> (32 - n))) >>> 0;
}

/*
 * Returns an array of words from chunk i of the provided message
 */
function getChunk(i: number, message: Uint8Array): number[] {
  const m: number[] = [];
  for (let j = 0; j < 16; ++j) {
    m[j] =
      (message[i * 64 + j * 4 + 0] << 0) |
      (message[i * 64 + j * 4 + 1] << 8) |
      (message[i * 64 + j * 4 + 2] << 16) |
      (message[i * 64 + j * 4 + 3] << 24);
  }
  return m;
}

/*
 * JavaScript saves all numbers as high-precision floating point numbers
 * This function converts numbers to unsigned 32-bit integers, adds them,
 * and converts the sum to an unsigned 32-bit integer
 *
 * The logical right shift (>>>) is the only operation in JavaScript that
 * converts its arguments to unsigned 32-bit integers. Right shifting by
 * zero doesn't change the number except to emulate the desired data type.
 *
 * This function takes any number of arguments and returns their collective sum.
 */
function unsigned32Add(...args: number[]): number {
  return args.reduce((a, b) => ((a >>> 0) + (b >>> 0)) >>> 0, 0);
}
