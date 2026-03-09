// Essentia HPCP pipeline — replaces our custom computeChroma() when enabled.
//
// Pipeline (using Web Audio FFT data directly to skip WASM re-FFT):
//   freqBuf (dB from AnalyserNode) → linear magnitude → SpectralPeaks → HPCP
//
// Pitch class ordering:
//   Essentia HPCP[0] = A (referenceFrequency=440)
//   Our chroma[0]    = C
//   Rotation applied: ourChroma[(i + 9) % 12] = HPCP[i]

import { EssentiaWASM } from 'essentia.js/dist/essentia-wasm.es.js'
import Essentia from 'essentia.js/dist/essentia.js-core.es.js'

let instance = null

// Call once at startup — safe to call multiple times (returns cached instance).
export async function initEssentia() {
  if (instance) return instance
  console.log('[Essentia] loading WASM…')
  await EssentiaWASM['ready']
  instance = new Essentia(EssentiaWASM)
  console.log('[Essentia] ready —', instance.version)
  return instance
}

export function getEssentia() { return instance }

const NOISE_FLOOR_DB = -65

// Compute 12-bin HPCP from Web Audio frequency-domain data.
//
// freqData  — Float32Array from AnalyserNode.getFloatFrequencyData() (dB values)
// sampleRate — AudioContext.sampleRate
//
// Returns Float32Array(12) with same [C, C#, D, …, B] ordering as computeChroma().
export function computeHPCP(essentia, freqData, sampleRate) {
  const N = freqData.length

  // Convert dB → linear magnitude. Bins below noise floor stay 0.
  const magSpectrum = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    if (freqData[i] > NOISE_FLOOR_DB) {
      magSpectrum[i] = Math.pow(10, freqData[i] / 20)
    }
  }

  const specVec = essentia.arrayToVector(magSpectrum)

  // SpectralPeaks derives bin → Hz as: freq = binIndex * sampleRate / (2*(N-1))
  // which matches Web Audio's FFT bin spacing (sampleRate / fftSize).
  const peaks = essentia.SpectralPeaks(
    specVec,
    0,             // magnitudeThreshold — noise already zeroed above
    4000,          // maxFrequency (Hz)
    60,            // maxPeaks
    40,            // minFrequency (Hz)
    'byMagnitude',
    sampleRate
  )
  specVec.delete()

  // If no peaks found (silence / below noise floor), return zeros.
  if (peaks.frequencies.size() === 0) {
    peaks.frequencies.delete()
    peaks.magnitudes.delete()
    return new Float32Array(12)
  }

  const hpcpResult = essentia.HPCP(
    peaks.frequencies,
    peaks.magnitudes,
    false,           // bandPreset
    500,             // bandSplitFrequency (unused when bandPreset=false)
    8,               // harmonics
    4000,            // maxFrequency (Hz)
    false,           // maxShifted
    40,              // minFrequency (Hz)
    false,           // nonLinear
    'unitMax',       // normalized
    440,             // referenceFrequency (A4 = 440 Hz → HPCP[0] = A)
    sampleRate,
    12,              // size (bins per octave)
    'squaredCosine', // weightType
    0.5              // windowSize (octaves)
  )
  peaks.frequencies.delete()
  peaks.magnitudes.delete()

  // Rotate A-origin → C-origin to match our chroma convention.
  // HPCP[0]=A → ourChroma[9]=A, so ourChroma[(i+9)%12] = HPCP[i]
  const result = new Float32Array(12)
  for (let i = 0; i < 12; i++) {
    result[(i + 9) % 12] = hpcpResult.hpcp.get(i)
  }
  hpcpResult.hpcp.delete()

  return result
}
