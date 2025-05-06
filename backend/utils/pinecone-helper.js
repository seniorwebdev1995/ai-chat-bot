const path = require("path");
const dotenv = require("dotenv");
const { PineconeClient } = require("@pinecone-database/pinecone");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { PineconeStore } = require("langchain/vectorstores/pinecone");
const {
  PINECONE_INDEX_NAME,
  PINECONE_NAME_SPACE,
} = require("../config/pinecone");
const { encode } = require("gpt-tokenizer");
const { getText, getTextFromURL } = require("./helperFunc");
const { loadQAChain } = require("langchain/chains");
const { OpenAIChat } = require("langchain/llms/openai");
const { CallbackManager } = require("langchain/callbacks");
const { PromptTemplate } = require("langchain/prompts");
const { z } = require("zod");
const {
  StructuredOutputParser,
  OutputFixingParser,
} = require("langchain/output_parsers");
const { getSingleText } = require("./scrapData");

dotenv.config({ path: path.join(__dirname, "../.env") });

if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
  throw new Error("Pinecone environment or api key vars missing");
}

const initPinecone = async () => {
  try {
    const pinecone = new PineconeClient();

    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT ?? "", //this is in the dashboard
      apiKey: process.env.PINECONE_API_KEY ?? "",
    });

    console.log("Pinecone database connected successfully");

    return pinecone;
  } catch (error) {
    console.log("error", error);
    throw new Error("Failed to initialize Pinecone Client");
  }
};

const run = async (filePath, url = null) => {
  try {
    const pinecone = await initPinecone();
    const contents =
      url === null ? await getText(filePath) : await getTextFromURL(url);
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 3000,
      chunkOverlap: 500,
    });

    const docs = await textSplitter.splitText(contents);

    let token_count = 0;
    docs.map((doc, idx) => {
      token_count += encode(doc).length;
    });

    const metadatas = docs.map(() => {
      return {
        source:
          url === null ? path.basename(filePath, path.extname(filePath)) : url,
      };
    });

    console.log("creating vector store...");
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

    //embed the PDF documents
    const result = await PineconeStore.fromTexts(docs, metadatas, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: "text",
    });
    console.log("Ingest completed --------");
    return result;
  } catch (error) {
    console.log("error", error);
    throw new Error("Failed to ingest your data");
  }
};

/**
 * @function_name removePineconeData
 * @flag 1: del by all , id: del by id
 * @return none
 * @description delete pinecone database
 */

const removePineconeData = async (del_flag) => {
  try {
    const pinecone = await initPinecone();
    const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name
    await index.delete1({
      deleteAll: true,
      namespace: PINECONE_NAME_SPACE,
    });
    console.log("Pinecone data deleted --------");
  } catch (error) {
    console.log("error", error);
    throw new Error("Failed to delete pinecone data");
  }
};

const isJSON = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

const getMainCourses = async ({ question }) => {
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll("\n", " ");

  try {
    const pinecone = await initPinecone();
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    console.log("starting create vector store -----------");
    /* Create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: "text",
        namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
      }
    );
    console.log("vector store created successfully -----------");

    // Get suitable docs
    let suitableDocs = await vectorStore.similaritySearch(sanitizedQuestion);
    console.log("suitableDocs is : ", suitableDocs);

    const chat_model = new OpenAIChat({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      modelName: "gpt-3.5-turbo",
      verbose: true,
      streaming: true,
      callbackManager: CallbackManager.fromHandlers({
        async handleLLMNewToken(token) {
          console.log(token);
        },
      }),
    });

    const outputParser = StructuredOutputParser.fromZodSchema(
      z
        .array(
          z.object({
            title: z.string().describe("The title of study course"),
            description: z.string().describe("The description of study course"),
          })
        )
        .length(5)
    );
    const outputFixingParser = OutputFixingParser.fromLLM(
      chat_model,
      outputParser
    );

    const prompt = new PromptTemplate({
      template: `Act as assistant chatbot 
      Your name is "RCPC AI Chatbot".
      Some data that you can reference will be provided for this. \n Data:{context}\n
      User ask to you random questions. and you have to analysis this and make study course of five each type with data provided. \n Question: {question}\n
      List five study courses.     
      Output schema like this \n{format_instructions}\n `,
      inputVariables: ["context", "question"],
      partialVariables: {
        format_instructions: outputFixingParser.getFormatInstructions(),
      },
    });

    // Create QA Chain
    const chain = loadQAChain(chat_model, {
      type: "stuff",
      prompt,
      outputParser: outputFixingParser,
    });

    const res = await chain.call({
      input_documents: suitableDocs,
      question: sanitizedQuestion,
    });

    let result;
    if (isJSON(res.text)) {
      result = JSON.stringify(JSON.parse(res.text).items);
      console.log("JSON------------");
    } else {
      result = res.text;
      console.log("not JSON------------");
    }

    const parsed_data = await outputFixingParser.parse(result);
    console.log("parsed_text---------------------", parsed_data);
    const response = {
      text: parsed_data,
      sourceDocuments: suitableDocs,
    };

    return response;
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const getSubTitles = async ({ main_question, sub_question, title }) => {
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = sub_question.trim().replaceAll("\n", " ");

  const prompt = PromptTemplate.fromTemplate(`
  Act as assistant chatbot 
  Your name is "RCPC AI Chatbot".
  Some contents that you can reference will be provided for this.
  You have already made five study course on user's question (${main_question}) before and  the title lists of the study course that you already made are ${title}.
  User provide you a title of random study course. and you have to analysis it and make sub title array(JS array) on five each type with data provided. 
  If title array is not JS array, convert it as JS string array.
  When you make title array, you must never include any title(${title}).
  If there is no a suitable data in provided data, you can use general data.
  Say as only JS string array like this.
      For example : ["title one","title two","title three",title four","title five"]
  There is no need any description in answers.
      
      Context : 
      {context}
      Question: 
      {question}
  `);

  try {
    const pinecone = await initPinecone();
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    /* Create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: "text",
        namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
      }
    );

    // Get suitable docs
    let suitableDocs = await vectorStore.similaritySearch(sanitizedQuestion);
    console.log("suitableDocs is : ", suitableDocs);

    const chat_model = new OpenAIChat({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.6,
      modelName: "gpt-3.5-turbo",
      verbose: true,
      streaming: true,
      callbackManager: CallbackManager.fromHandlers({
        async handleLLMNewToken(token) {
          console.log(token);
        },
      }),
    });

    // Create QA Chain
    const chain = loadQAChain(chat_model, {
      type: "stuff",
      prompt: prompt,
    });

    const res = await chain.call({
      input_documents: suitableDocs,
      question: sanitizedQuestion,
    });

    const response = {
      text: res.text,
      sourceDocuments: suitableDocs,
    };

    return response;
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const socketChat = async (
  { sub_question, main_question },
  socketCallback,
  socketEndCallback
) => {
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = sub_question.trim().replaceAll("\n", " ");

  const prompt = PromptTemplate.fromTemplate(`
    Act as a helper of technical exam for human, especially pilots. Your name is "RCPC AI Chatbot". 
    It will be provided content realted with exam.
    You had already made a title of study course on user's basic question The users' basic question is ${main_question}.
    User will ask you a sub title of the study course as question. 
    
    You have to analysis it and say to user closely with detail information based on user's basic question.
    If you don't find a suitable answer, say with reference in general data.
    The generated sentences should be formatted with markdown and especially all links must be display correctly as markdown. For example: [Link Text](URL).
    Context : 
    {context}
    Question: 
    {question}
  `);

  try {
    const pinecone = await initPinecone();
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    /* Create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: "text",
        namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
      }
    );

    // Get suitable docs
    let suitableDocs = await vectorStore.similaritySearch(sanitizedQuestion);
    console.log("suitableDocs is : ", suitableDocs);

    // Create QA Chain
    const chain = loadQAChain(
      new OpenAIChat({
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.6,
        modelName: "gpt-4",
        verbose: true,
        streaming: true,
        callbackManager: CallbackManager.fromHandlers({
          async handleLLMNewToken(token) {
            socketCallback(token);
            console.log(token);
          },
        }),
      }),
      {
        type: "stuff",
        prompt: prompt,
      }
    );

    const res = await chain.call({
      input_documents: suitableDocs,
      question: sanitizedQuestion,
    });

    const response = {
      text: res.text,
      sourceDocuments: suitableDocs,
    };
    socketEndCallback(response);
    return;
  } catch (error) {
    console.log("error", error);
    return error;
  }
};

const urltest = async (req, res) => {
  console.log("/pineconehelper/urltest called --------");
  const { urls } = req.body;
  console.log(urls);

  try {
    const result = await Promise.all(
      urls.map(async (url) => {
        const response = await getSingleText(url);
        console.log(response);

        const chat_model = new OpenAIChat({
          openAIApiKey: process.env.OPENAI_API_KEY,
          temperature: 0,
          modelName: "gpt-3.5-turbo-16k",
          verbose: true,
          streaming: true,
          callbackManager: CallbackManager.fromHandlers({
            async handleLLMNewToken(token) {
              console.log(token);
            },
          }),
        });
        const DEFAULT_PROMPT = `
          I will provide you contents of news website for remote contol pilots or drone controllers.
          Then you need to get some structured data based on those contents.
          Only reply as these array of JSON structure.
          Select maximum 5 best elements which have good title with detailed description about title.
          If you can not find any information from provided contents, then just reply with empty array.
          Output must be like this structure :
          [
            {
              title : "Title of first news",
              description : "simple description about first news",
              date : "time which news has posted, it must be formatted like this : January 15, 2024"
            },
            {
              title : "Title of second news",
              description : "simple description about second news",
              date : "time which news has posted, it must be formatted like this : January 15, 2024"
            },
              {
              title : "Title of third news",
              description : "simple description about third news",
              date : "time which news has posted, it must be formatted like this : January 15, 2024"
            }
          ]

          -----------------------------------
          Here is provided contents :

          `;

        const modelResponse = await chat_model.call(DEFAULT_PROMPT + response);
        const updatedModelResponse = JSON.parse(modelResponse).map(
          (element) => ({ ...element, url: url })
        );
        console.log(
          "updatedModelResponse --------------- ",
          updatedModelResponse
        );
        return updatedModelResponse;
      })
    );

    console.log("map ended -------------------------");
    console.log(result.flat());
    res.send(result.flat());
  } catch (error) {
    console.error("Error processing URLs:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  initPinecone,
  run,
  removePineconeData,
  getMainCourses,
  getSubTitles,
  socketChat,
  urltest,
};
