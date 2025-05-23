/**
 * Change the namespace to the namespace on Pinecone you'd like to store your embeddings.
 */

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error("Missing Pinecone index name in .env file");
}

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? "";

const PINECONE_NAME_SPACE = process.env.PINECONE_NAME_SPACE ?? "rcpc-docs"; //namespace is optional for your vectors

module.exports = { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE };
