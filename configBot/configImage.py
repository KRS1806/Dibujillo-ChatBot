from llama_index.core import Settings, SimpleDirectoryReader, VectorStoreIndex
from llama_index.core.embeddings import resolve_embed_model
from dotenv import load_dotenv
import os
from llama_index.multi_modal_llms.gemini import GeminiMultiModal
from llama_index.core.prompts import PromptTemplate
import base64

def query(message: str, image):
    load_dotenv()
    # Cargar el LLM
    llm = GeminiMultiModal(model_name="models/gemini-1.5-pro", api_key=os.getenv("GEMINI_API_KEY"), temperature=0.5)

    if message.isspace() or not message:
        return "No puedo responder"

    Settings.embed_model = resolve_embed_model(embed_model="local:BAAI/bge-large-en")

    image_data = image.split(",")[1]
    image_binary = base64.b64decode(image_data)

    # Cargar la imagen
    path_dir = os.path.dirname(os.path.abspath(__file__))
    img_url = os.path.join(path_dir, "data/image.png")
    with open(img_url, "wb") as f:
        f.write(image_binary)

    docs = SimpleDirectoryReader(input_files=[img_url]).load_data()

    # Definir el prompt
    prompt = PromptTemplate(
        input_variables="query",
        template="""
        Eres un asistente inteligente el cual puede interpretar texto, imagenes y videos. Sigue estos pasos al generar una respuesta: \n

        1. No alucines con las respuestas. \n
        2. Sé creativo pero sin inventar cosas donde no existen. \n
        3. Intenta dar las respuestas como un ser humano amoroso y creativo.\n
        4. No des más detalles de lo que se te piden
        5. No aceptes otra cosa que no sea una imagen, si te dan algo que no es imagen di: "No puedo responder". \n

        Consejos para responder: \n

        1. Si es borrosa o poco clara la imagen dilo y no inventes cosas, menciona lo que logres reconocer. \n
        2. Intenta usar un lenguaje sencillo y claro. \n
        3. Evita usar simbolos como el: *, +, -, @, etc. \n

        Esta es la pregunta del usuario: {query}
        """,
    )

    # Realizar la consulta
    response = llm.complete(prompt=prompt.format(query=message)+". \nResponde siempre en español", image_documents=docs)

    return str(response)