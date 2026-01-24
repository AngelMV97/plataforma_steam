const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const { supabase } = require('../config/supabase');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class PDFService {
  /**
   * Process PDF: extract text, chunk, and create embeddings
   */
  async processPDF(pdfBuffer, articleId) {
    try {
      console.log('Extracting text from PDF...');
      console.log('pdfParse type:', typeof pdfParse);
      console.log('pdfParse:', pdfParse);
      
      // Try direct call - pdf-parse should be a function directly
      const data = await pdfParse(pdfBuffer);
      const fullText = data.text;
      
      if (!fullText || fullText.trim().length === 0) {
        throw new Error('No se pudo extraer texto del PDF');
      }
      
      console.log(`Extracted ${fullText.length} characters from PDF`);
      
      // Split into chunks (approximately 500 words each)
      const chunks = this.chunkText(fullText, 500);
      
      console.log(`Created ${chunks.length} chunks`);
      
      // Generate embeddings for each chunk
      const embeddings = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        console.log(`Generating embedding for chunk ${i + 1}/${chunks.length}`);
        
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: chunk.text,
        });
        
        const embedding = embeddingResponse.data[0].embedding;
        
        embeddings.push({
          article_id: articleId,
          content: chunk.text,
          embedding: JSON.stringify(embedding),
          page_number: chunk.page || null,
          chunk_index: i,
        });
        
        // Avoid rate limiting
        if (i < chunks.length - 1) {
          await this.sleep(200); // 200ms delay between requests
        }
      }
      
      console.log('Storing embeddings in database...');
      
      // Store all embeddings in database
      const { error: insertError } = await supabase
        .from('article_embeddings')
        .insert(embeddings);
      
      if (insertError) throw insertError;
      
      // Mark article as processed
      const { error: updateError } = await supabase
        .from('articles')
        .update({ pdf_processed: true })
        .eq('id', articleId);
      
      if (updateError) throw updateError;
      
      console.log('PDF processing complete!');
      
      return { success: true, chunks: chunks.length };
    } catch (error) {
      console.error('PDF processing error:', error);
      throw error;
    }
  }

  /**
   * Split text into chunks of approximately N words
   */
  chunkText(text, wordsPerChunk = 500) {
    const words = text.split(/\s+/);
    const chunks = [];
    
    for (let i = 0; i < words.length; i += wordsPerChunk) {
      const chunkWords = words.slice(i, i + wordsPerChunk);
      chunks.push({
        text: chunkWords.join(' '),
        wordCount: chunkWords.length,
      });
    }
    
    return chunks;
  }

  /**
   * Search article content using RAG (Retrieval Augmented Generation)
   */
  async searchArticleContent(articleId, query, topK = 5) {
    try {
      // Generate embedding for the query
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: query,
      });
      
      const queryEmbedding = embeddingResponse.data[0].embedding;
      
      // Search for similar chunks using pgvector
      const { data, error } = await supabase
        .rpc('match_article_chunks', {
          query_embedding: queryEmbedding,
          article_id: articleId,
          match_threshold: 0.7,
          match_count: topK,
        });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('RAG search error:', error);
      throw error;
    }
  }

  /**
   * Helper to add delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new PDFService();