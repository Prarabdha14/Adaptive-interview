from langchain_mistralai import ChatMistralAI, MistralAIEmbeddings
from langchain_community.vectorstores import Chroma
from app.core.config import settings

def get_llm():
    return ChatMistralAI(
        model="mistral-large-latest", 
        temperature=0.7, 
        mistral_api_key=settings.MISTRAL_API_KEY
    )

def get_embeddings():
    return MistralAIEmbeddings(mistral_api_key=settings.MISTRAL_API_KEY)

def get_vectorstore():
    return Chroma(
        persist_directory=settings.CHROMA_PERSIST_DIRECTORY,
        embedding_function=get_embeddings()
    )
