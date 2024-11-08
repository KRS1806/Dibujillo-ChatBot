# IMAGE Chatbot 🔎

Gemini-based Multimodal RAG Chatbot for image analysis and querying

## Python Instalation

1. Download the python version according to your OS

    - https://www.python.org/downloads/ 

## Instalation

- Create the environment
```
$ python -m venv venv
```

- Activate the virtual environment

   On Windows:

   ```
    $ .\venv\Scripts\Activate.ps1
    ```

  On MacOS and Linux:

    ```
    $ source venv/Scripts/activate
    ```

- Install all dependencies

```
$ pip install -r requirements.txt
```

## Inserting your API_KEY

- Insert your own Gemini API key in the following path "\ImageChatBot\configBot\.env"
    
    Note: To get said KEY, you need to go to "https://ai.google.dev/gemini-api/docs/api-key"

```
GEMINI_API_KEY = "YOUR_API_KEY"   
```

## Usage

- Run the program in the virtual environment

```
$ python manage.py runserver
```

- Click on the arrow button and select your image
    Note: The bot will not work if you don't give it an image

- Ask the bot your question or indication on the asigned space

## Additional Info

- You must insert your API_KEY in the correct .env file, if not, the program will not run.
  
- Gemini gives a certain amount of tokens for free, once they run out, you must either change accounts or buy more tokens.
