let socket = null;
const messagesDiv = document.getElementById('messages');
const welcome = document.getElementById('welcome-label');

function initWebSocket() {
socket = new WebSocket("ws://localhost:8000/ws/chat/");
socket.onopen = () => console.log("Conexión WebSocket abierta");
socket.onclose = () => console.log("Conexión WebSocket cerrada");
socket.onerror = (error) => console.error("Error en WebSocket:", error);
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // Mostrar el mensaje del usuario
    if (data.message === ""){
        messagesDiv.innerHTML += '<div class="message-container user"><div class="message-bubble user" style="margin-top: 80px;"><strong>You: </strong>Sin mensaje</div></div>';
        messagesDiv.innerHTML += '<div class="message-container bot"><div class="message-bubble bot"><strong>Bot:</strong> ' + data.response + '</div></div>';
    }
    else{
        messagesDiv.innerHTML += `
        <div class="message-container user">
            <div class="message-bubble user" style="margin-top: 80px;">
            <strong>You:</strong> ${data.message}<br>
            <img src="${data.image}" onclick="openModal(this)" style="max-width: 100px; max-height: 100px; cursor: pointer;">
            </div>
        </div>
        `;
        // Mostrar la respuesta del bot
        messagesDiv.innerHTML += '<div class="message-container bot"><div class="message-bubble bot"><strong>Bot:</strong> ' + data.response + '</div></div>';
    }
    document.getElementById('wait-message').style.display = 'none';
    welcome.style.display = 'none';

    // Limpiar el campo de texto
    document.getElementById('textInput').value = '';

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
};
}

initWebSocket(); 

// Función para abrir el modal y mostrar la imagen en grande
function openModal(image) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("expandedImg");
    modal.style.display = "block";
    modalImg.src = image.src;
}

  // Función para cerrar el modal al hacer clic fuera de la imagen o en la "X"
function closeModal() {
    const modal = document.getElementById("imageModal");
    modal.style.display = "none";
}

// Al hacer clic en el botón de seleccionar imagen
document.getElementById("imageButton").addEventListener("click", () => {
    document.getElementById("imageInput").click();
    localStorage.removeItem("selectedImage"); // Limpiar la imagen de localStorage después de enviar
});

// Al seleccionar la imagen
document.getElementById("imageInput").addEventListener("change", async function(event) {
    const file = event.target.files[0];
    if (file) {
        const base64Image = await convertToBase64(file);
        // Guardar la imagen en localStorage
        localStorage.setItem("selectedImage", base64Image);
        console.log("Imagen guardada en localStorage");
    }
});

// Función para convertir el archivo a Base64
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // Resolución al terminar la carga
        reader.onerror = reject;
        reader.readAsDataURL(file); // Leer la imagen
    });
}

// Función para enviar el mensaje y la imagen cuando se presiona "Enviar"
document.getElementById('chat-form').onsubmit = function(event) {
    event.preventDefault();
    const text = document.getElementById("textInput").value.trim();
    if (!text && !localStorage.getItem("selectedImage")) {
        alert("Escribe un mensaje o selecciona una imagen antes de enviar.");
        return;
    }

    const messageData = {
        message: text,
        image: localStorage.getItem("selectedImage") || null
    };

    // Enviar el mensaje y la imagen al WebSocket si está abierto
    if (localStorage.getItem("selectedImage") == undefined) {
        alert("Selecciona una imagen antes de enviar.");
    } else{
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "text",
                data: messageData
            }));
            console.log("Mensaje y/o imagen enviados:", messageData);
            document.getElementById('wait-message').style.display = 'block'; 
            document.getElementById("textInput").value = ""; // Limpiar el campo de texto
        } else {
            console.error("WebSocket no está abierto.");
        }
    }
}
