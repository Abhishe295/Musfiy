/**
 * Cosine similarity between two equal-length numeric vectors.
 * Returns 1 for identical direction, 0 for orthogonal, -1 for opposite.
 */
export function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Z-score normalize a set of vectors, dimension by dimension.
 *
 * Our feature dimensions live on wildly different scales (tempo is
 * ~60-180, energy/brightness/zcr are ~0-1), so without normalization the
 * tempo dimension alone would dominate cosine similarity. Normalizing
 * each dimension to zero mean / unit variance across the candidate pool
 * puts all four features on equal footing.
 */
export function zScoreNormalize(vectors) {
  if (!vectors.length) return vectors;

  const dims = vectors[0].length;
  const mean = new Array(dims).fill(0);
  const std = new Array(dims).fill(0);

  vectors.forEach((v) => v.forEach((val, i) => (mean[i] += val)));
  for (let i = 0; i < dims; i++) mean[i] /= vectors.length;

  vectors.forEach((v) =>
    v.forEach((val, i) => (std[i] += (val - mean[i]) ** 2))
  );
  for (let i = 0; i < dims; i++) std[i] = Math.sqrt(std[i] / vectors.length) || 1;

  return vectors.map((v) => v.map((val, i) => (val - mean[i]) / std[i]));
}
